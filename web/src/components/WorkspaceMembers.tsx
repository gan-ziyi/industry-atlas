import { RefreshCw, Shield, Trash2, UserPlus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { addWorkspaceMember, cloudSession, listWorkspaceMembers, removeWorkspaceMember, updateWorkspaceMember } from '../api/client'
import type { CloudMember } from '../types'

const roleLabel = { owner: '所有者', editor: '编辑者', viewer: '查看者' }

export function WorkspaceMembers({ connected }: { connected: boolean }) {
  const [members, setMembers] = useState<CloudMember[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'editor' | 'viewer'>('editor')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const session = cloudSession()
  const canManage = session.workspace?.role === 'owner' || members.some(member => member.id === session.workspace?.user?.id && member.role === 'owner')
  const load = async () => { if (!connected) return; setBusy(true); try { setMembers(await listWorkspaceMembers()); setStatus('') } catch (reason) { setStatus(reason instanceof Error ? reason.message : '加载失败') } finally { setBusy(false) } }
  useEffect(() => { void load() }, [connected])
  const add = async () => { if (!email.trim()) return; setBusy(true); try { await addWorkspaceMember(email.trim(), role); setEmail(''); await load(); setStatus('成员已加入研究空间') } catch (reason) { setStatus(reason instanceof Error ? reason.message : '添加失败'); setBusy(false) } }
  const changeRole = async (member: CloudMember, next: 'editor' | 'viewer') => { setBusy(true); try { await updateWorkspaceMember(member.id, next); await load(); setStatus(`已将 ${member.display_name} 设为${roleLabel[next]}`) } catch (reason) { setStatus(reason instanceof Error ? reason.message : '修改失败'); setBusy(false) } }
  const remove = async (member: CloudMember) => { if (!window.confirm(`确定移除“${member.display_name}”吗？`)) return; setBusy(true); try { await removeWorkspaceMember(member.id); await load(); setStatus('成员已移除') } catch (reason) { setStatus(reason instanceof Error ? reason.message : '移除失败'); setBusy(false) } }
  if (!connected) return <section className="members-page empty-page"><Users size={34} /><h2>连接研究空间后管理团队</h2><p>正式账号登录后，可以邀请已注册用户并分配编辑或只读权限。</p></section>
  return <section className="members-page"><header><div><span>WORKSPACE TEAM</span><h1>团队与权限</h1><p>{session.workspace?.name} · 成员可共享产业图谱、公司主档与研究资料。</p></div><button onClick={() => void load()} disabled={busy}><RefreshCw size={15} />刷新</button></header>
    {canManage && <div className="member-invite"><div><UserPlus size={19} /><div><strong>邀请已有账号</strong><small>对方需先用邮箱完成注册</small></div></div><input aria-label="成员邮箱" type="email" placeholder="researcher@example.com" value={email} onChange={event => setEmail(event.target.value)} /><select aria-label="新成员角色" value={role} onChange={event => setRole(event.target.value as 'editor' | 'viewer')}><option value="editor">编辑者</option><option value="viewer">查看者</option></select><button className="primary" onClick={() => void add()} disabled={busy}>添加成员</button></div>}
    {status && <div className="member-status">{status}</div>}
    <div className="member-list"><div className="member-list-head"><span>成员</span><span>角色</span><span>权限</span><span /></div>{members.map(member => <article key={member.id}><div className="member-person"><i>{member.display_name.slice(0, 1)}</i><div><strong>{member.display_name}</strong><small>{member.email || '开发账号 · 无邮箱'}</small></div></div><div>{member.role === 'owner' || !canManage ? <span className={`role-pill ${member.role}`}><Shield size={13} />{roleLabel[member.role]}</span> : <select aria-label={`${member.display_name}角色`} value={member.role} onChange={event => void changeRole(member, event.target.value as 'editor' | 'viewer')}><option value="editor">编辑者</option><option value="viewer">查看者</option></select>}</div><small>{member.role === 'owner' ? '管理成员与全部内容' : member.role === 'editor' ? '可编辑并同步项目' : '仅查看研究内容'}</small><div>{canManage && member.role !== 'owner' && <button className="icon-danger" aria-label={`移除${member.display_name}`} onClick={() => void remove(member)}><Trash2 size={15} /></button>}</div></article>)}</div>
  </section>
}
