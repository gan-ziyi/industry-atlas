const api = require('../../utils/api')

Page({
  data: { session: null, members: [], email: '', roles: ['编辑者', '查看者'], roleValues: ['editor', 'viewer'], roleIndex: 0, busy: false, message: '' },
  onShow() { if (getApp().requireSession()) this.load() },
  async load() {
    this.setData({ busy: true, message: '' })
    try {
      const session = api.getSession(), members = await api.listMembers(session.workspace.id)
      this.setData({ session, members: members.map(item => ({ ...item, avatar: String(item.display_name || '研').slice(0, 1), roleLabel: roleLabel(item.role), roleIndex: item.role === 'viewer' ? 1 : 0 })) })
    } catch (reason) { this.setData({ message: reason.message || '成员加载失败' }) }
    finally { this.setData({ busy: false }) }
  },
  emailInput(event) { this.setData({ email: event.detail.value }) },
  rolePick(event) { this.setData({ roleIndex: Number(event.detail.value) }) },
  async add() {
    const email = this.data.email.trim()
    if (!email || this.data.busy || this.data.session.workspace.role !== 'owner') return
    this.setData({ busy: true, message: '正在添加成员……' })
    try { await api.addMember(email, this.data.roleValues[this.data.roleIndex]); this.setData({ email: '' }); await this.load(); this.setData({ message: '成员已加入研究空间' }) }
    catch (reason) { this.setData({ message: reason.message || '添加成员失败' }) }
    finally { this.setData({ busy: false }) }
  },
  async changeRole(event) {
    if (this.data.session.workspace.role !== 'owner') return
    const memberId = event.currentTarget.dataset.id, role = this.data.roleValues[Number(event.detail.value)]
    this.setData({ busy: true })
    try { await api.updateMember(memberId, role); await this.load(); this.setData({ message: '成员权限已更新' }) }
    catch (reason) { this.setData({ message: reason.message || '权限更新失败' }) }
    finally { this.setData({ busy: false }) }
  },
  remove(event) {
    if (this.data.session.workspace.role !== 'owner') return
    const member = this.data.members.find(item => item.id === event.currentTarget.dataset.id)
    wx.showModal({ title: '移除空间成员', content: `确定移除“${member.display_name}”吗？不会删除其个人账号。`, confirmColor: '#b64f48', success: async result => {
      if (!result.confirm) return
      this.setData({ busy: true })
      try { await api.removeMember(member.id); await this.load(); this.setData({ message: '成员已移除' }) }
      catch (reason) { this.setData({ message: reason.message || '移除失败' }) }
      finally { this.setData({ busy: false }) }
    } })
  }
})

function roleLabel(role) { return ({ owner: '所有者', editor: '编辑者', viewer: '查看者' })[role] || role }
