const api = require('../../utils/api')

Page({
  data: { documents: [], project: null, readOnly: false, busy: false, message: '' },
  onShow() {
    if (!getApp().requireSession()) return
    const current = api.getCurrentProject().project
    if (!current) { wx.showToast({ title: '请先打开项目', icon: 'none' }); wx.switchTab({ url: '/pages/projects/index' }); return }
    this.setData({ project: current, readOnly: api.getSession().workspace.role === 'viewer' }); this.load()
  },
  async load() { this.setData({ busy: true }); try { const documents = await api.listDocuments(); this.setData({ documents: documents.map(item => ({ ...item, statusLabel: statusName(item.status) })), message: '' }) } catch (reason) { this.setData({ message: reason.message || '加载资料失败' }) } finally { this.setData({ busy: false }) } },
  choosePdf() {
    if (this.data.readOnly || this.data.busy) return
    wx.chooseMessageFile({ count: 1, type: 'file', extension: ['pdf'], success: async result => {
      const file = result.tempFiles[0]
      if (!file || !file.name.toLowerCase().endsWith('.pdf')) { wx.showToast({ title: '请选择 PDF 文件', icon: 'none' }); return }
      this.setData({ busy: true, message: `正在上传 ${file.name}` })
      try { const uploaded = await api.uploadPdf(file.path, file.name); this.setData({ message: '上传完成，正在解析 PDF' }); const document = await api.waitDocument(uploaded.id); this.setData({ message: document.status === 'ready' ? 'PDF 解析完成' : document.error || '解析完成但需要检查' }); await this.load() }
      catch (reason) { this.setData({ message: reason.message || '上传失败' }) }
      finally { this.setData({ busy: false }) }
    } })
  },
  async ocr(event) {
    if (this.data.readOnly) return
    const id = event.currentTarget.dataset.id; this.setData({ busy: true, message: '正在运行本地 OCR' })
    try { await api.startOcr(id); await api.waitDocument(id); this.setData({ message: 'OCR 处理完成' }); await this.load() } catch (reason) { this.setData({ message: reason.message || 'OCR 失败' }) } finally { this.setData({ busy: false }) }
  },
  async extract(event) {
    if (this.data.readOnly) return
    const document = this.data.documents.find(item => item.id === event.currentTarget.dataset.id); this.setData({ busy: true, message: '正在创建 AI 提取任务' })
    try { const task = await api.startExtraction(document.id); wx.navigateTo({ url: `/pages/extraction/index?id=${encodeURIComponent(task.id)}&documentId=${encodeURIComponent(document.id)}&filename=${encodeURIComponent(document.filename)}` }) }
    catch (reason) { this.setData({ message: reason.message || '无法启动 AI 提取' }) }
    finally { this.setData({ busy: false }) }
  }
})

function statusName(status) { return ({ processing: '解析中', ready: '可研究', failed: '解析失败', ocr_processing: 'OCR 中', ocr_failed: 'OCR 需检查' })[status] || status }
