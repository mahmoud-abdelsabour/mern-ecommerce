import { expect, test } from '@playwright/test'

const makeOrder = ({ id, deliveryStatus, totalPrice, dayOffset }) => ({
  _id: id,
  id,
  deliveryStatus,
  totalPrice,
  paymentMethod: 'COD',
  createdAt: new Date(2026, 3, 1 + dayOffset).toISOString(),
  products: [
    {
      product: `prod-${id}`,
      name: `Item ${id}`,
      quantity: 1,
      priceAtPurchase: totalPrice,
      photos: ['https://cdn.example.com/order-item.jpg'],
    },
  ],
})

test.describe('E2E-D01 Orders filters and navigation', () => {
  test('applies status/sort with pagination and opens a specific order while preserving context on back', async ({ page }) => {
    const pageSize = 12
    const seenQueries = []

    const deliveredOrders = Array.from({ length: 13 }, (_, index) =>
      makeOrder({
        id: `ord-delivered-${index + 1}`,
        deliveryStatus: 'delivered',
        totalPrice: 100 + index,
        dayOffset: index,
      })
    )

    const pendingOrders = Array.from({ length: 4 }, (_, index) =>
      makeOrder({
        id: `ord-pending-${index + 1}`,
        deliveryStatus: 'pending',
        totalPrice: 200 + index,
        dayOffset: 40 + index,
      })
    )

    const allOrders = [...deliveredOrders, ...pendingOrders]

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

    await page.route('**/api/orders/*', async (route) => {
      const id = route.request().url().split('/').pop()
      const order = allOrders.find((entry) => String(entry.id) === String(id))

      await route.fulfill({
        status: order ? 200 : 404,
        contentType: 'application/json',
        body: JSON.stringify(
          order || {
            message: 'Order not found',
          }
        ),
      })
    })

    await page.route('**/api/orders**', async (route) => {
      const requestUrl = new URL(route.request().url())

      if (requestUrl.pathname !== '/api/orders') {
        await route.fallback()
        return
      }

      const sort = requestUrl.searchParams.get('sort') || 'date-desc'
      const deliveryStatus = (requestUrl.searchParams.get('deliveryStatus') || '').toLowerCase()
      const pageNum = Number(requestUrl.searchParams.get('page') || 1)
      const limit = Number(requestUrl.searchParams.get('limit') || pageSize)

      seenQueries.push(requestUrl.search)

      let rows = [...allOrders]

      if (deliveryStatus) {
        rows = rows.filter((order) => String(order.deliveryStatus).toLowerCase() === deliveryStatus)
      }

      if (sort === 'date-asc') {
        rows.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      } else if (sort === 'date-desc') {
        rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      } else if (sort === 'price-asc') {
        rows.sort((a, b) => Number(a.totalPrice) - Number(b.totalPrice))
      } else if (sort === 'price-desc') {
        rows.sort((a, b) => Number(b.totalPrice) - Number(a.totalPrice))
      }

      const start = (pageNum - 1) * limit
      const paged = rows.slice(start, start + limit)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orders: paged,
          pagination: {
            currentPage: pageNum,
            limit,
            totalOrders: rows.length,
            totalPages: Math.max(1, Math.ceil(rows.length / limit)),
          },
        }),
      })
    })

    await page.goto('/orders')

    await expect(page.getByText('My Orders')).toBeVisible()
    await expect(page.getByText('Status: All')).toBeVisible()

    await page.goto('/orders?deliveryStatus=delivered&sort=price-asc')
    await expect(page).toHaveURL(/sort=price-asc/)
    await expect(page).toHaveURL(/deliveryStatus=delivered/)
    await expect(page.getByText('Status: Delivered')).toBeVisible()

    await page.getByRole('button', { name: 'Next page' }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByText('Page 2')).toBeVisible()

    const targetOrderId = 'ord-delivered-13'
    await page.locator(`a[href="/order/${targetOrderId}"]`).click()

    await expect(page).toHaveURL(new RegExp(`/order/${targetOrderId}$`))
    await expect(page.getByText('Order').first()).toBeVisible()

    await page.goBack()

    await expect(page).toHaveURL(/\/orders\?/) 
    await expect(page).toHaveURL(/deliveryStatus=delivered/)
    await expect(page).toHaveURL(/sort=price-asc/)
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByText('Page 2')).toBeVisible()

    expect(seenQueries.some((query) => query.includes('deliveryStatus=delivered'))).toBeTruthy()
    expect(seenQueries.some((query) => query.includes('sort=price-asc'))).toBeTruthy()
    expect(seenQueries.some((query) => query.includes('page=2'))).toBeTruthy()
  })
})
