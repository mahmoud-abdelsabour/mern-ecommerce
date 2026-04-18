import { expect, test } from '@playwright/test'

test.describe('E2E-C01 Cart quantity lifecycle', () => {
  test('adds product, increments/decrements quantity, clears cart, and keeps state after refresh', async ({ page }) => {
    const product = {
      _id: 'prod-401',
      name: 'Trail Pack Pro',
      description: 'All-weather backpack with modular storage.',
      price: 199,
      rating: { score: 4.7, voters: 40 },
      brand: { _id: 'b-trail', slug: 'trailco', name: 'TrailCo' },
      category: { _id: 'c-bags', slug: 'bags', name: 'Bags' },
      photos: ['https://cdn.example.com/trail-pack-pro.jpg'],
    }

    const cartState = []

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
        body: JSON.stringify({ brands: [{ _id: 'b-trail', slug: 'trailco', name: 'TrailCo' }] }),
      })
    })

    await page.route('**/api/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ categories: [{ _id: 'c-bags', slug: 'bags', name: 'Bags' }] }),
      })
    })

    await page.route('**/api/wishlist**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
        return
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
    })

    await page.route('**/api/products/*/user-status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ canReview: false, hasReviewed: false }),
      })
    })

    await page.route('**/api/products/prod-401', async (route) => {
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

    await page.route('**/api/cart/products/**', async (route) => {
      if (route.request().method() !== 'PATCH') {
        await route.fallback()
        return
      }

      const body = route.request().postDataJSON()
      const productId = route.request().url().split('/').pop()
      const amount = Number(body?.amount ?? 1)

      const line = cartState.find(
        (item) => String(item?.product?._id ?? item?.product?.id ?? item?.product) === String(productId)
      )

      if (line) {
        line.quantity = Math.max(0, Number(line.quantity ?? 0) - Math.max(1, amount))
        if (line.quantity === 0) {
          const index = cartState.indexOf(line)
          if (index >= 0) cartState.splice(index, 1)
        }
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Cart updated' }),
      })
    })

    await page.route('**/api/cart', async (route) => {
      const method = route.request().method()

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(cartState),
        })
        return
      }

      if (method === 'POST') {
        const body = route.request().postDataJSON()
        const productId = String(body?.productId)
        const quantity = Math.max(1, Number(body?.quantity ?? 1))

        const line = cartState.find(
          (item) => String(item?.product?._id ?? item?.product?.id ?? item?.product) === productId
        )

        if (line) {
          line.quantity += quantity
        } else {
          cartState.push({
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              photos: product.photos,
              rating: product.rating,
            },
            quantity,
          })
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Added to cart' }),
        })
        return
      }

      if (method === 'DELETE') {
        cartState.splice(0, cartState.length)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Cart cleared' }),
        })
        return
      }

      await route.fallback()
    })

    await page.goto('/product/prod-401')

    await expect(page.getByText('Trail Pack Pro').first()).toBeVisible()
    await page.getByRole('button', { name: 'Add to cart' }).click()

    await expect(page.getByText('Your Cart').first()).toBeVisible()
    await page.getByRole('link', { name: 'View cart' }).click()

    await expect(page).toHaveURL(/\/cart$/)
    const card = page.getByRole('link', { name: /Trail Pack Pro/i }).first()
    const quantityText = card.getByLabel('Decrease').locator('xpath=following-sibling::*[1]')

    await expect(quantityText).toHaveText('1')

    await card.getByLabel('Increase').click()
    await expect(quantityText).toHaveText('2')

    await page.reload()
    await expect(quantityText).toHaveText('2')

    await card.getByLabel('Decrease').click()
    await expect(quantityText).toHaveText('1')

    await page.getByRole('button', { name: 'Clear cart' }).click()
    await expect(page.getByText('Your cart is empty')).toBeVisible()

    await page.reload()
    await expect(page.getByText('Your cart is empty')).toBeVisible()

    expect(cartState).toHaveLength(0)
  })
})
