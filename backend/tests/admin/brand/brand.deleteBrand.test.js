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

describe('DELETE /api/admin/brands/:brandId', () => {
    it('returns 401 when no token', async () => {
        const brand = await createBrand({ name: 'Apple', slug: 'apple' })
        const response = await api.delete(`/api/admin/brands/${brand._id}`)
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const brand = await createBrand({ name: 'Apple', slug: 'apple' })

        const response = await api
            .delete(`/api/admin/brands/${brand._id}`)
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)
        const brand = await createBrand({ name: 'Apple', slug: 'apple' })

        const response = await api
            .delete(`/api/admin/brands/${brand._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns 400 for invalid brand id', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .delete('/api/admin/brands/invalid-id')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(400)
        expect(response.body.error).toBe('malformatted id')
    })

    it('returns 404 when brand not found', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .delete('/api/admin/brands/64b8f3a7f3a2c2a7f3a2c2a7')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(404)
        expect(response.body.message).toBe('brand not found')
    })

    it('soft deletes the brand (isDeleted=true)', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)
        const brand = await createBrand({ name: 'Apple', slug: 'apple' })

        const response = await api
            .delete(`/api/admin/brands/${brand._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.isDeleted).toBe(true)

        const stored = await Brand.findById(brand._id)
        expect(stored.isDeleted).toBe(true)
    })

    it('returns 500 when brand has products (current behavior)', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)
        const brand = await createBrand({ name: 'Apple', slug: 'apple' })

        await createProduct({ brand })

        const response = await api
            .delete(`/api/admin/brands/${brand._id}`)
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(500)
        expect(response.body.message).toBe('Brand has products, cannot delete')
    })
})
