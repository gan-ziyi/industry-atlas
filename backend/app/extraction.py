from __future__ import annotations

import json
import re
from typing import Any

import httpx

from .config import settings
from .db import connection, json_dump, json_load, utc_now


CATEGORY_LABELS = {
    "business": "主营业务",
    "product": "产品与服务",
    "financial": "经营数据",
    "capacity": "产能与项目",
    "customer": "客户与市场",
    "industry": "产业链位置",
    "risk": "主要风险",
}


def _compact_text(value: str) -> str:
    return re.sub(r"\s+", "", value or "")


def parse_json_content(raw: str) -> dict[str, Any]:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.IGNORECASE)
    return json.loads(cleaned)


def validate_findings(result: dict[str, Any], pages: dict[int, str]) -> dict[str, Any]:
    normalized_pages = {number: _compact_text(text) for number, text in pages.items()}
    validated: list[dict[str, Any]] = []
    for index, item in enumerate(result.get("findings") or []):
        if not isinstance(item, dict):
            continue
        category = str(item.get("category") or "business")
        if category not in CATEGORY_LABELS:
            category = "business"
        page_numbers: list[int] = []
        for value in item.get("page_numbers") or []:
            try:
                page = int(value)
            except (TypeError, ValueError):
                continue
            if page in pages and page not in page_numbers:
                page_numbers.append(page)
        quote = str(item.get("quote") or "").strip()
        compact_quote = _compact_text(quote)
        matched_pages = [page for page in page_numbers if compact_quote and compact_quote in normalized_pages[page]]
        try:
            confidence = float(item.get("confidence") or 0)
        except (TypeError, ValueError):
            confidence = 0.0
        validated.append(
            {
                "id": str(item.get("id") or f"finding_{index + 1}"),
                "category": category,
                "category_label": CATEGORY_LABELS[category],
                "title": str(item.get("title") or CATEGORY_LABELS[category])[:160],
                "value": str(item.get("value") or "").strip(),
                "page_numbers": page_numbers,
                "quote": quote,
                "confidence": max(0.0, min(1.0, confidence)),
                "industry_node_hint": str(item.get("industry_node_hint") or "").strip(),
                "citation_status": "matched" if matched_pages else "unmatched",
                "matched_pages": matched_pages,
            }
        )
    return {
        "company": str(result.get("company") or "").strip(),
        "report_period": str(result.get("report_period") or "").strip(),
        "summary": str(result.get("summary") or "").strip(),
        "findings": validated,
        "validation": {
            "total": len(validated),
            "matched": sum(item["citation_status"] == "matched" for item in validated),
            "unmatched": sum(item["citation_status"] == "unmatched" for item in validated),
        },
    }


async def run_document_extraction(extraction_id: str, document_id: str, model: str, focus: str) -> None:
    try:
        with connection() as conn:
            document = conn.execute("SELECT filename FROM documents WHERE id=?", (document_id,)).fetchone()
            chunks = conn.execute("SELECT page_number,text FROM document_chunks WHERE document_id=? ORDER BY page_number", (document_id,)).fetchall()
        pages = {int(row["page_number"]): str(row["text"]) for row in chunks}
        if not pages:
            raise ValueError("文档没有可提取文本，可能需要 OCR")
        page_blocks: list[str] = []
        used = 0
        for page_number, text in pages.items():
            block = f"\n<page number=\"{page_number}\">\n{text}\n</page>"
            if used + len(block) > 180_000:
                break
            page_blocks.append(block)
            used += len(block)
        system = """你是严谨的公司年报研究助手。只返回合法 JSON。每个结论必须提供原文页码和逐字原文摘录；无法从原文确认的内容不要输出。不要把推测写成事实。"""
        user = f"""文件：{document['filename']}\n研究重点：{focus}\n\n原文：{''.join(page_blocks)}\n\n返回严格 JSON：{{"company":"公司名称","report_period":"报告期","summary":"公司业务概览","findings":[{{"id":"唯一ID","category":"business|product|financial|capacity|customer|industry|risk","title":"发现标题","value":"结构化结论，涉及金额时保留单位和报告期","page_numbers":[1],"quote":"与结论直接对应的逐字原文","confidence":0.0,"industry_node_hint":"适合映射的产业环节"}}]}}。最多 30 条，宁缺毋滥。"""
        request_body = {
            "model": model,
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
            "response_format": {"type": "json_object"},
            "thinking": {"type": "enabled"},
        }
        async with httpx.AsyncClient(timeout=180) as client:
            response = await client.post(
                f"{settings.deepseek_base_url}/chat/completions",
                headers={"Authorization": f"Bearer {settings.deepseek_api_key}"},
                json=request_body,
            )
        response.raise_for_status()
        raw = response.json()["choices"][0]["message"]["content"]
        validated = validate_findings(parse_json_content(raw), pages)
        with connection() as conn:
            conn.execute(
                "UPDATE document_extractions SET status='ready',result_json=?,updated_at=? WHERE id=?",
                (json_dump(validated), utc_now(), extraction_id),
            )
    except Exception as exc:
        with connection() as conn:
            conn.execute(
                "UPDATE document_extractions SET status='failed',error=?,updated_at=? WHERE id=?",
                (str(exc)[:1000], utc_now(), extraction_id),
            )


def extraction_response(row: dict[str, Any]) -> dict[str, Any]:
    result_json = row.pop("result_json", None)
    return {**row, "result": json_load(result_json) if result_json else None}
