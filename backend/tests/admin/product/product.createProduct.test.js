const {
    api,
    waitForDb,
    createUser,
    createBrand,
    createCategory,
    getAuthToken,
    logIfServerError,
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

describe('POST /api/admin/products', () => {
    it('returns 401 when no token', async () => {
        const response = await api.post('/api/admin/products').send({ name: 'iPhone' })
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .post('/api/admin/products')
            .set('Authorization', 'Bearer invalidtoken')
            .send({ name: 'iPhone' })

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .post('/api/admin/products')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'iPhone' })

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 on validation error (missing fields)', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .post('/api/admin/products')
            .set('Authorization', `Bearer ${token}`)
            .send({})

        logIfServerError(response)
        expect(response.status).toBe(400)
    })

    it('returns 400 on invalid photo url', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const brand = await createBrand()
        const category = await createCategory()

        const response = await api
            .post('/api/admin/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'iPhone',
                price: 999,
                photos: ['not-a-url'],
                description: 'This is a valid long description for the product.',
                category: category._id,
                brand: brand._id,
                stock: 5,
            })

        logIfServerError(response)
        expect(response.status).toBe(400)
    })

    it('creates product with valid data', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const brand = await createBrand()
        const category = await createCategory()

        const response = await api
            .post('/api/admin/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'iPhone',
                price: 999,
                photos: ['https://example.com/p.jpg'],
                description: 'This is a valid long description for the product.',
                category: category._id,
                brand: brand._id,
                stock: 5,
            })

        logIfServerError(response)
        expect(response.status).toBe(201)
        expect(response.body.name).toBe('iPhone')
        expect(response.body.price).toBe(999)
        expect(response.body.stock).toBe(5)
    })

    it('returns 400 for invalid brand/category id format', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .post('/api/admin/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'iPhone',
                price: 999,
                photos: ['https://example.com/p.jpg'],
                description: 'This is a valid long description for the product.',
                category: 'invalid-id',
                brand: 'invalid-id',
                stock: 5,
            })

        logIfServerError(response)
        expect(response.status).toBe(400)
    })
})
