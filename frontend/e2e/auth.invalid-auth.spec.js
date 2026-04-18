import { expect, test } from '@playwright/test'

test.describe('E2E-A03 Invalid Auth Inputs and API Failures', () => {
  test('shows validation error for invalid email and backend error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email address').fill('user@example.com')
    await page.getByLabel('Password').fill('abc')
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(
      page.getByText('Password must be 8+ chars and include uppercase, lowercase, number, and special character.')
    ).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      })
    })

    await page.getByLabel('Email address').fill('user@example.com')
    await page.getByLabel('Password').fill('Aa123456!')
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(page.getByText('Invalid credentials')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })
})
