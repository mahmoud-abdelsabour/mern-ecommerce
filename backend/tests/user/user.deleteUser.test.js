const {
    api,
    waitForDb,
    createUser,
    getAuthToken,
    logIfServerError,
    closeDb,
    dropDatabase
} = require('../helper')

beforeAll(async () => {
    await waitForDb()
})

beforeEach(async () => {
    await dropDatabase()
})

afterAll(async () => {
    await closeDb()
})

describe('DELETE /api/users/me/delete', () => {
    it('returns 401 when no token', async () => {
        const response = await api.delete('/api/users/me/delete')
        logIfServerError(response)

        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token missing')
    })

    it('returns 401 for invalid token', async () => {
        const response = await api
            .delete('/api/users/me/delete')
            .set('Authorization', 'Bearer invalidtoken')

        logIfServerError(response)
        expect(response.status).toBe(401)
        expect(response.body.error).toBe('token invalid or expired')
    })

    it('soft deletes the user and scrubs personal data', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const response = await api
            .delete('/api/users/me/delete')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)

        expect(response.body.isDeleted).toBe(true)
        expect(response.body.deletedAt).toBeTruthy()

        expect(response.body.firstName).toBe('Deleted')
        expect(response.body.lastName).toBe('User')
        expect(response.body.email).toBe(`deleted_${user._id.toString()}@deleted.com`)
        expect(response.body.username).toBe(`deleted_${user._id.toString()}`)
        expect(response.body.phone).toBeNull()
        expect(Array.isArray(response.body.addresses)).toBe(true)
        expect(response.body.addresses.length).toBe(0)
        expect(response.body.profilePhoto).toBeNull()
        expect(Array.isArray(response.body.cart)).toBe(true)
        expect(response.body.cart.length).toBe(0)
        expect(Array.isArray(response.body.wishlist)).toBe(true)
        expect(response.body.wishlist.length).toBe(0)

        expect(response.body.tokenVersion).toBe(1)
        expect(response.body.passwordHash).toBeUndefined()
    })

    it('invalidates the previous token after deletion', async () => {
        const { user } = await createUser()
        const token = getAuthToken(user)

        const deleteResponse = await api
            .delete('/api/users/me/delete')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(deleteResponse)
        expect(deleteResponse.status).toBe(200)

        const profileResponse = await api
            .get('/api/users/me')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(profileResponse)
        expect(profileResponse.status).toBe(401)
    })

    it('allows admin to delete their own account', async () => {
        const { user } = await createUser({ role: 'admin' })
        const token = getAuthToken(user)

        const response = await api
            .delete('/api/users/me/delete')
            .set('Authorization', `Bearer ${token}`)

        logIfServerError(response)
        expect(response.status).toBe(200)
        expect(response.body.isDeleted).toBe(true)
        expect(response.body.role).toBe('admin')
    })
})

