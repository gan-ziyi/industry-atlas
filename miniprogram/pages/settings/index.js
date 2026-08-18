const api = require('../../utils/api')

Page({
  data: { session: null, baseUrl: '', message: '', busy: false, exporting: '', projectTitle: '尚未打开项目', system: { ai_configured: false, ai_model: '', wechat_configured: false } },
  onShow() {
    if (!getApp().requireSession()) return
    const current = api.getCurrentProject().state
    const session = api.getSession()
    this.setData({ session, avatar: String(session.user.display_name || '研').slice(0, 1), baseUrl: api.config().baseUrl, projectTitle: current ? current.projectTitle : '尚未打开项目' })
    api.systemStatus().then(system => this.setData({ system })).catch(() => {})
  },
  input(event) { this.setData({ baseUrl: event.detail.value }) },
  save() { api.setBaseUrl(this.data.baseUrl); this.setData({ message: '后端地址已保存' }) },
  async test() { this.setData({ busy: true, message: '' }); try { api.setBaseUrl(this.data.baseUrl); const result = await api.request('/api/health'); this.setData({ message: `连接正常：${result.service}` }) } catch (reason) { this.setData({ message: reason.message || '连接失败' }) } finally { this.setData({ busy: false }) } },
  openMembers() { wx.navigateTo({ url: '/pages/members/index' }) },
  createWorkspace() {
    if (this.data.busy) return
    wx.showModal({ title: '新建研究空间', editable: true, placeholderText: '例如：新能源研究组', success: async result => {
      const name = String(result.content || '').trim(); if (!result.confirm || !name) return
      this.setData({ busy: true, message: '正在创建研究空间……' })
      try { const workspace = await api.createWorkspace(name); api.selectWorkspace(workspace); const session = api.getSession(); getApp().globalData.session = session; getApp().setProject(null); this.setData({ session, projectTitle: '尚未打开项目', message: '研究空间已创建并切换' }) }
      catch (reason) { this.setData({ message: reason.message || '创建研究空间失败' }) }
      finally { this.setData({ busy: false }) }
    } })
  },
  async bindWechat() {
    if (this.data.busy) return
    this.setData({ busy: true, message: '正在绑定当前微信……' })
    try { await api.bindWechat(); const session = api.getSession(); getApp().globalData.session = session; this.setData({ session, message: '微信账号绑定成功，之后可使用微信快捷登录' }) }
    catch (reason) { this.setData({ message: reason.message || '微信绑定失败' }) }
    finally { this.setData({ busy: false }) }
  },
  async exportProject(event) {
    const format = event.currentTarget.dataset.format
    if (this.data.exporting || !api.getCurrentProject().project) return
    this.setData({ exporting: format, message: `正在生成 ${format.toUpperCase()} 研究报告……` })
    try { await api.openExport(format, { includeEvidence: true, includeTasks: true }); this.setData({ message: '报告已生成，可通过右上角菜单保存或转发' }) }
    catch (reason) { this.setData({ message: reason.message || '导出失败' }) }
    finally { this.setData({ exporting: '' }) }
  },
  logout() { wx.showModal({ title: '退出登录', content: '本机登录会话和当前项目缓存将被清除，云端项目不会删除。', success: result => { if (!result.confirm) return; api.logout(); getApp().globalData.session = null; getApp().globalData.project = null; getApp().globalData.projectState = null; wx.reLaunch({ url: '/pages/login/index' }) } }) }
})
