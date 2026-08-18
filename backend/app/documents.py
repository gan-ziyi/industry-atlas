from __future__ import annotations

import uuid
from threading import Lock

import fitz
import pdfplumber
from pypdf import PdfReader
from rapidocr import RapidOCR

from .db import connection, json_dump, utc_now


_ocr_engine: RapidOCR | None = None
_ocr_lock = Lock()


def _tables_from_pdf(storage_path: str, document_id: str, now: str) -> list[tuple[str, str, int, int, int, int, str, str]]:
    found: list[tuple[str, str, int, int, int, int, str, str]] = []
    with pdfplumber.open(storage_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            for table_number, raw_table in enumerate(page.extract_tables() or [], start=1):
                rows = [[(cell or "").strip() for cell in row] for row in raw_table if row]
                rows = [row for row in rows if any(row)]
                if len(rows) < 2:
                    continue
                column_count = max((len(row) for row in rows), default=0)
                if column_count < 2:
                    continue
                rows = [row + [""] * (column_count - len(row)) for row in rows]
                found.append((str(uuid.uuid4()), document_id, page_number, table_number, len(rows), column_count, json_dump(rows), now))
    return found


def extract_pdf(document_id: str, storage_path: str) -> None:
    now = utc_now()
    try:
        reader = PdfReader(storage_path)
        chunks: list[tuple[str, str, int, str, str]] = []
        char_count = 0
        for page_number, page in enumerate(reader.pages, start=1):
            text = (page.extract_text() or "").strip()
            char_count += len(text)
            if text:
                chunks.append((str(uuid.uuid4()), document_id, page_number, text, now))
        tables = _tables_from_pdf(storage_path, document_id, now)
        needs_ocr = char_count < max(80, len(reader.pages) * 20)
        with connection() as conn:
            conn.execute("DELETE FROM document_chunks WHERE document_id=?", (document_id,))
            conn.execute("DELETE FROM document_tables WHERE document_id=?", (document_id,))
            conn.executemany(
                "INSERT INTO document_chunks(id,document_id,page_number,text,created_at) VALUES(?,?,?,?,?)",
                chunks,
            )
            conn.executemany(
                "INSERT INTO document_tables(id,document_id,page_number,table_number,row_count,column_count,data_json,created_at) VALUES(?,?,?,?,?,?,?,?)",
                tables,
            )
            conn.execute(
                "UPDATE documents SET status='ready',page_count=?,char_count=?,needs_ocr=?,table_count=?,extraction_mode='text',error=NULL,updated_at=? WHERE id=?",
                (len(reader.pages), char_count, int(needs_ocr), len(tables), utc_now(), document_id),
            )
    except Exception as exc:  # processing failures must become visible task state
        with connection() as conn:
            conn.execute(
                "UPDATE documents SET status='failed',error=?,updated_at=? WHERE id=?",
                (str(exc)[:1000], utc_now(), document_id),
            )


def ocr_pdf(document_id: str, storage_path: str) -> None:
    global _ocr_engine
    try:
        with _ocr_lock:
            if _ocr_engine is None:
                _ocr_engine = RapidOCR()
        pdf = fitz.open(storage_path)
        with connection() as conn:
            existing = {row["page_number"]: row["text"] for row in conn.execute("SELECT page_number,text FROM document_chunks WHERE document_id=?", (document_id,)).fetchall()}
        page_texts: dict[int, str] = {}
        ocr_pages = 0
        for page_number, page in enumerate(pdf, start=1):
            current = (existing.get(page_number) or "").strip()
            if len(current) >= 80:
                page_texts[page_number] = current
                continue
            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            with _ocr_lock:
                result = _ocr_engine(pixmap.tobytes("png"))
            recognized = "\n".join(result.txts or ()).strip()
            page_texts[page_number] = recognized or current
            if recognized:
                ocr_pages += 1
        pdf.close()
        now = utc_now()
        chunks = [(str(uuid.uuid4()), document_id, page_number, text, now) for page_number, text in page_texts.items() if text]
        char_count = sum(len(text) for text in page_texts.values())
        with connection() as conn:
            conn.execute("DELETE FROM document_chunks WHERE document_id=?", (document_id,))
            conn.executemany("INSERT INTO document_chunks(id,document_id,page_number,text,created_at) VALUES(?,?,?,?,?)", chunks)
            conn.execute("UPDATE documents SET status='ready',char_count=?,needs_ocr=?,ocr_page_count=?,extraction_mode='ocr',error=NULL,updated_at=? WHERE id=?", (char_count, int(char_count < max(80, len(page_texts) * 20)), ocr_pages, utc_now(), document_id))
    except Exception as exc:
        with connection() as conn:
            conn.execute("UPDATE documents SET status='ocr_failed',error=?,updated_at=? WHERE id=?", (str(exc)[:1000], utc_now(), document_id))
