import { expect, test } from '@playwright/test'

test.describe('E2E-G01 Global navigation and route fallbacks', () => {
  test('keeps app shell stable across nav routes and recovers from unmatched route fallback', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      const method = route.request().method()
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
        return
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) })
    })

    await page.route('**/api/brands', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ brands: [{ _id: 'b1', id: 'b1', slug: 'orbit', name: 'Orbit' }] }),
      })
    })

    await page.route('**/api/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ categories: [{ _id: 'c1', id: 'c1', slug: 'bags', name: 'Bags' }] }),
      })
    })

    await page.route('**/api/cart', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })

    await page.route('**/api/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [], pagination: { totalProducts: 0, totalPages: 1, currentPage: 1 } }),
      })
    })

    await page.goto('/')

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByPlaceholder('Search products, brands, categories...').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'logo' })).toBeVisible()

    await page.getByLabel('Open cart').click()
    await expect(page).toHaveURL(/\/cart$/)
    await expect(page.getByLabel('Open wishlist')).toBeVisible()

    await page.getByLabel('Open wishlist').click()
    await expect(page).toHaveURL(/\/wishlist$/)
    await expect(page.getByLabel('Open cart')).toBeVisible()

    await page.getByRole('link', { name: 'Orders' }).click()
    await expect(page).toHaveURL(/\/orders$/)
    await expect(page.getByText('Login required')).toBeVisible()

    await page.getByRole('link', { name: 'logo' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Shop by category')).toBeVisible()

    await page.goto('/this-route-does-not-exist')

    await expect(page).toHaveURL(/\/this-route-does-not-exist$/)
    await expect(page.getByText('404 Not Found')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.getByLabel('Open wishlist')).toBeVisible()

    await page.getByRole('link', { name: 'Home' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Shop by category')).toBeVisible()
  })
})
