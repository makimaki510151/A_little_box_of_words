import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

await mkdir('/opt/cursor/artifacts', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

await page.addInitScript(() => {
  localStorage.clear()
})

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await page.screenshot({ path: '/opt/cursor/artifacts/01-initial-load.png', fullPage: true })

async function dismissModals() {
  for (let i = 0; i < 3; i += 1) {
    const continueBtn = page.getByRole('button', { name: '続ける' })
    if ((await continueBtn.count()) > 0 && (await continueBtn.first().isVisible())) {
      await continueBtn.first().click()
      await page.waitForTimeout(300)
      continue
    }
    const claimBtn = page.getByRole('button', { name: '受け取る' })
    if ((await claimBtn.count()) > 0 && (await claimBtn.first().isVisible())) {
      await claimBtn.first().click()
      await page.waitForTimeout(300)
      continue
    }
    break
  }
  for (const toast of await page.locator('.toast').all()) {
    await toast.click().catch(() => {})
  }
}

await dismissModals()
await page.screenshot({ path: '/opt/cursor/artifacts/02-main-screen.png', fullPage: true })

const prompt = await page.locator('.prompt-text').innerText()
console.log('PROMPT:', JSON.stringify(prompt))
await page.fill('#typing-input', prompt)
await page.getByRole('button', { name: '入力を確定' }).click()
await page.waitForTimeout(500)
await dismissModals()
await page.screenshot({ path: '/opt/cursor/artifacts/03-after-typing.png', fullPage: true })
const result = await page.locator('.result-banner').innerText().catch(() => 'NO RESULT')
console.log('RESULT:', result)

await page.getByRole('button', { name: '施設', exact: true }).click()
await page.waitForTimeout(300)
const buildBtn = page.getByRole('button', { name: '建設する' }).first()
if (await buildBtn.isEnabled()) {
  await buildBtn.click()
  await page.waitForTimeout(500)
  await dismissModals()
}
await page.screenshot({ path: '/opt/cursor/artifacts/04-facilities.png', fullPage: true })

for (const tab of ['住人', '物語', '図鑑', '実績', '設定']) {
  await dismissModals()
  await page.getByRole('button', { name: tab, exact: true }).click()
  await page.waitForTimeout(250)
}
await page.screenshot({ path: '/opt/cursor/artifacts/05-settings.png', fullPage: true })

const title = await page.locator('.brand-title').innerText()
console.log('TITLE:', title)
await browser.close()
console.log('DONE')
