import { expect, test } from '@playwright/test'

test.describe('E2E-D02 Cancel pending order journey', () => {
  test('allows cancellation for pending order via confirmation dialog and updates order state', async ({ page }) => {
    const orderId = 'order-1001'
    let deliveryStatus = 'pending'
    let cancelCalls = 0

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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ brands: [] }) })
    })

    await page.route('**/api/categories', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ categories: [] }) })
    })

    await page.route('**/api/cart', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })

    await page.route(`**/api/orders/${orderId}/cancel`, async (route) => {
      cancelCalls += 1
      deliveryStatus = 'cancelled'

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Order cancelled' }),
      })
    })

    await page.route(`**/api/orders/${orderId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: orderId,
          _id: orderId,
          deliveryStatus,
          createdAt: '2026-04-19T09:00:00.000Z',
          shippedAt: null,
          deliveredAt: null,
          paymentMethod: 'COD',
          shippingPrice: 25,
          codFees: 10,
          subtotal: 160,
          totalPrice: 195,
          products: [
            {
              product: 'prod-100',
              name: 'Alpine Carrier',
              quantity: 1,
              priceAtPurchase: 160,
              brand: 'Summit',
              category: 'Bags',
              photos: ['https://cdn.example.com/alpine-carrier.jpg'],
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

    await page.goto(`/order/${orderId}`)

    await expect(page.getByText('Order').first()).toBeVisible()

    const cancelOrderButton = page.getByRole('button', { name: 'Cancel Order' }).first()
    await expect(cancelOrderButton).toBeEnabled()

    await cancelOrderButton.click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await expect(page.getByText('Cancel this order?')).toBeVisible()

    await page.getByRole('button', { name: 'Yes, cancel order' }).click()

    await expect.poll(() => cancelCalls).toBe(1)
    await expect(page.getByText('cancelled').first()).toBeVisible()
    await expect(cancelOrderButton).toBeDisabled()
    await expect(page.getByText('Cancel works only when pending, return works only when delivered.')).toBeVisible()
  })
})
