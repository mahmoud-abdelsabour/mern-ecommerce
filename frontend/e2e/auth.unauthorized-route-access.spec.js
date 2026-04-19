import { expect, test } from '@playwright/test'

test.describe('E2E-F03 Unauthorized route access control', () => {
  test('blocks guests on protected routes and allows access after authentication', async ({ page }) => {
    const orderId = 'ord-auth-1'

    const me = {
      _id: 'user-auth-1',
      id: 'user-auth-1',
      firstName: 'Play',
      lastName: 'Writer',
      username: 'pw_user',
      email: 'pw_user@example.com',
      phone: '01012345678',
      profilePhoto: '',
      addresses: [
        {
          _id: 'addr-auth-1',
          address_name: 'Home',
          country: 'Egypt',
          city: 'Cairo',
          postalcode: '12345',
          street: 'Nile St',
          building: '10A',
          floor: 2,
          special_mark: 'Near bridge',
        },
      ],
    }

    const orders = [
      {
        _id: orderId,
        id: orderId,
        deliveryStatus: 'pending',
        totalPrice: 220,
        paymentMethod: 'COD',
        createdAt: new Date(2026, 3, 12).toISOString(),
        products: [
          {
            product: 'prod-auth-1',
            name: 'Transit Carry Bag',
            quantity: 1,
            priceAtPurchase: 220,
            photos: ['https://cdn.example.com/transit-bag.jpg'],
          },
        ],
      },
    ]

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

    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(me) })
    })

    await page.route('**/api/cart', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            product: {
              _id: 'prod-auth-1',
              id: 'prod-auth-1',
              name: 'Transit Carry Bag',
              price: 220,
              brand: { name: 'Transit' },
              category: { name: 'Bags' },
              photos: ['https://cdn.example.com/transit-bag.jpg'],
            },
            quantity: 1,
          },
        ]),
      })
    })

    await page.route('**/api/orders/*', async (route) => {
      const id = route.request().url().split('/').pop()
      const order = orders.find((entry) => String(entry.id) === String(id))

      await route.fulfill({
        status: order ? 200 : 404,
        contentType: 'application/json',
        body: JSON.stringify(order || { message: 'Order not found' }),
      })
    })

    await page.route('**/api/orders**', async (route) => {
      const requestUrl = new URL(route.request().url())
      if (requestUrl.pathname !== '/api/orders') {
        await route.fallback()
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orders,
          pagination: {
            currentPage: 1,
            limit: 12,
            totalOrders: orders.length,
            totalPages: 1,
          },
        }),
      })
    })

    // Guest direct URL access checks.
    await page.goto('/me')
    await expect(page).toHaveURL(/\/login$/)

    await page.goto('/me/edit')
    await expect(page).toHaveURL(/\/login$/)

    await page.goto('/me/change-password')
    await expect(page).toHaveURL(/\/login$/)

    await page.goto('/me/change-email')
    await expect(page).toHaveURL(/\/login$/)

    await page.goto('/orders')
    await expect(page).toHaveURL(/\/orders$/)
    await expect(page.getByText('Login required')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Go to Login' })).toBeVisible()

    await page.goto(`/order/${orderId}`)
    await expect(page).toHaveURL(new RegExp(`/order/${orderId}$`))
    await expect(page.getByText('Login required')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Go to Login' })).toBeVisible()

    await page.goto('/order/check-out')
    await expect(page).toHaveURL(/\/order\/check-out$/)
    await expect(page.getByText('Login required')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Go to Login' })).toBeVisible()

    // Authenticate and retry same protected routes.
    await page.evaluate(() => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          token: 'playwright-token',
          id: 'user-auth-1',
          firstName: 'Play',
          lastName: 'Writer',
          username: 'pw_user',
          email: 'pw_user@example.com',
          phone: '01012345678',
        })
      )
    })

    await page.goto('/me')
    await expect(page).toHaveURL(/\/me$/)
    await expect(page.getByText('Profile').first()).toBeVisible()

    await page.goto('/me/edit')
    await expect(page).toHaveURL(/\/me\/edit$/)
    await expect(page.getByText('Edit Profile')).toBeVisible()

    await page.goto('/me/change-password')
    await expect(page).toHaveURL(/\/me\/change-password$/)
    await expect(page.getByText('Change Password')).toBeVisible()

    await page.goto('/me/change-email')
    await expect(page).toHaveURL(/\/me\/change-email$/)
    await expect(page.getByText('Change Email')).toBeVisible()

    await page.goto('/orders')
    await expect(page).toHaveURL(/\/orders$/)
    await expect(page.getByText('My Orders')).toBeVisible()

    await page.goto(`/order/${orderId}`)
    await expect(page).toHaveURL(new RegExp(`/order/${orderId}$`))
    await expect(page.getByText('Order').first()).toBeVisible()

    await page.goto('/order/check-out')
    await expect(page).toHaveURL(/\/order\/check-out$/)
    await expect(page.getByText('Checkout').first()).toBeVisible()
  })
})
