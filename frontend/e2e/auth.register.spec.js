import { expect, test } from '@playwright/test'

test.describe('E2E-A01 Register Flow', () => {
  test('registers with valid data and redirects to login', async ({ page }) => {
    const stamp = Date.now()
    const unique = `${stamp}`

    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Account created' }),
      })
    })

    await page.goto('/register')

    await page.getByLabel('First name').fill('Play')
    await page.getByLabel('Last name').fill('Writer')
    await page.getByLabel('Username').fill(`pw_user_${unique}`)
    await page.getByLabel('Email address').fill(`pw_${unique}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('Aa123456!')
    await page.getByLabel('Confirm password').fill('Aa123456!')
    await page.getByLabel('Phone').fill('01012345678')

    await page.getByRole('button', { name: 'Submit' }).click()

    await page.waitForURL('**/login')
    await expect(page).toHaveURL(/\/login$/)
  })
})
