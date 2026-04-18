import { expect, test } from '@playwright/test'

const makeProduct = (index, { brandSlug = 'apple', brandName = 'Apple', categorySlug = 'audio' } = {}) => ({
  _id: `prod-${index}`,
  name: `${brandName} Bud ${String(index).padStart(2, '0')}`,
  price: index,
  rating: { score: 4.2 },
  brand: { slug: brandSlug, name: brandName },
  category: { slug: categorySlug, name: 'Audio' },
  photos: [`https://cdn.example.com/p${index}.jpg`],
  createdAt: new Date(2026, 0, index).toISOString(),
})

test.describe('E2E-B01 Catalog search/filter/sort/pagination', () => {
  test('applies search, brand filter, sorting, and pagination with URL persistence after refresh', async ({ page }) => {
    const allProducts = [
      ...Array.from({ length: 13 }, (_, i) => makeProduct(i + 1, { brandSlug: 'apple', brandName: 'Apple' })),
      ...Array.from({ length: 3 }, (_, i) => makeProduct(i + 14, { brandSlug: 'sony', brandName: 'Sony' })),
    ]

    const seenQueries = []

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
      const brandRaw = requestUrl.searchParams.get('brand') ?? ''
      const sortRaw = requestUrl.searchParams.get('sort')
      const limit = Number(requestUrl.searchParams.get('limit') ?? 12)
      const pageNum = Number(requestUrl.searchParams.get('page') ?? 1)

      seenQueries.push(requestUrl.search)

      let products = allProducts.filter((product) => product.name.toLowerCase().includes(search))

      const brands = brandRaw
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
      if (brands.length > 0) {
        products = products.filter((product) => brands.includes(product.brand.slug))
      }

      if (sortRaw) {
        const sort = JSON.parse(sortRaw)
        if (Object.prototype.hasOwnProperty.call(sort, 'price')) {
          const direction = Number(sort.price)
          products = [...products].sort((a, b) => (a.price - b.price) * direction)
        }
      }

      const totalProducts = products.length
      const startIndex = (pageNum - 1) * limit
      const pagedProducts = products.slice(startIndex, startIndex + limit)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: pagedProducts,
          pagination: {
            currentPage: pageNum,
            limit,
            totalProducts,
            totalPages: Math.max(1, Math.ceil(totalProducts / limit)),
            hasNextPage: startIndex + limit < totalProducts,
            hasPrevPage: pageNum > 1,
          },
        }),
      })
    })

    await page.goto('/catalog')

    await page.getByPlaceholder('Search products, brands, categories...').first().fill('bud')
    await page.getByRole('button', { name: 'Search catalog' }).first().click()

    await expect(page).toHaveURL(/\/catalog\?search=bud/)
    await expect(page.getByText('Results for "bud"')).toBeVisible()

    await page.getByRole('button', { name: /Brands/i }).first().click()
    await page.getByRole('menuitem', { name: 'Apple' }).click()

    await expect(page).toHaveURL(/brand=apple/)

    await page.goto('/catalog?search=bud&brand=apple&sort=%7B%22price%22%3A1%7D')
    await expect(page).toHaveURL(/sort=/)

    const cards = page.locator('text=/Apple Bud [0-9]{2}/')
    await expect(cards.first()).toHaveText('Apple Bud 01')

    await page.getByRole('button', { name: 'Next page' }).click()

    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByText('Apple Bud 13')).toBeVisible()

    await page.reload()

    await expect(page).toHaveURL(/search=bud/)
    await expect(page).toHaveURL(/brand=apple/)
    await expect(page).toHaveURL(/sort=/)
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByText('Apple Bud 13')).toBeVisible()

    expect(seenQueries.some((query) => query.includes('search=bud'))).toBeTruthy()
    expect(seenQueries.some((query) => query.includes('brand=apple'))).toBeTruthy()
    expect(seenQueries.some((query) => query.includes('sort='))).toBeTruthy()
    expect(seenQueries.some((query) => query.includes('page=2'))).toBeTruthy()
  })
})
