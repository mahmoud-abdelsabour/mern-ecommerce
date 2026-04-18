import { expect, test } from '@playwright/test'

test.describe('E2E-A02 Login Session Flow', () => {
  test('logs in, accesses protected profile route, and stays authenticated after refresh', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'token-for-playwright',
          firstName: 'Play',
          lastName: 'Writer',
          username: 'pw_user',
          email: 'pw_user@example.com',
          phone: '01012345678',
        }),
      })
    })

    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          firstName: 'Play',
          lastName: 'Writer',
          username: 'pw_user',
          email: 'pw_user@example.com',
          phone: '01012345678',
          addresses: [],
        }),
      })
    })

    await page.goto('/login')

    await page.getByLabel('Email address').fill('pw_user@example.com')
    await page.getByLabel('Password').fill('Aa123456!')
    await page.getByRole('button', { name: 'Submit' }).click()

    await page.waitForURL('**/')
    await expect(page).toHaveURL(/\/$/)

    await page.goto('/me')
    await expect(page).toHaveURL(/\/me$/)
    await expect(page.getByText('Profile').first()).toBeVisible()

    await page.reload()

    await expect(page).toHaveURL(/\/me$/)
    await expect(page.getByText('Profile').first()).toBeVisible()
  })
})
