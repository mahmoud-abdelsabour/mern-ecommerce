import { expect, test } from '@playwright/test'

test.describe('E2E-C04 Checkout failure and recovery', () => {
  test('prevents invalid submit, stays on checkout after API failure, then succeeds on retry', async ({ page }) => {
    const createdOrderId = 'order-903'
    const postPayloads = []
    let createOrderAttempts = 0

    const cartLine = {
      product: {
        _id: 'prod-701',
        name: 'Expedition Rucksack',
        price: 180,
        rating: { score: 4.6 },
        photos: ['https://cdn.example.com/rucksack.jpg'],
        brand: { _id: 'b1', slug: 'summit', name: 'Summit' },
        category: { _id: 'c1', slug: 'bags', name: 'Bags' },
      },
      quantity: 1,
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
        createOrderAttempts += 1
        postPayloads.push(route.request().postDataJSON())

        if (createOrderAttempts === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Order service unavailable' }),
          })
          return
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: createdOrderId, _id: createdOrderId }),
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
          createdAt: '2026-04-19T10:00:00.000Z',
          shippedAt: null,
          deliveredAt: null,
          paymentMethod: 'COD',
          shippingPrice: 25,
          codFees: 10,
          subtotal: 180,
          totalPrice: 215,
          products: [
            {
              product: 'prod-701',
              name: 'Expedition Rucksack',
              quantity: 1,
              priceAtPurchase: 180,
              brand: 'Summit',
              category: 'Bags',
              photos: ['https://cdn.example.com/rucksack.jpg'],
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

    const placeOrderButton = page.getByRole('button', { name: 'Place order' })
    await expect(placeOrderButton).toBeDisabled()

    await page.getByRole('radio', { name: 'COD' }).dispatchEvent('click')
    await expect(placeOrderButton).toBeEnabled()

    await placeOrderButton.click()

    await expect.poll(() => createOrderAttempts).toBe(1)
    await expect(page).toHaveURL(/\/order\/check-out$/)
    await expect(page.getByText('Could not place order').first()).toBeVisible()
    await expect(placeOrderButton).toBeEnabled()

    await placeOrderButton.click()

    await expect.poll(() => createOrderAttempts).toBe(2)
    await expect(page).toHaveURL(new RegExp(`/order/${createdOrderId}$`))
    await expect(page.getByText('Order placed successfully.').first()).toBeVisible()
    await expect(page.getByText('Expedition Rucksack').last()).toBeVisible()

    expect(postPayloads).toHaveLength(2)
    expect(postPayloads[0]).toMatchObject({
      source: 'cart',
      paymentMethod: 'COD',
      products: [{ product: 'prod-701', quantity: 1 }],
    })
    expect(postPayloads[1]).toMatchObject({
      source: 'cart',
      paymentMethod: 'COD',
      products: [{ product: 'prod-701', quantity: 1 }],
    })
  })
})
