const {
    api,
    waitForDb,
    createUser,
    createCategory,
    createProduct,
    getAuthToken,
    logIfServerError,
    mongoose,
    dropDatabase,
    closeDb,
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

describe('GET /api/admin/categories', () => {
    it('returns 401 when no token', async () => {
        const response = await api.get('/api/admin/categories')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .get('/api/admin/categories')
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .get('/api/admin/categories')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns categories with productsCount', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const category = await createCategory({ name: 'Phones', slug: 'phones' })
        await createProduct({ category })

        const response = await api
            .get('/api/admin/categories')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.categories.length).toBe(1)
        expect(response.body.categories[0].name).toBe('Phones')
        expect(response.body.categories[0].productsCount).toBe(1)
    })

    it('paginates results', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createCategory({ name: 'A', slug: 'a' })
        await createCategory({ name: 'B', slug: 'b' })
        await createCategory({ name: 'C', slug: 'c' })

        const response = await api
            .get('/api/admin/categories?page=2&limit=2')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.categories.length).toBe(1)
        expect(response.body.pagination.totalCategories).toBe(3)
        expect(response.body.pagination.totalPages).toBe(2)
        expect(response.body.pagination.currentPage).toBe(2)
    })

    it('filters by search', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createCategory({ name: 'Phones', slug: 'phones' })
        await createCategory({ name: 'Tablets', slug: 'tablets' })

        const response = await api
            .get('/api/admin/categories?search=Phones')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.categories.length).toBe(1)
        expect(response.body.categories[0].name).toBe('Phones')
    })

    it('filters by hasProducts=true', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const withProducts = await createCategory({ name: 'Phones', slug: 'phones' })
        await createProduct({ category: withProducts })
        await createCategory({ name: 'Accessories', slug: 'accessories' })

        const response = await api
            .get('/api/admin/categories?hasProducts=true')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.categories.length).toBe(1)
        expect(response.body.categories[0].name).toBe('Phones')
        expect(response.body.categories[0].productsCount).toBe(1)
    })

    it('filters by hasProducts=false', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const withProducts = await createCategory({ name: 'Phones', slug: 'phones' })
        await createProduct({ category: withProducts })
        await createCategory({ name: 'Accessories', slug: 'accessories' })

        const response = await api
            .get('/api/admin/categories?hasProducts=false')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.categories.length).toBe(1)
        expect(response.body.categories[0].name).toBe('Accessories')
        expect(response.body.categories[0].productsCount).toBe(0)
    })
})
