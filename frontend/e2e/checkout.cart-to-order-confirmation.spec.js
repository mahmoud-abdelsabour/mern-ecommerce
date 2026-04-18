import { expect, test } from '@playwright/test'

test.describe('E2E-C02 Checkout from cart to order confirmation', () => {
  test('keeps place order disabled until required data then redirects to created order page', async ({ page }) => {
    const createdOrderId = 'order-901'
    const createdOrders = []

    const cartLine = {
      product: {
        _id: 'prod-501',
        name: 'Urban Travel Pack',
        price: 100,
        rating: { score: 4.5 },
        photos: ['https://cdn.example.com/urban-pack.jpg'],
        brand: { _id: 'b1', slug: 'urban', name: 'Urban' },
        category: { _id: 'c1', slug: 'bags', name: 'Bags' },
      },
      quantity: 2,
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

    await page.route('**/api/cart', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([cartLine]),
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
              _id: 'addr-1',
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
      const method = route.request().method()
      if (method === 'POST') {
        const payload = route.request().postDataJSON()
        createdOrders.push(payload)

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: createdOrderId,
            _id: createdOrderId,
          }),
        })
        return
      }

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ orders: [] }),
        })
        return
      }

      await route.fallback()
    })

    await page.route(`**/api/orders/${createdOrderId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: createdOrderId,
          _id: createdOrderId,
          deliveryStatus: 'pending',
          createdAt: '2026-04-18T10:00:00.000Z',
          shippedAt: null,
          deliveredAt: null,
          paymentMethod: 'COD',
          shippingPrice: 25,
          codFees: 10,
          subtotal: 200,
          totalPrice: 235,
          products: [
            {
              product: 'prod-501',
              name: 'Urban Travel Pack',
              quantity: 2,
              priceAtPurchase: 100,
              brand: 'Urban',
              category: 'Bags',
              photos: ['https://cdn.example.com/urban-pack.jpg'],
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

    await page.goto('/order/check-out')

    await expect(page.getByText('Checkout').first()).toBeVisible()
    await expect(page.getByText('Urban Travel Pack').last()).toBeVisible()

    const placeOrderButton = page.getByRole('button', { name: 'Place order' })
    await expect(placeOrderButton).toBeDisabled()

    await page.getByRole('radio', { name: 'COD' }).dispatchEvent('click')
    await expect(placeOrderButton).toBeEnabled()

    await placeOrderButton.click()

    await expect.poll(() => createdOrders.length).toBe(1)
    await expect(page).toHaveURL(new RegExp(`/order/${createdOrderId}$`))

    await expect(page.getByText('Order placed successfully.').first()).toBeVisible()
    await expect(page.getByText('Urban Travel Pack').last()).toBeVisible()
    await expect(page.getByText('$235.00').first()).toBeVisible()

    expect(createdOrders[0]).toMatchObject({
      source: 'cart',
      paymentMethod: 'COD',
      products: [{ product: 'prod-501', quantity: 2 }],
    })
  })
})
