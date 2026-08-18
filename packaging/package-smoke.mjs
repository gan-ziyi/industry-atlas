import { chromium } from 'file:///C:/Users/ganziyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle' })
await page.waitForSelector('.react-flow__node')
await page.locator('.settings-link').click()
await page.getByText('DeepSeek 本机设置').waitFor()
await page.getByLabel('DeepSeek API Key').waitFor()
await page.screenshot({ path: 'packaging/package-settings-smoke.png', fullPage: true })
if (errors.length) throw new Error(errors.join(' | '))
console.log(JSON.stringify({ nodes: await page.locator('.react-flow__node').count(), desktopSettings: true }))
await browser.close()
