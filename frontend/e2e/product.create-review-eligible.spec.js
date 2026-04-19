import { expect, test } from '@playwright/test'

test.describe('E2E-E01 Create review after eligible purchase', () => {
  test('eligible user can submit rating/comment and review state updates', async ({ page }) => {
    const productId = 'prod-review-1'
    const createReviewPayloads = []
    let hasReviewed = false
    let reviewComment = ''
    let reviewRating = 0

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

    await page.route(`**/api/products/${productId}/user-status`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ canReview: true, hasReviewed }),
      })
    })

    await page.route('**/api/products/**/reviews**', async (route) => {
      if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON()
        createReviewPayloads.push(payload)
        hasReviewed = true
        reviewComment = String(payload?.comment ?? '')
        reviewRating = Number(payload?.rating ?? 0)

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Review created' }),
        })
        return
      }

      await route.fallback()
    })

    await page.route(`**/api/products/${productId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product: {
            _id: productId,
            id: productId,
            name: 'Ridge Daypack',
            description: 'Daily-use backpack with ergonomic support.',
            price: 140,
            rating: { score: hasReviewed && reviewRating > 0 ? reviewRating : 4.2, voters: hasReviewed ? 2 : 1 },
            brand: { _id: 'b1', slug: 'ridge', name: 'Ridge' },
            category: { _id: 'c1', slug: 'bags', name: 'Bags' },
            photos: ['https://cdn.example.com/ridge-daypack.jpg'],
          },
          reviewsPreview: hasReviewed
            ? [
                {
                  _id: 'rvw-new-1',
                  user: { _id: 'user-reviewer-1', name: 'Play Writer' },
                  name: 'Play Writer',
                  rating: reviewRating,
                  comment: reviewComment,
                  createdAt: '2026-04-19T12:00:00.000Z',
                },
              ]
            : [
                {
                  _id: 'rvw-old-1',
                  user: { _id: 'user-old', name: 'Existing User' },
                  name: 'Existing User',
                  rating: 4,
                  comment: 'Solid quality.',
                  createdAt: '2026-04-18T09:00:00.000Z',
                },
              ],
          reviewsCount: hasReviewed ? 2 : 1,
          hasMoreReviews: false,
        }),
      })
    })

    await page.goto(`/product/${productId}`)

    await expect(page.getByText('Write a review')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit review' })).toBeVisible()

    const writeRatingGroup = page
      .getByText('Rating (required) · Comment optional (max 1000 characters)')
      .locator('xpath=following::div[@role="radiogroup"][1]')
    const fiveStars = writeRatingGroup.getByRole('radio', { name: '5 stars' })
    await fiveStars.click({ force: true })
    await expect(fiveStars).toBeChecked()

    await page.getByPlaceholder('Share your experience (optional)…').fill('Great build quality and very comfortable straps.')
    await page.getByRole('button', { name: 'Submit review' }).click({ force: true })

    await expect.poll(() => createReviewPayloads.length).toBe(1)
    await expect(page.getByText('You have already reviewed this product.')).toBeVisible()
    await expect(page.getByText('Great build quality and very comfortable straps.')).toBeVisible()

    expect(Number(createReviewPayloads[0]?.rating ?? 0)).toBeGreaterThanOrEqual(1)
    expect(createReviewPayloads[0]).toMatchObject({
      comment: 'Great build quality and very comfortable straps.',
    })
  })
})
