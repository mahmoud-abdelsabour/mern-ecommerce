const authService = require('../services/auth.service')

const register = async (request, response) => {
    const user = await authService.register(request.body)
    response.status(201).json(user)
}

const login = async (request, response) => {
    const { token, user } = await authService.login(request.body)
    response.status(200).send({
        token,
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto ?? null,
    })
}

const updatePassword = async (request, response) => {
    const { user } = request
    const updatedUser = await authService.updatePassword({ ...request.body, user })
    return response.status(200).json(updatedUser)
}

module.exports = {
    register,
    login,
    updatePassword,
}
