import { expect, test } from '@playwright/test'

test.describe('E2E-D04 Non-eligible return access guard', () => {
  test('blocks return submission controls for non-delivered order and guides user back', async ({ page }) => {
    const orderId = 'order-1201'

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

    await page.route(`**/api/orders/${orderId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: orderId,
          _id: orderId,
          deliveryStatus: 'pending',
          createdAt: '2026-04-19T09:00:00.000Z',
          shippedAt: null,
          deliveredAt: null,
          paymentMethod: 'COD',
          shippingPrice: 25,
          codFees: 10,
          subtotal: 150,
          totalPrice: 185,
          products: [
            {
              product: 'prod-guard-1',
              name: 'Guarded Pack',
              quantity: 1,
              priceAtPurchase: 150,
              brand: 'Summit',
              category: 'Bags',
              photos: ['https://cdn.example.com/guarded-pack.jpg'],
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

    await page.goto(`/order/${orderId}/return`)

    await expect(page).toHaveURL(new RegExp(`/order/${orderId}/return$`))
    await expect(page.getByText('Returns unavailable')).toBeVisible()
    await expect(page.getByText('Returns can only be requested for delivered orders. Current status: pending')).toBeVisible()

    await expect(page.getByRole('button', { name: 'Return' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Confirm return' })).toHaveCount(0)

    await page.getByRole('link', { name: 'Back to order' }).click()

    await expect(page).toHaveURL(new RegExp(`/order/${orderId}$`))
    await expect(page.getByText('Order').first()).toBeVisible()
  })
})
