import { CheckCircle2, LogIn, LogOut, Server, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { backendUrl, checkHealth, cloudSession, configureBackend, devLogin, loginAccount, logout, registerAccount } from '../api/client'

type Mode = 'login' | 'register' | 'dev'

export function ConnectionDialog({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const session = cloudSession()
  const [url, setUrl] = useState(backendUrl())
  const [mode, setMode] = useState<Mode>('dev')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('研究员')
  const [workspaceName, setWorkspaceName] = useState('我的产业研究空间')
  const [status, setStatus] = useState(session.workspace ? `本机数据空间：${session.workspace.name}` : '本机服务尚未连接')
  const [busy, setBusy] = useState(false)
  const execute = async (action: () => Promise<{ name: string }>) => {
    setBusy(true)
    try { configureBackend(url); const workspace = await action(); setStatus(`登录成功：${workspace.name}`); onChanged() }
    catch (reason) { setStatus(reason instanceof Error ? reason.message : '登录失败') }
    finally { setBusy(false) }
  }
  const test = async () => { setBusy(true); try { configureBackend(url); const result = await checkHealth(); setStatus(`连接正常：${result.service}`) } catch (reason) { setStatus(reason instanceof Error ? reason.message : '连接失败') } finally { setBusy(false) } }
  const submit = () => {
    if (mode === 'login') return execute(() => loginAccount(email.trim(), password))
    if (mode === 'register') return execute(() => registerAccount({ email: email.trim(), password, displayName: name.trim(), workspaceName: workspaceName.trim() }))
    return execute(() => devLogin(name.trim() || '研究员'))
  }
  const signOut = () => { logout(); setStatus('已退出当前研究空间'); onChanged() }
  return <div className="formal-modal"><section className="connection-dialog"><header><div><span>WORKSPACE CONNECTION</span><h2>账号与研究空间</h2></div><button onClick={onClose}><X size={17} /></button></header><div className="connection-body">
    <div className={`connection-banner ${cloudSession().token ? 'connected' : ''}`}>{cloudSession().token ? <CheckCircle2 size={18} /> : <Server size={18} />}<div><strong>{status}</strong><small>研究数据保存在这台电脑；DeepSeek Key 只由本机服务读取，不进入浏览器。</small></div></div>
    <label><span>本机数据服务地址</span><input value={url} onChange={event => setUrl(event.target.value)} placeholder="http://127.0.0.1:8000" /></label>
      {!cloudSession().token && <><div className="account-tabs"><button className={mode === 'dev' ? 'active' : ''} onClick={() => setMode('dev')}>本机使用</button><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>账号登录</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>注册账号</button></div>
      {mode !== 'dev' && <><label><span>邮箱</span><input aria-label="邮箱" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" /></label><label><span>密码</span><input aria-label="密码" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={mode === 'register' ? '至少 10 位' : ''} /></label></>}
      {mode !== 'login' && <label><span>{mode === 'dev' ? '本机使用名称' : '显示名称'}</span><input aria-label={mode === 'dev' ? '本机使用名称' : '显示名称'} value={name} onChange={event => setName(event.target.value)} /></label>}
      {mode === 'register' && <label><span>研究空间名称</span><input aria-label="研究空间名称" value={workspaceName} onChange={event => setWorkspaceName(event.target.value)} /></label>}
    </>}
    <div className="connection-actions"><button onClick={() => void test()} disabled={busy}><Server size={14} />检查本机服务</button>{cloudSession().token ? <button className="danger" onClick={signOut}><LogOut size={14} />退出登录</button> : <button className="primary" onClick={() => void submit()} disabled={busy}>{mode === 'register' ? <UserPlus size={14} /> : <LogIn size={14} />}{mode === 'register' ? '创建账号与空间' : mode === 'dev' ? '进入本机工作台' : '登录研究空间'}</button>}</div>
  </div><footer><span>{mode === 'dev' ? '首次进入后，这台电脑会记住同一个研究空间和历史数据。' : '密码在后端以加盐 scrypt 哈希保存。'}</span><button onClick={onClose}>完成</button></footer></section></div>
}
