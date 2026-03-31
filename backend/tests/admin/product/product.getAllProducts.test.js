const {
    api,
    waitForDb,
    createUser,
    createBrand,
    createCategory,
    createProduct,
    getAuthToken,
    logIfServerError,
    dropDatabase,
    closeDb
} = require('../../helper')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('GET /api/admin/products', () => {
    it('returns 401 when no token', async () => {
        const response = await api.get('/api/admin/products')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .get('/api/admin/products')
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .get('/api/admin/products')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns only non-deleted products by default', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createProduct({ name: 'Active Product' })
        await createProduct({ name: 'Deleted Product', isDeleted: true })

        const response = await api
            .get('/api/admin/products')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(1)
        expect(response.body.products[0].name).toBe('Active Product')
    })

    it('returns deleted only when onlyDeleted=true', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createProduct({ name: 'Active Product' })
        await createProduct({ name: 'Deleted Product', isDeleted: true })

        const response = await api
            .get('/api/admin/products?onlyDeleted=true')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(1)
        expect(response.body.products[0].name).toBe('Deleted Product')
    })

    it('returns both when includeDeleted=true', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createProduct({ name: 'Active Product' })
        await createProduct({ name: 'Deleted Product', isDeleted: true })

        const response = await api
            .get('/api/admin/products?includeDeleted=true')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(2)
    })

    it('filters by brand slug and category slug', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const brand = await createBrand({ name: 'Apple', slug: 'apple' })
        const category = await createCategory({ name: 'Phones', slug: 'phones' })

        await createProduct({ name: 'iPhone', brand, category })
        await createProduct({ name: 'Other', brand: await createBrand({ name: 'Samsung', slug: 'samsung' }), category })

        const response = await api
            .get('/api/admin/products?brand=apple&category=phones')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(1)
        expect(response.body.products[0].name).toBe('iPhone')
    })

    it('filters by price range and rating', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createProduct({ name: 'Cheap', price: 50, rating: { score: 2, voters: 1 } })
        await createProduct({ name: 'Premium', price: 500, rating: { score: 4, voters: 10 } })

        const response = await api
            .get('/api/admin/products?minPrice=100&maxPrice=600&minRating=3')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(1)
        expect(response.body.products[0].name).toBe('Premium')
    })

    it('filters by search', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createProduct({ name: 'iPhone 14', description: 'Great smartphone with big display' })
        await createProduct({ name: 'Laptop', description: 'Portable computer' })

        const response = await api
            .get('/api/admin/products?search=iPhone')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(1)
        expect(response.body.products[0].name).toBe('iPhone 14')
    })

    it('paginates results', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createProduct({ name: 'A' })
        await createProduct({ name: 'B' })
        await createProduct({ name: 'C' })

        const response = await api
            .get('/api/admin/products?page=2&limit=2')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(1)
        expect(response.body.pagination.totalProducts).toBe(3)
        expect(response.body.pagination.totalPages).toBe(2)
        expect(response.body.pagination.currentPage).toBe(2)
    })

    it('sorts by price asc when sort is provided', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createProduct({ name: 'B', price: 200 })
        await createProduct({ name: 'A', price: 50 })

        const response = await api
            .get('/api/admin/products?sort={\"price\":1}')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.products.length).toBe(2)
        expect(response.body.products[0].price).toBe(50)
        expect(response.body.products[1].price).toBe(200)
    })
})
