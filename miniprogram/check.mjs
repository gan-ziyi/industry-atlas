import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
const required = ['app.js', 'app.json', 'app.wxss', 'project.config.json', 'sitemap.json', 'utils/api.js', 'utils/project.js']
for (const page of app.pages) required.push(`${page}.js`, `${page}.json`, `${page}.wxml`, `${page}.wxss`)
const missing = required.filter(file => !fs.existsSync(path.join(root, file)))
if (missing.length) throw new Error(`缺少小程序文件：${missing.join(', ')}`)

for (const file of required.filter(item => item.endsWith('.json'))) JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
for (const file of required.filter(item => item.endsWith('.js'))) {
  execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' })
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  if (/\b(localStorage|sessionStorage|fetch)\b|\bwindow\s*\./.test(source)) throw new Error(`${file} 使用了浏览器专属 API`)
}

for (const page of app.pages) {
  const wxml = fs.readFileSync(path.join(root, `${page}.wxml`), 'utf8')
  const source = fs.readFileSync(path.join(root, `${page}.js`), 'utf8')
  if (/wx:else-if\s*=/.test(wxml)) throw new Error(`${page}.wxml 使用了无效的 wx:else-if，应使用 wx:elif`)
  const handlers = [...wxml.matchAll(/(?:bind|catch)(?:tap|input|change|confirm|longpress)="([A-Za-z_$][\w$]*)"/g)].map(match => match[1])
  for (const handler of new Set(handlers)) {
    if (!new RegExp(`\\b${handler}\\s*\\(`).test(source) && !new RegExp(`\\b${handler}\\s*:`).test(source)) throw new Error(`${page}.wxml 绑定了不存在的处理函数：${handler}`)
  }
}

const apiSource = fs.readFileSync(path.join(root, 'utils/api.js'), 'utf8')
if (/DEEPSEEK_API_KEY|sk-[A-Za-z0-9]{20,}/.test(apiSource)) throw new Error('小程序 API 客户端包含模型密钥痕迹')
if (!apiSource.includes('wx.request') || !apiSource.includes('wx.login')) throw new Error('小程序 API 客户端缺少微信请求或登录能力')
console.log(`mini program static check passed (${app.pages.length} pages, ${required.length} required files)`)
