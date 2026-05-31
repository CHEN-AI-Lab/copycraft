import { test, expect } from '@playwright/test'

test.describe('CopyCraft', () => {
  test('loads the homepage', async ({ page }) => {
    await page.goto('/zh-CN')
    await expect(page.locator('h1')).toContainText('文案宝')
    await expect(page.locator('h2')).toContainText('让你的内容更出彩')
  })

  test('language switch works', async ({ page }) => {
    await page.goto('/zh-CN')
    await page.click('text=English')
    await expect(page.locator('text=CopyCraft')).toBeVisible()
    await page.click('text=中文')
    await expect(page.locator('text=文案宝')).toBeVisible()
  })

  test('generate button is disabled without input', async ({ page }) => {
    await page.goto('/zh-CN')
    const btn = page.locator('button:has-text("生成文案")')
    await expect(btn).toBeDisabled()
  })

  test('platform selection works', async ({ page }) => {
    await page.goto('/zh-CN')
    const platforms = ['朋友圈', '小红书', '微博', '知乎', '抖音']
    for (const p of platforms) {
      await page.click(`text=${p}`)
      await expect(page.locator(`text=${p}`)).toHaveClass(/bg-blue-500/)
    }
  })
})