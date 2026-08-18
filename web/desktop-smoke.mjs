import { chromium } from 'file:///C:/Users/ganziyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' })
await page.waitForSelector('.react-flow__node', { timeout: 15000 })
const nodes = await page.locator('.react-flow__node').count()
if (nodes < 5) throw new Error(`Only ${nodes} graph nodes were rendered`)
await page.screenshot({ path: 'desktop-smoke.png', fullPage: true })
if (errors.length) throw new Error(errors.join(' | '))
console.log(JSON.stringify({ title: await page.title(), nodes, url: page.url() }))
await browser.close()
