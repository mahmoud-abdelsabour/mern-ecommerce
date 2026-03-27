const { api, waitForDb, clearProducts, createBrand, createCategory, createProduct } = require('./helper')
const { mongoose } = require('../generalHelper')

jest.setTimeout(20000)

const logIfServerError = (response) => {
    if (response.status >= 500) {
        // eslint-disable-next-line no-console
        console.log('Server error response:', response.body)
        if (response.body && response.body.stack) {
            // eslint-disable-next-line no-console
            console.log('Server error stack:', response.body.stack)
        }
    }
}

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await clearProducts()
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('GET /api/products', () => {
    it('returns empty list when no products', async () => {
        const response = await api.get('/api/products')
        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body.products)).toBe(true)
        expect(response.body.products.length).toBe(0)
    })

    it('returns only non-deleted products', async () => {
        await createProduct({ isDeleted: false })
        await createProduct({ isDeleted: true })

        const response = await api.get('/api/products')
        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(1)
    })

    it('filters by brand slug', async () => {
        const brandA = await createBrand({ slug: 'brand-a' })
        const brandB = await createBrand({ slug: 'brand-b' })

        await createProduct({ brand: brandA })
        await createProduct({ brand: brandB })

        const response = await api.get('/api/products?brand=brand-a')
        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(1)
    })

    it('filters by category slug', async () => {
        const categoryA = await createCategory({ slug: 'cat-a' })
        const categoryB = await createCategory({ slug: 'cat-b' })

        await createProduct({ category: categoryA })
        await createProduct({ category: categoryB })

        const response = await api.get('/api/products?category=cat-a')
        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(1)
    })

    it('filters by price range', async () => {
        await createProduct({ price: 50 })
        await createProduct({ price: 200 })

        const response = await api.get('/api/products?minPrice=100&maxPrice=300')
        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(1)
    })

    it('filters by minRating', async () => {
        await createProduct({ rating: { score: 4.5, voters: 10 } })
        await createProduct({ rating: { score: 2.0, voters: 5 } })

        const response = await api.get('/api/products?minRating=4')
        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(1)
    })

    it('applies pagination', async () => {
        await createProduct()
        await createProduct()
        await createProduct()

        const response = await api.get('/api/products?page=1&limit=2')
        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(2)
        expect(response.body.pagination).toHaveProperty('totalProducts')
    })

    it('supports search (text)', async () => {
        await createProduct({ name: 'iPhone 15', description: 'Apple phone' })
        await createProduct({ name: 'Galaxy', description: 'Samsung phone' })

        const response = await api.get('/api/products?search=iphone')
        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(1)
    })

    it('applies sort', async () => {
        await createProduct({ price: 300 })
        await createProduct({ price: 100 })

        const response = await api.get('/api/products?sort={"price":1}')
        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBeGreaterThanOrEqual(2)
        expect(response.body.products[0].price).toBeLessThanOrEqual(response.body.products[1].price)
    })
})
