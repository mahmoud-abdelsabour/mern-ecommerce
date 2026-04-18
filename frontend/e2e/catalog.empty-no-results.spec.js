import { expect, test } from '@playwright/test'

const productsSeed = [
  {
    _id: 'prod-a1',
    name: 'Apple Bud Core',
    price: 99,
    rating: { score: 4.1 },
    brand: { slug: 'apple', name: 'Apple' },
    category: { slug: 'audio', name: 'Audio' },
    photos: ['https://cdn.example.com/a1.jpg'],
  },
  {
    _id: 'prod-s1',
    name: 'Sony Pulse Mini',
    price: 129,
    rating: { score: 4.4 },
    brand: { slug: 'sony', name: 'Sony' },
    category: { slug: 'audio', name: 'Audio' },
    photos: ['https://cdn.example.com/s1.jpg'],
  },
]

test.describe('E2E-B03 Catalog empty and no-results states', () => {
  test('shows no-results state and recovers to non-empty list after clearing filters', async ({ page }) => {
    const pageErrors = []
    page.on('pageerror', (error) => pageErrors.push(String(error?.message ?? error)))

    await page.route('**/api/brands', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          brands: [
            { _id: 'b-apple', slug: 'apple', name: 'Apple' },
            { _id: 'b-sony', slug: 'sony', name: 'Sony' },
          ],
        }),
      })
    })

    await page.route('**/api/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [{ _id: 'c-audio', slug: 'audio', name: 'Audio' }],
        }),
      })
    })

    await page.route('**/api/products**', async (route) => {
      const requestUrl = new URL(route.request().url())
      const search = (requestUrl.searchParams.get('search') ?? '').trim().toLowerCase()
      const limit = Number(requestUrl.searchParams.get('limit') ?? 12)
      const pageNum = Number(requestUrl.searchParams.get('page') ?? 1)

      const filtered = search
        ? productsSeed.filter((p) => p.name.toLowerCase().includes(search))
        : productsSeed

      const startIndex = (pageNum - 1) * limit
      const products = filtered.slice(startIndex, startIndex + limit)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products,
          pagination: {
            currentPage: pageNum,
            limit,
            totalProducts: filtered.length,
            totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
            hasNextPage: startIndex + limit < filtered.length,
            hasPrevPage: pageNum > 1,
          },
        }),
      })
    })

    await page.goto('/catalog')

    await expect(page.getByText('Apple Bud Core')).toBeVisible()
    await expect(page.getByText('Sony Pulse Mini')).toBeVisible()
    await expect(page.getByText("It's all quiet here")).not.toBeVisible()

    await page.getByPlaceholder('Search products, brands, categories...').first().fill('zzzz-not-found')
    await page.getByRole('button', { name: 'Search catalog' }).first().click()

    await expect(page).toHaveURL(/search=zzzz-not-found/)
    await expect(page.getByText("It's all quiet here")).toBeVisible()
    await expect(page.getByText('No matched products found')).toBeVisible()
    await expect(page.getByText('0 products')).toBeVisible()
    await expect(page.getByText('Failed to load products')).not.toBeVisible()

    await page.getByRole('button', { name: 'Clear' }).first().click()

    await expect(page).toHaveURL(/\/catalog\?/)
    await expect(page).not.toHaveURL(/search=/)
    await expect(page.getByText("It's all quiet here")).not.toBeVisible()
    await expect(page.getByText('Apple Bud Core')).toBeVisible()
    await expect(page.getByText('Sony Pulse Mini')).toBeVisible()

    expect(pageErrors).toEqual([])
  })
})
