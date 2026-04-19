import { expect, test } from '@playwright/test'

const productId = 'prod-responsive-1'

const installMocks = async (page) => {
  let cartItems = []

  const product = {
    _id: productId,
    id: productId,
    name: 'Responsive Travel Bag',
    price: 180,
    rating: { score: 4.6, voters: 22 },
    brand: { _id: 'b1', id: 'b1', slug: 'orbit', name: 'Orbit' },
    category: { _id: 'c1', id: 'c1', slug: 'bags', name: 'Bags' },
    photos: ['https://cdn.example.com/responsive-bag.jpg'],
  }

  await page.route('**/api/**', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) })
  })

  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'playwright-token',
        id: 'user-responsive-1',
        firstName: 'Play',
        lastName: 'Writer',
        username: 'pw_user',
        email: 'pw_user@example.com',
        phone: '01012345678',
      }),
    })
  })

  await page.route('**/api/users/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-responsive-1',
        firstName: 'Play',
        lastName: 'Writer',
        username: 'pw_user',
        email: 'pw_user@example.com',
        phone: '01012345678',
        addresses: [],
      }),
    })
  })

  await page.route('**/api/brands', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ brands: [{ _id: 'b1', id: 'b1', slug: 'orbit', name: 'Orbit' }] }),
    })
  })

  await page.route('**/api/categories', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ categories: [{ _id: 'c1', id: 'c1', slug: 'bags', name: 'Bags' }] }),
    })
  })

  await page.route('**/api/wishlist**', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) })
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
        orders: [],
        pagination: { currentPage: 1, limit: 12, totalOrders: 0, totalPages: 1 },
      }),
    })
  })

  await page.route('**/api/products**', async (route) => {
    const requestUrl = new URL(route.request().url())

    if (requestUrl.pathname === `/api/products/${productId}`) {
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
      return
    }

    if (requestUrl.pathname === '/api/products') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [product],
          pagination: { totalProducts: 1, totalPages: 1, currentPage: 1 },
        }),
      })
      return
    }

    await route.fallback()
  })

  await page.route('**/api/cart**', async (route) => {
    const method = route.request().method()
    const requestUrl = new URL(route.request().url())

    if (method === 'GET' && requestUrl.pathname === '/api/cart') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(cartItems) })
      return
    }

    if (method === 'POST' && requestUrl.pathname === '/api/cart') {
      const payload = route.request().postDataJSON()
      const existing = cartItems.find((line) => String(line?.product?._id) === String(payload?.productId))

      if (existing) {
        existing.quantity = Number(existing.quantity ?? 0) + Number(payload?.quantity ?? 1)
      } else {
        cartItems = [
          ...cartItems,
          {
            product,
            quantity: Number(payload?.quantity ?? 1),
          },
        ]
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Added' }) })
      return
    }

    await route.fallback()
  })
}

const runAuthCatalogToCartFlow = async (page) => {
  await page.goto('/login')

  await page.getByLabel('Email address').fill('pw_user@example.com')
  await page.getByLabel('Password').fill('Aa123456!')
  await page.getByRole('button', { name: 'Submit' }).click()

  await expect(page).toHaveURL(/\/$/)

  await page.goto('/catalog')
  await expect(page).toHaveURL(/\/catalog$/)
  await expect(page.getByText('Catalog').first()).toBeVisible()
  await expect(page.getByText('Responsive Travel Bag').first()).toBeVisible()

  await page.getByRole('button', { name: 'Add to cart' }).first().click()

  await expect(page.getByText('Your Cart').first()).toBeVisible()
  await page.getByRole('link', { name: 'View cart' }).click()

  await expect(page).toHaveURL(/\/cart$/)
  await expect(page.getByText('Responsive Travel Bag').first()).toBeVisible()
}

test.describe('E2E-G02 Responsive critical journeys', () => {
  test('desktop viewport: auth and catalog-to-cart flow works', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await installMocks(page)

    await runAuthCatalogToCartFlow(page)
  })

  test('mobile viewport: auth and catalog-to-cart flow works with mobile menu and filter interactions', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await installMocks(page)

    await page.goto('/')
    await page.getByLabel('Open navigation menu').click()
    await expect(page.getByText('Menu')).toBeVisible()
    await page.getByRole('button', { name: 'Close' }).first().click()
    await expect(page.getByText('Menu')).toHaveCount(0)

    await runAuthCatalogToCartFlow(page)

    await page.goto('/catalog')
    await page.getByLabel('Toggle catalog filters').click()
    await expect(page.getByRole('button', { name: 'Clear' }).first()).toBeVisible()
  })
})
