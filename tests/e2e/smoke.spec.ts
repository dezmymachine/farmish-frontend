import { expect, test } from '@playwright/test'

test('home renders SSR with the API health badge', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: "Ghana's agricultural marketplace" })).toBeVisible()
  // Presence only: CI runs without a backend, so the badge may read "unreachable".
  await expect(page.getByTestId('health-badge')).toBeVisible()
})
