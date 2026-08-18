const api = require('./utils/api')

App({
  globalData: {
    session: null,
    project: null,
    projectState: null
  },
  onLaunch() {
    this.globalData.session = api.getSession()
    const cached = api.getCurrentProject()
    this.globalData.project = cached.project
    this.globalData.projectState = cached.state
  },
  requireSession() {
    const session = api.getSession()
    if (!session || !session.token) {
      wx.reLaunch({ url: '/pages/login/index' })
      return null
    }
    this.globalData.session = session
    return session
  },
  setProject(project) {
    this.globalData.project = project
    this.globalData.projectState = project && project.state
    api.saveCurrentProject(project)
  }
})
