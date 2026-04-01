const {
    api,
    waitForDb,
    createUser,
    createBrand,
    createProduct,
    getAuthToken,
    logIfServerError,
    closeDb,
    dropDatabase,
} = require('../../helper')
const Brand = require('../../../models/brand.model')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('GET /api/admin/brands', () => {
    it('returns 401 when no token', async () => {
        const response = await api.get('/api/admin/brands')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .get('/api/admin/brands')
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api.get('/api/admin/brands').set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns only non-deleted brands by default', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const active = await createBrand({ name: 'Active', slug: 'active' })
        const deleted = await createBrand({ name: 'Deleted', slug: 'deleted' })
        await Brand.findByIdAndUpdate(deleted._id, { $set: { isDeleted: true } })

        const response = await api.get('/api/admin/brands').set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.brands.length).toBe(1)
        expect(response.body.brands[0].name).toBe(active.name)
    })

    it('returns deleted only when onlyDeleted=true', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const active = await createBrand({ name: 'Active', slug: 'active' })
        const deleted = await createBrand({ name: 'Deleted', slug: 'deleted' })
        await Brand.findByIdAndUpdate(deleted._id, { $set: { isDeleted: true } })

        const response = await api
            .get('/api/admin/brands?onlyDeleted=true')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.brands.length).toBe(1)
        expect(response.body.brands[0].name).toBe(deleted.name)
    })

    it('returns both when includeDeleted=true', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createBrand({ name: 'Active', slug: 'active' })
        const deleted = await createBrand({ name: 'Deleted', slug: 'deleted' })
        await Brand.findByIdAndUpdate(deleted._id, { $set: { isDeleted: true } })

        const response = await api
            .get('/api/admin/brands?includeDeleted=true')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.brands.length).toBe(2)
    })

    it('filters by search', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createBrand({ name: 'Apple', slug: 'apple' })
        await createBrand({ name: 'Samsung', slug: 'samsung' })

        const response = await api
            .get('/api/admin/brands?search=Apple')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.brands.length).toBe(1)
        expect(response.body.brands[0].name).toBe('Apple')
    })

    it('filters by hasProducts=true', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const brandWithProducts = await createBrand({ name: 'WithProducts', slug: 'withproducts' })
        await createProduct({ brand: brandWithProducts })
        await createBrand({ name: 'NoProducts', slug: 'noproducts' })

        const response = await api
            .get('/api/admin/brands?hasProducts=true')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.brands.length).toBe(1)
        expect(response.body.brands[0].name).toBe('WithProducts')
        expect(response.body.brands[0].productsCount).toBe(1)
    })

    it('filters by hasProducts=false', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const brandWithProducts = await createBrand({ name: 'WithProducts', slug: 'withproducts' })
        await createProduct({ brand: brandWithProducts })
        await createBrand({ name: 'NoProducts', slug: 'noproducts' })

        const response = await api
            .get('/api/admin/brands?hasProducts=false')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.brands.length).toBe(1)
        expect(response.body.brands[0].name).toBe('NoProducts')
        expect(response.body.brands[0].productsCount).toBe(0)
    })

    it('filters by minProducts', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const brandA = await createBrand({ name: 'A', slug: 'a' })
        const brandB = await createBrand({ name: 'B', slug: 'b' })

        await createProduct({ brand: brandA })
        await createProduct({ brand: brandA })
        await createProduct({ brand: brandB })

        const response = await api
            .get('/api/admin/brands?minProducts=2')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.brands.length).toBe(1)
        expect(response.body.brands[0].name).toBe('A')
        expect(response.body.brands[0].productsCount).toBe(2)
    })

    it('filters by maxProducts', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const brandA = await createBrand({ name: 'A', slug: 'a' })
        const brandB = await createBrand({ name: 'B', slug: 'b' })

        await createProduct({ brand: brandA })
        await createProduct({ brand: brandA })
        await createProduct({ brand: brandB })

        const response = await api
            .get('/api/admin/brands?maxProducts=1')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.brands.length).toBe(1)
        expect(response.body.brands[0].name).toBe('B')
        expect(response.body.brands[0].productsCount).toBe(1)
    })

    it('filters by both minProducts and maxProducts', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const brandA = await createBrand({ name: 'A', slug: 'a' })
        const brandB = await createBrand({ name: 'B', slug: 'b' })
        const brandC = await createBrand({ name: 'C', slug: 'c' })

        await createProduct({ brand: brandA })
        await createProduct({ brand: brandA })
        await createProduct({ brand: brandB })
        await createProduct({ brand: brandC })
        await createProduct({ brand: brandC })
        await createProduct({ brand: brandC })

        const response = await api
            .get('/api/admin/brands?minProducts=2&maxProducts=2')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.brands.length).toBe(1)
        expect(response.body.brands[0].name).toBe('A')
        expect(response.body.brands[0].productsCount).toBe(2)
    })

    it('sorts results by name asc when sort is provided', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        await createBrand({ name: 'B', slug: 'b' })
        await createBrand({ name: 'A', slug: 'a' })

        const response = await api
            .get('/api/admin/brands?sort={\"name\":1}')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.brands.length).toBe(2)
        expect(response.body.brands[0].name).toBe('A')
        expect(response.body.brands[1].name).toBe('B')
    })
})
