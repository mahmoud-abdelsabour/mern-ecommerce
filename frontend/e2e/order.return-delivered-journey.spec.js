import { expect, test } from '@playwright/test'

test.describe('E2E-D03 Return delivered order journey', () => {
  test('submits return for selected delivered-order items and redirects back to order page', async ({ page }) => {
    const orderId = 'order-1101'
    let orderStatus = 'delivered'
    const returnPayloads = []

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

    await page.route(`**/api/orders/${orderId}/return`, async (route) => {
      returnPayloads.push(route.request().postDataJSON())
      orderStatus = 'return requested'

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Return request submitted.' }),
      })
    })

    await page.route(`**/api/orders/${orderId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: orderId,
          _id: orderId,
          deliveryStatus: orderStatus,
          createdAt: '2026-04-19T09:00:00.000Z',
          shippedAt: '2026-04-19T11:00:00.000Z',
          deliveredAt: '2026-04-20T12:00:00.000Z',
          paymentMethod: 'COD',
          shippingPrice: 25,
          codFees: 10,
          subtotal: 290,
          totalPrice: 325,
          products: [
            {
              product: 'prod-return-1',
              name: 'Atlas Duffel',
              quantity: 2,
              priceAtPurchase: 120,
              brand: 'Summit',
              category: 'Bags',
              photos: ['https://cdn.example.com/atlas-duffel.jpg'],
            },
            {
              product: 'prod-return-2',
              name: 'Trail Sling',
              quantity: 1,
              priceAtPurchase: 50,
              brand: 'Summit',
              category: 'Bags',
              photos: ['https://cdn.example.com/trail-sling.jpg'],
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
    const returnButton = page.getByRole('link', { name: 'Return' }).first()
    await expect(returnButton).toBeEnabled()

    await returnButton.click()
    await expect(page).toHaveURL(new RegExp(`/order/${orderId}/return$`))
    await expect(page.getByText('Return order')).toBeVisible()

    // Select first item and change quantity to 2.
    await page.getByRole('checkbox').first().click({ force: true })
    await page.getByRole('button', { name: 'Increase' }).first().click()

    await page.getByPlaceholder(/Why are you returning/i).fill('Damaged zipper and poor stitching quality')

    const returnCta = page.getByRole('button', { name: 'Return' }).first()
    await expect(returnCta).toBeEnabled()
    await returnCta.click()

    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm return' }).click()

    await expect.poll(() => returnPayloads.length).toBe(1)
    await expect(page).toHaveURL(new RegExp(`/order/${orderId}$`))

    await expect(page.getByText('Return request submitted.').first()).toBeVisible()
    await expect(page.getByText('return requested').first()).toBeVisible()

    expect(returnPayloads[0]).toMatchObject({
      reason: 'Damaged zipper and poor stitching quality',
      returnedItems: [{ product: 'prod-return-1', quantity: 2 }],
    })
  })
})
