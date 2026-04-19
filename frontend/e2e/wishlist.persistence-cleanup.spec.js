import { expect, test } from '@playwright/test'

test.describe('E2E-F01 Wishlist persistence and cleanup', () => {
  test('adds to wishlist, persists across navigation/refresh, and clears successfully', async ({ page }) => {
    const productId = 'prod-wish-1'
    let wishlistIds = []
    let clearCalls = 0

    await page.addInitScript(() => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          token: 'playwright-token',
          id: 'user-wishlist-1',
          firstName: 'Play',
          lastName: 'Writer',
          username: 'pw_user',
          email: 'pw_user@example.com',
          phone: '01012345678',
        })
      )
    })

    // Fallback for any unhandled API call so auth interceptor never receives accidental 401s.
    await page.route('**/api/**', async (route) => {
      const method = route.request().method()
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
        return
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) })
    })

    await page.route('**/api/brands', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ brands: [] }) })
    })

    await page.route('**/api/categories', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ categories: [] }) })
    })

    await page.route('**/api/cart', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })

    await page.route('**/api/wishlist**', async (route) => {
      const method = route.request().method()
      const url = route.request().url()

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(wishlistIds),
        })
        return
      }

      if (method === 'POST') {
        const id = url.split('/').pop()
        if (!wishlistIds.some((entry) => String(entry) === String(id))) {
          wishlistIds = [...wishlistIds, id]
        }
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Added' }) })
        return
      }

      if (method === 'DELETE' && /\/api\/wishlist\/products\//.test(url)) {
        const id = url.split('/').pop()
        wishlistIds = wishlistIds.filter((entry) => String(entry) !== String(id))
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Removed' }) })
        return
      }

      if (method === 'DELETE') {
        clearCalls += 1
        wishlistIds = []
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Cleared' }) })
        return
      }

      await route.fallback()
    })

    await page.route('**/api/products/*/user-status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ canReview: false, hasReviewed: false }),
      })
    })

    await page.route(`**/api/products/${productId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product: {
            _id: productId,
            id: productId,
            name: 'Harbor Everyday Pack',
            description: 'Clean everyday backpack silhouette.',
            price: 110,
            rating: { score: 4.1, voters: 15 },
            brand: { _id: 'b1', slug: 'harbor', name: 'Harbor' },
            category: { _id: 'c1', slug: 'bags', name: 'Bags' },
            photos: ['https://cdn.example.com/harbor-pack.jpg'],
          },
          reviewsPreview: [],
          reviewsCount: 0,
          hasMoreReviews: false,
        }),
      })
    })

    await page.goto(`/product/${productId}`)

    await expect(page.getByText('Harbor Everyday Pack').first()).toBeVisible()
    await page.getByLabel('Add to wishlist').first().click()

    await expect.poll(() => wishlistIds).toContain(productId)
    await expect(page.getByLabel('Remove from wishlist').first()).toBeVisible()

    await page.getByLabel('Open wishlist').click()

    await expect(page).toHaveURL(/\/wishlist$/)
    await expect(page.getByText('Harbor Everyday Pack').first()).toBeVisible()

    await page.goto('/')
    await page.goto('/wishlist')
    await page.reload()
    await expect(page.getByText('Harbor Everyday Pack').first()).toBeVisible()

    await page.getByRole('button', { name: 'Clear wishlist' }).click()

    await expect.poll(() => clearCalls).toBe(1)
    await expect(page.getByText('Your Wishlist is empty')).toBeVisible()

    await page.reload()
    await expect(page.getByText('Your Wishlist is empty')).toBeVisible()
    expect(wishlistIds).toHaveLength(0)
  })
})
