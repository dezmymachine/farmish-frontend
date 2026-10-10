import { expect, test, type Page } from '@playwright/test'

/*
 * F2 auth smoke. The form tests need the Firebase web config baked into the
 * build (dev `.env`); bare CI builds render an "unavailable" notice instead,
 * so those tests skip when the notice is present. The emulator flow at the
 * bottom is additionally gated on FARMISH_AUTH_E2E=1 with a build that sets
 * VITE_USE_AUTH_EMULATOR=true and the Auth emulator running on :9099:
 *
 *   VITE_USE_AUTH_EMULATOR=true pnpm build
 *   FARMISH_AUTH_E2E=1 pnpm test:e2e
 */

async function isUnconfigured(page: Page): Promise<boolean> {
  return page.getByText(/Firebase web config is set/).isVisible()
}

test('sign-in page renders with a link to sign-up', async ({ page }) => {
  await page.goto('/sign-in')
  await expect(page.getByRole('heading', { name: 'Sign in to Farmish' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Create an account' })).toBeVisible()
})

test('sign-up page renders with a link to sign-in', async ({ page }) => {
  await page.goto('/sign-up')
  await expect(page.getByRole('heading', { name: 'Join Farmish' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible()
})

test('account redirects logged-out visitors to sign-in', async ({ page }) => {
  await page.goto('/account')
  await expect(page.getByRole('heading', { name: 'Sign in to Farmish' })).toBeVisible()
})

test('sign-in shows all three methods when configured', async ({ page }) => {
  await page.goto('/sign-in')
  test.skip(await isUnconfigured(page), 'Firebase web config not baked into this build')
  await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Email and password' })).toBeVisible()
  await expect(page.getByLabel(/phone \(024 123 4567\)/i)).toBeVisible()
})

test('sign-in validates the email form inline', async ({ page }) => {
  await page.goto('/sign-in')
  test.skip(await isUnconfigured(page), 'Firebase web config not baked into this build')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByText('That email address does not look right.')).toBeVisible()
})

const emulatorE2E = process.env['FARMISH_AUTH_E2E'] === '1'

test.describe('emulator sign-in flow', () => {
  test.skip(!emulatorE2E, 'needs FARMISH_AUTH_E2E=1 with VITE_USE_AUTH_EMULATOR=true build')

  test('email sign-in reaches the account page', async ({ page, request }) => {
    const stamp = String(Date.now())
    const email = `e2e-${stamp}@example.com`
    const password = 'password123'
    const create = await request.post(
      'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key',
      { data: { email, password, returnSecureToken: true } },
    )
    expect(create.ok()).toBe(true)

    await page.goto('/sign-in')
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Your account' })).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
  })
})
