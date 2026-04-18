import { expect, test } from '@playwright/test'

test.describe('E2E-C03 Buy-now single product checkout', () => {
  test('uses buy-now source, checks out single selected product, and lands on order page', async ({ page }) => {
    const buyNowProductId = 'prod-601'
    const createdOrderId = 'order-902'
    const capturedCreateOrderPayloads = []

    const buyNowProduct = {
      _id: buyNowProductId,
      name: 'Nomad Carry Sling',
      description: 'Compact sling bag for daily essentials.',
      price: 120,
      rating: { score: 4.3, voters: 18 },
      brand: { _id: 'b-nomad', slug: 'nomad', name: 'Nomad' },
      category: { _id: 'c-bags', slug: 'bags', name: 'Bags' },
      photos: ['https://cdn.example.com/nomad-carry.jpg'],
    }

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
        body: JSON.stringify({ brands: [] }),
      })
    })

    await page.route('**/api/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ categories: [] }),
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

    await page.route(`**/api/products/${buyNowProductId}/user-status`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ canReview: false, hasReviewed: false }),
      })
    })

    await page.route(`**/api/products/${buyNowProductId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product: buyNowProduct,
          reviewsPreview: [],
          reviewsCount: 0,
          hasMoreReviews: false,
        }),
      })
    })

    await page.route('**/api/cart', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              product: {
                _id: 'prod-cart-1',
                name: 'Cart Noise Item',
                price: 80,
                rating: { score: 4.0 },
                photos: ['https://cdn.example.com/cart-noise.jpg'],
              },
              quantity: 3,
            },
          ]),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'ok' }),
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
          addresses: [
            {
              _id: 'addr-buy-now',
              address_name: 'Home',
              country: 'Egypt',
              city: 'Cairo',
              postalcode: '12345',
              street: 'Nile St',
              building: '10A',
              floor: 2,
              special_mark: 'Near the bridge',
            },
          ],
        }),
      })
    })

    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        capturedCreateOrderPayloads.push(route.request().postDataJSON())

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: createdOrderId, _id: createdOrderId }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ orders: [] }),
      })
    })

    await page.route(`**/api/orders/${createdOrderId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: createdOrderId,
          _id: createdOrderId,
          deliveryStatus: 'pending',
          createdAt: '2026-04-19T10:00:00.000Z',
          shippedAt: null,
          deliveredAt: null,
          paymentMethod: 'COD',
          shippingPrice: 25,
          codFees: 10,
          subtotal: 120,
          totalPrice: 155,
          products: [
            {
              product: buyNowProductId,
              name: buyNowProduct.name,
              quantity: 1,
              priceAtPurchase: 120,
              brand: 'Nomad',
              category: 'Bags',
              photos: buyNowProduct.photos,
            },
          ],
          shippingInfo: {
            firstName: 'Play',
            lastName: 'Writer',
            phone: '01012345678',
            address: {
              country: 'Egypt',
              city: 'Cairo',
              postalcode: '12345',
              street: 'Nile St',
              building: '10A',
              floor: 2,
              special_mark: 'Near the bridge',
            },
          },
        }),
      })
    })

    await page.goto(`/product/${buyNowProductId}`)

    await expect(page.getByText('Nomad Carry Sling').first()).toBeVisible()
    await page.getByRole('button', { name: 'Buy now' }).click()

    await expect(page).toHaveURL(new RegExp(`/order/check-out\\?buyNow=${buyNowProductId}$`))
    await expect(page.getByText('Checkout').first()).toBeVisible()
    await expect(page.getByText('Nomad Carry Sling').last()).toBeVisible()
    await expect(page.getByText('Cart Noise Item')).not.toBeVisible()

    const placeOrderButton = page.getByRole('button', { name: 'Place order' })
    await expect(placeOrderButton).toBeDisabled()

    await page.getByRole('radio', { name: 'COD' }).dispatchEvent('click')
    await expect(placeOrderButton).toBeEnabled()

    await placeOrderButton.click()

    await expect.poll(() => capturedCreateOrderPayloads.length).toBe(1)
    await expect(page).toHaveURL(new RegExp(`/order/${createdOrderId}$`))

    await expect(page.getByText('Order placed successfully.').first()).toBeVisible()
    await expect(page.getByText('Nomad Carry Sling').last()).toBeVisible()
    await expect(page.getByText('$155.00').first()).toBeVisible()

    expect(capturedCreateOrderPayloads[0]).toMatchObject({
      source: 'buyNow',
      paymentMethod: 'COD',
      products: [{ product: buyNowProductId, quantity: 1 }],
    })
  })
})
