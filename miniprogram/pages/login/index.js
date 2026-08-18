const api = require('../../utils/api')

Page({
  data: { mode: 'local', emailAction: 'login', baseUrl: '', email: '', password: '', displayName: '本地研究员', workspaceName: '我的产业研究空间', busy: false, message: '' },
  onLoad() {
    const baseUrl = api.config().baseUrl
    let message = ''
    try {
      const platform = wx.getSystemInfoSync().platform
      if (platform !== 'devtools' && /^http:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/i.test(baseUrl)) message = '手机不能直接连接电脑的 127.0.0.1。真机调试时，请把后端地址改为电脑在同一 Wi-Fi 下的地址。'
    } catch (_) {}
    this.setData({ baseUrl, message })
    if (api.getSession()) wx.switchTab({ url: '/pages/projects/index' })
  },
  setMode(event) { this.setData({ mode: event.currentTarget.dataset.mode, message: '' }) },
  toggleEmailAction() { this.setData({ emailAction: this.data.emailAction === 'login' ? 'register' : 'login', message: '' }) },
  field(event) { this.setData({ [event.currentTarget.dataset.field]: event.detail.value }) },
  saveServer() { api.setBaseUrl(this.data.baseUrl); this.setData({ message: '后端地址已保存' }) },
  async login() {
    if (this.data.busy) return
    api.setBaseUrl(this.data.baseUrl); this.setData({ busy: true, message: '' })
    try {
      if (this.data.mode === 'wechat') await api.wechatLogin(this.data.displayName)
      else if (this.data.mode === 'local') await api.devLogin(this.data.displayName)
      else if (this.data.emailAction === 'register') await api.emailRegister(this.data.email.trim(), this.data.password, this.data.displayName.trim(), this.data.workspaceName.trim())
      else await api.emailLogin(this.data.email.trim(), this.data.password)
      getApp().globalData.session = api.getSession()
      wx.switchTab({ url: '/pages/projects/index' })
    } catch (reason) { this.setData({ message: reason.message || '登录失败，请检查后端配置' }) }
    finally { this.setData({ busy: false }) }
  }
})
