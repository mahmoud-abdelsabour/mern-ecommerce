const {
    api,
    waitForDb,
    createUser,
    createProduct,
    seedOrder,
    getAuthToken,
    logIfServerError,
    dropDatabase,
    closeDb
} = require('../../helper')
const User = require('../../../models/user.model')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('GET /api/admin/users', () => {
    it('returns 401 when no token', async () => {
        const response = await api.get('/api/admin/users')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .get('/api/admin/users')
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('returns 403 for non-admin role', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(403)
        expect(response.body.error).toBe('forbidden')
    })

    it('returns only non-deleted users by default', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const active = await createUser()
        const deleted = await createUser()
        await User.findByIdAndUpdate(deleted.user._id, { $set: { isDeleted: true } })

        const response = await api
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.users.length).toBe(2)
        const ids = response.body.users.map(u => String(u._id))
        expect(ids).toContain(active.user._id.toString())
    })

    it('returns deleted only when onlyDeleted=true', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        await createUser()
        const deleted = await createUser()
        await User.findByIdAndUpdate(deleted.user._id, { $set: { isDeleted: true } })

        const response = await api
            .get('/api/admin/users?onlyDeleted=true')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.users.length).toBe(1)
        expect(String(response.body.users[0]._id)).toBe(deleted.user._id.toString())
    })

    it('returns both when includeDeleted=true', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        await createUser()
        const deleted = await createUser()
        await User.findByIdAndUpdate(deleted.user._id, { $set: { isDeleted: true } })

        const response = await api
            .get('/api/admin/users?includeDeleted=true')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.users.length).toBe(3)
    })

    it('filters by role', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        await createUser()
        await createUser({ role: 'admin' })

        const response = await api
            .get('/api/admin/users?role=admin')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.users.length).toBe(2)
        expect(response.body.users.every(u => u.role === 'admin')).toBe(true)
    })

    it('filters by search', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        await createUser({ firstName: 'Mahmoud', lastName: 'Ahmed' })
        await createUser({ firstName: 'Other', lastName: 'User' })

        const response = await api
            .get('/api/admin/users?search=Mahmoud')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.users.length).toBe(1)
        expect(response.body.users[0].firstName).toBe('Mahmoud')
    })

    it('filters by hasOrders=true', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user } = await createUser()
        const { product } = await createProduct()
        await seedOrder({ user, product, status: 'pending' })

        await createUser()

        const response = await api
            .get('/api/admin/users?hasOrders=true')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.users.length).toBe(1)
        expect(response.body.users[0].totalOrders).toBe(1)
    })

    it('filters by minOrders/maxOrders', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user: userA } = await createUser()
        const { user: userB } = await createUser()
        const { product } = await createProduct()

        await seedOrder({ user: userA, product, status: 'pending' })
        await seedOrder({ user: userA, product, status: 'pending' })
        await seedOrder({ user: userB, product, status: 'pending' })

        const response = await api
            .get('/api/admin/users?minOrders=2&maxOrders=2')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.users.length).toBe(1)
        expect(response.body.users[0].totalOrders).toBe(2)
    })

    it('sorts by totalOrders high', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        const { user: userA } = await createUser()
        const { user: userB } = await createUser()
        const { product } = await createProduct()

        await seedOrder({ user: userA, product, status: 'pending' })
        await seedOrder({ user: userA, product, status: 'pending' })
        await seedOrder({ user: userB, product, status: 'pending' })

        const response = await api
            .get('/api/admin/users?sortOrders=high')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.users.length).toBe(3)
        expect(response.body.users[0].totalOrders).toBe(2)
        expect(response.body.users[1].totalOrders).toBe(1)
    })

    it('paginates results', async () => {
        const { user: admin } = await createUser({ role: 'admin' })
        const token = getAuthToken(admin)

        await createUser()
        await createUser()
        await createUser()

        const response = await api
            .get('/api/admin/users?page=2&limit=2')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.users.length).toBe(2)
        expect(response.body.pagination.totalUsers).toBe(4)
        expect(response.body.pagination.totalPages).toBe(2)
        expect(response.body.pagination.currentPage).toBe(2)
    })
})
