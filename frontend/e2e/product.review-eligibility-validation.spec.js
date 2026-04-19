import { expect, test } from '@playwright/test'

test.describe('E2E-E02 Review eligibility and validation errors', () => {
  test('blocks ineligible user review controls and prevents submit without rating for eligible user', async ({ page }) => {
    const ineligibleProductId = 'prod-review-ineligible'
    const eligibleProductId = 'prod-review-eligible'
    let createReviewCalls = 0

    await page.addInitScript(() => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          token: 'playwright-token',
          id: 'user-reviewer-1',
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
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
        return
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
    })

    await page.route('**/api/products/*/user-status', async (route) => {
      const productId = route.request().url().split('/').slice(-2)[0]

      if (productId === ineligibleProductId) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ canReview: false, hasReviewed: false }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ canReview: true, hasReviewed: false }),
      })
    })

    await page.route('**/api/products/*/reviews**', async (route) => {
      if (route.request().method() === 'POST') {
        createReviewCalls += 1
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Review created' }),
        })
        return
      }
      await route.fallback()
    })

    await page.route('**/api/products/*', async (route) => {
      const productId = route.request().url().split('/').pop()

      const productName = productId === ineligibleProductId ? 'Scout Pack Lite' : 'Summit Pack Pro'
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product: {
            _id: productId,
            id: productId,
            name: productName,
            description: 'Test product for review scenarios.',
            price: 120,
            rating: { score: 4.2, voters: 1 },
            brand: { _id: 'b1', slug: 'ridge', name: 'Ridge' },
            category: { _id: 'c1', slug: 'bags', name: 'Bags' },
            photos: ['https://cdn.example.com/review-test.jpg'],
          },
          reviewsPreview: [
            {
              _id: 'rvw-1',
              user: { _id: 'user-old', name: 'Existing User' },
              name: 'Existing User',
              rating: 4,
              comment: 'Solid quality.',
              createdAt: '2026-04-18T09:00:00.000Z',
            },
          ],
          reviewsCount: 1,
          hasMoreReviews: false,
        }),
      })
    })

    await page.goto(`/product/${ineligibleProductId}`)

    await expect(page.getByText('Write a review')).toBeVisible()
    await expect(page.getByText('Reviews are limited to customers who purchased this item and have a delivered (or completed return/refund) order including it. Once you are eligible, a rating and optional comment will appear here.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit review' })).toHaveCount(0)

    await page.goto(`/product/${eligibleProductId}`)

    await expect(page.getByText('Write a review')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit review' })).toBeVisible()

    await page.getByPlaceholder('Share your experience (optional)…').fill('Trying to submit without selecting a rating first.')
    await page.getByRole('button', { name: 'Submit review' }).click({ force: true })

    await expect.poll(() => createReviewCalls).toBe(0)
    await expect(page.getByRole('button', { name: 'Submit review' })).toBeVisible()
    await expect(page.getByText('You have already reviewed this product.')).toHaveCount(0)
  })
})
