import { chromium } from 'file:///C:/Users/ganziyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
let companySyncCalls = 0;
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => {
  localStorage.setItem('industry-atlas-cloud-config-v1', JSON.stringify({ baseUrl: 'http://127.0.0.1:8999' }));
  localStorage.setItem('industry-atlas-cloud-project-map-v1', JSON.stringify({ 'http://127.0.0.1:8000|ws1|ai-compute': 'project1', 'http://127.0.0.1:8999|ws1|ai-compute': 'project1' }));
  sessionStorage.setItem('industry-atlas-cloud-token-session', 'test-token');
  sessionStorage.setItem('industry-atlas-cloud-workspace-session', JSON.stringify({ id: 'ws1', name: '测试研究空间' }));
});
await page.route('**/api/documents/doc1/extractions', route => route.fulfill({
  status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'ext1', status: 'processing' }),
}));
await page.route('**/api/document-extractions/ext1', route => route.fulfill({
  status: 200, contentType: 'application/json', body: JSON.stringify({
    id: 'ext1', status: 'ready', result: {
      company: '示例科技股份有限公司', report_period: '2025 年度', summary: '公司重点布局 AI 光互连与高速光模块。',
      validation: { matched: 2, unmatched: 1, total: 3 },
      findings: [
        { id: 'f1', category: 'business', category_label: '主营业务', title: '主营业务', value: '高速光模块', quote: '公司重点布局高速光模块产品。', page_numbers: [12], matched_pages: [12], confidence: 0.95, citation_status: 'matched' },
        { id: 'f2', category: 'financial', category_label: '经营数据', title: '营业收入', value: '100 亿元', quote: '报告期内实现营业收入100亿元。', page_numbers: [36], matched_pages: [36], confidence: 0.92, citation_status: 'matched' },
        { id: 'f3', category: 'risk', category_label: '主要风险', title: '客户集中风险', value: '客户集中度较高', quote: '模型生成但原文未匹配。', page_numbers: [80], matched_pages: [], confidence: 0.62, citation_status: 'unmatched' },
      ],
    },
  }),
}));
await page.route(/\/api\/documents\?.*/, route => route.fulfill({
  status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'doc1', workspace_id: 'ws1', project_id: 'project1', filename: '示例公司2025年报.pdf', status: 'ready', error: null, page_count: 100, char_count: 200000, needs_ocr: 0, ocr_page_count: 0, table_count: 1, extraction_mode: 'text', extraction_count: 1, updated_at: new Date().toISOString() }]),
}));
await page.route('**/api/documents/doc1/tables', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'table1', page_number: 36, table_number: 1, row_count: 3, column_count: 3, data: [['项目', '2025年', '2024年'], ['营业收入', '100亿元', '80亿元'], ['同比增长', '25%', '10%']] }]) }));
await page.route('**/api/companies/sync', async route => {
  companySyncCalls += 1;
  const payload = route.request().postDataJSON();
  const records = payload.companies.map((data, index) => ({ id: `cloud_${index}`, workspace_id: 'ws1', name: data.name, data }));
  records.push({ id: 'cloud_remote', workspace_id: 'ws1', name: '云端共享公司', data: { name: '云端共享公司', reportPeriod: '2025 年度', summary: '来自工作空间其他项目', documents: [], findings: [], periods: [], mappings: [{ projectId: 'other_project', nodeTitle: '光模块', status: 'confirmed', score: 100, reason: '其他项目人工确认' }] } });
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ created: 1, updated: records.length - 1, skipped: 0, companies: records }) });
});
await page.route('**/api/projects/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'project1' }) }));
await page.route('**/api/projects/project1/export?**', route => route.fulfill({ status: 200, headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': "attachment; filename*=UTF-8''report.docx" }, body: 'mock-docx' }));
await page.goto('http://127.0.0.1:8999/index.html');
await page.evaluate(() => { lastProcessedDocument = { id: 'doc1', filename: '示例公司2025年报.pdf', nodeId: selected, cloudProjectId: 'project1', pageCount: 100, charCount: 200000 }; document.querySelector('#documentExtract').disabled = false; });
await page.evaluate(() => document.querySelector('#documentExtract').click());
await page.waitForSelector('#extractionModal.open');
await page.waitForSelector('.extraction-item');
if (await page.locator('.extraction-item').count() !== 3) throw new Error('提取结果数量不正确');
if (await page.locator('#extractionList input:checked').count() !== 2) throw new Error('默认选择必须只包含原文匹配条目');
await page.selectOption('#extractionCategory', 'financial');
await page.locator('#extractionList input').uncheck();
await page.selectOption('#extractionCategory', 'business');
if (await page.locator('#extractionList input:checked').count() !== 1) throw new Error('跨分类选择状态丢失');
await page.screenshot({ path: 'C:/Users/ganziyi/.codex/visualizations/2026/08/05/019fd254-3f66-7ce2-9b24-af75258d2016/annual-report-extraction.png', fullPage: true });
await page.click('#acceptExtraction');
await page.waitForFunction(() => !document.querySelector('#extractionModal').classList.contains('open'));
if (!(await page.locator('body').textContent()).includes('示例公司2025年报.pdf · 主营业务')) throw new Error('选中发现未写入节点资料');
await page.evaluate(() => document.querySelector('[data-nav="companies"]').click());
await page.waitForSelector('#companiesModal.open');
if (!(await page.locator('#companyDetail').textContent()).includes('示例科技股份有限公司')) throw new Error('公司档案未自动生成');
if (!(await page.locator('#companyDetail').textContent()).includes('光模块')) throw new Error('产业节点映射候选未生成');
await page.locator('[data-mapping-status="confirmed"]').first().click();
await page.evaluate(() => {
  for (const period of [{ id: 'ext_2024', name: '2024 年度', value: '80 亿元' }, { id: 'ext_2025', name: '2025 年度', value: '100 亿元' }]) {
    currentExtraction = { id: period.id, result: { company: '示例科技股份有限公司', report_period: period.name, summary: `${period.name}经营情况` } };
    registerCompanyFromExtraction([{ id: `revenue_${period.id}`, category: 'financial', category_label: '经营数据', title: '营业收入', value: period.value, quote: `报告期营业收入${period.value}`, matched_pages: [36], citation_status: 'matched' }], selected);
  }
  saveState(); renderCompanyList();
});
if (await page.locator('.period-card').count() < 2) throw new Error('多期年报档案未生成');
if (!(await page.locator('.metric-table').textContent()).includes('80 亿元')) throw new Error('经营指标时间序列未生成');
await page.waitForTimeout(250);
await page.screenshot({ path: 'C:/Users/ganziyi/.codex/visualizations/2026/08/05/019fd254-3f66-7ce2-9b24-af75258d2016/company-mapping-workbench.png', fullPage: true });
await page.click('#createCompany');
await page.fill('#companyName', '手动新增公司');
await page.fill('#companyPeriod', '2025 年度');
await page.fill('#companySummary', '用于验证人工维护公司档案');
await page.click('#companyForm button[type="submit"]');
await page.waitForFunction(() => !document.querySelector('#companyEditorModal').classList.contains('open'));
if (!(await page.locator('#companyList').textContent()).includes('手动新增公司')) throw new Error('手动公司档案未保存');
await page.click('#addManualCompanyMapping');
if (!(await page.locator('#companyDetail').textContent()).includes('研究员手动确认')) throw new Error('手动产业映射未保存');
await page.evaluate(() => {
  const manual = companyData.find(company => company.name === '手动新增公司');
  manual.findings.push({ id: 'manual_revenue', category: 'financial', category_label: '经营数据', title: '营业收入', value: '60 亿元', reportPeriod: '2025 年度', quote: '营业收入60亿元', matched_pages: [20], citation_status: 'matched' });
  companyCompareSelection.clear();
  companyCompareSelection.add(companyData.find(company => company.name === '示例科技股份有限公司').id);
  companyCompareSelection.add(manual.id);
  renderCompanyList();
});
if (await page.locator('#openCompanyCompare').isDisabled()) throw new Error('选择两家公司后对比入口仍不可用');
await page.click('#openCompanyCompare');
await page.waitForSelector('#companyCompareModal.open');
const companyComparisonText = await page.locator('#companyComparisonTable').textContent();
if (!companyComparisonText.includes('示例科技股份有限公司') || !companyComparisonText.includes('手动新增公司')) throw new Error('公司对比未显示选中公司');
if (!companyComparisonText.includes('100 亿元') || !companyComparisonText.includes('60 亿元')) throw new Error('公司经营指标对比未生成');
if (!companyComparisonText.includes('证据完整度')) throw new Error('公司证据完整度未生成');
await page.waitForTimeout(300);
await page.screenshot({ path: 'C:/Users/ganziyi/.codex/visualizations/2026/08/05/019fd254-3f66-7ce2-9b24-af75258d2016/company-comparison.png', fullPage: true });
await page.click('#closeCompanyCompare');
const selectedNodeTitle = await page.evaluate(() => nodes[selected].title);
const masterPayload = {
  schema: 'industry-atlas-company-master', version: 1, companies: [
    { name: '示例科技股份有限公司', reportPeriod: '2023 年度', summary: '导入时不覆盖已有摘要', documents: [], findings: [{ id: 'old_revenue', category: 'financial', title: '营业收入', value: '70 亿元', reportPeriod: '2023 年度' }], periods: [{ period: '2023 年度', summary: '历史期间', documents: [], findingIds: ['old_revenue'] }], mappings: [] },
    { name: '跨项目公司', reportPeriod: '2025 年度', summary: '从其他项目导入的公司主档', documents: [], findings: [], periods: [], mappings: [{ nodeTitle: selectedNodeTitle, status: 'confirmed', score: 100, reason: '外部项目人工确认' }] }
  ]
};
await page.setInputFiles('#companyImportFile', { name: 'company-master.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(masterPayload)) });
await page.waitForFunction(() => companyData.some(company => company.name === '跨项目公司'));
const importedState = await page.evaluate(() => ({
  count: companyData.length,
  mergedPeriod: companyData.find(company => company.name === '示例科技股份有限公司').periods.some(period => period.period === '2023 年度'),
  remapped: companyData.find(company => company.name === '跨项目公司').mappings.some(mapping => mapping.nodeId === selected)
}));
if (importedState.count < 3 || !importedState.mergedPeriod || !importedState.remapped) throw new Error('公司主档跨项目合并或节点重映射失败');
const companyMasterDownloadPromise = page.waitForEvent('download');
await page.click('#exportCompanies');
const masterDownload = await companyMasterDownloadPromise;
if (!masterDownload.suggestedFilename().endsWith('-公司主档.json')) throw new Error('公司主档导出文件名不正确');
await page.click('#syncCompanyMaster');
await page.waitForFunction(() => companyData.some(company => company.name === '云端共享公司'));
const cloudMasterState = await page.evaluate(() => ({
  remapped: companyData.find(company => company.name === '云端共享公司').mappings.some(mapping => nodes[mapping.nodeId]?.title === '光模块'),
  buttonReady: !document.querySelector('#syncCompanyMaster').disabled
}));
if (companySyncCalls < 1 || !cloudMasterState.remapped || !cloudMasterState.buttonReady) throw new Error('工作空间云端公司主档同步失败');
await page.evaluate(() => {
  const company = companyData.find(item => item.name === '跨项目公司');
  const nodeId = Object.keys(nodes).find(id => id !== selected && nodes[id].type !== 'draft');
  company.mappings.push({ id: 'batch_review_mapping', nodeId, status: 'suggested', score: 76, reason: '用于验证批量审核工作台' });
  renderCompanyList();
});
if (await page.locator('#mappingReviewCount').textContent() === '0') throw new Error('批量映射审核计数未更新');
await page.click('#openMappingReview');
await page.waitForSelector('#mappingReviewModal.open');
if (!(await page.locator('#mappingReviewList').textContent()).includes('用于验证批量审核工作台')) throw new Error('批量映射审核列表未渲染');
await page.check('#selectAllMappings');
await page.waitForTimeout(250);
await page.screenshot({ path: 'C:/Users/ganziyi/.codex/visualizations/2026/08/05/019fd254-3f66-7ce2-9b24-af75258d2016/company-mapping-batch-review.png', fullPage: true });
await page.click('#confirmSelectedMappings');
const batchReviewed = await page.evaluate(() => companyData.find(item => item.name === '跨项目公司').mappings.find(mapping => mapping.id === 'batch_review_mapping').status);
if (batchReviewed !== 'confirmed') throw new Error('批量确认没有更新映射状态');
await page.click('#closeMappingReview');
await page.click('#closeCompanies');
if (!(await page.locator('#nodeCompanyList').textContent()).includes('公司')) throw new Error('确认映射未回填节点公司列表');
await page.evaluate(() => document.querySelector('[data-nav="library"]').click());
await page.click('#libraryFilesTab');
await page.waitForSelector('.document-task-row');
if (!(await page.locator('.document-task-row').textContent()).includes('1 次 AI 提取')) throw new Error('文件任务统计未显示');
await page.screenshot({ path: 'C:/Users/ganziyi/.codex/visualizations/2026/08/05/019fd254-3f66-7ce2-9b24-af75258d2016/document-task-center.png', fullPage: true });
await page.click('[data-document-tables="doc1"]');
await page.waitForSelector('#tableModal.open');
if (!(await page.locator('#tablePreview').textContent()).includes('营业收入')) throw new Error('年报表格未正确显示');
await page.waitForTimeout(300);
await page.screenshot({ path: 'C:/Users/ganziyi/.codex/visualizations/2026/08/05/019fd254-3f66-7ce2-9b24-af75258d2016/annual-report-tables.png', fullPage: true });
const csvPromise = page.waitForEvent('download');
await page.click('#downloadTableCsv');
if (!(await csvPromise).suggestedFilename().endsWith('.csv')) throw new Error('表格 CSV 下载文件名不正确');
await page.click('#attachTableToNode');
await page.waitForFunction(() => !document.querySelector('#tableModal').classList.contains('open'));
if (!(await page.locator('body').textContent()).includes('第 36 页表格 1')) throw new Error('表格未写入关联节点');
await page.evaluate(() => openReport());
await page.selectOption('#preciseExportFormat', 'docx');
const downloadPromise = page.waitForEvent('download');
await page.click('#downloadPreciseReport');
const download = await downloadPromise;
if (!download.suggestedFilename().endsWith('.docx')) throw new Error('精准导出文件名不正确');
if (errors.length) throw new Error(`页面错误：${errors.join('; ')}`);
console.log('browser extraction check passed');
await browser.close();
