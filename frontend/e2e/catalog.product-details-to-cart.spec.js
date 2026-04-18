import { expect, test } from '@playwright/test'

test.describe('E2E-B02 Product details to cart journey', () => {
  test('navigates from catalog to product details and adds item to cart', async ({ page }) => {
    const product = {
      _id: 'prod-200',
      name: 'Traveler Backpack',
      description: 'A rugged backpack built for weekend trips.',
      price: 149,
      rating: { score: 4.6, voters: 12 },
      brand: { _id: 'b-travel', slug: 'travelco', name: 'TravelCo' },
      category: { _id: 'c-bags', slug: 'bags', name: 'Bags' },
      photos: ['https://cdn.example.com/backpack-1.jpg'],
    }

    const cartState = []
    let addToCartCalls = 0

    await page.addInitScript(() => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          token: 'playwright-token',
          firstName: 'Play',
          lastName: 'Writer',
          username: 'pw_user',
          email: 'pw_user@example.com',
          phone: '01012345678',
        })
      )
    })

    await page.route('**/api/brands', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          brands: [{ _id: 'b-travel', slug: 'travelco', name: 'TravelCo' }],
        }),
      })
    })

    await page.route('**/api/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [{ _id: 'c-bags', slug: 'bags', name: 'Bags' }],
        }),
      })
    })

    await page.route('**/api/wishlist**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.route('**/api/products/*/user-status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ canReview: false, hasReviewed: false }),
      })
    })

    await page.route('**/api/products/prod-200', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product,
          reviewsPreview: [],
          reviewsCount: 0,
          hasMoreReviews: false,
        }),
      })
    })

    await page.route('**/api/products**', async (route) => {
      const reqUrl = new URL(route.request().url())
      if (reqUrl.pathname !== '/api/products') {
        await route.fallback()
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [product],
          pagination: {
            currentPage: 1,
            limit: 12,
            totalProducts: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
      })
    })

    await page.route('**/api/cart', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(cartState),
        })
        return
      }

      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON()
        addToCartCalls += 1

        const existing = cartState.find(
          (item) => String(item?.product?._id ?? item?.product?.id ?? item?.product) === String(body.productId)
        )

        if (existing) {
          existing.quantity += Number(body.quantity ?? 1)
        } else {
          cartState.push({
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              photos: product.photos,
              rating: product.rating,
            },
            quantity: Number(body.quantity ?? 1),
          })
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Added to cart' }),
        })
        return
      }

      await route.fallback()
    })

    await page.goto('/catalog')

    await expect(page.getByText('Traveler Backpack')).toBeVisible()

    await page.getByText('Traveler Backpack').click()

    await expect(page).toHaveURL(/\/product\/prod-200$/)
    await expect(page.getByText('Traveler Backpack').first()).toBeVisible()
    await expect(page.getByText('A rugged backpack built for weekend trips.')).toBeVisible()

    await page.getByRole('button', { name: 'Add to cart' }).click()

    await expect.poll(() => addToCartCalls).toBeGreaterThan(0)
    await expect(page.getByText('Qty: 1')).toBeVisible()
    await expect(page.getByText('Your Cart').first()).toBeVisible()

    await page.getByRole('link', { name: 'View cart' }).click()

    await expect(page).toHaveURL(/\/cart$/)
    await expect(page.getByText('Traveler Backpack').first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Checkout' }).first()).toBeVisible()
  })
})
