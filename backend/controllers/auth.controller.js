const authService = require('../services/auth.service')

const register = async (request, response) => {
  const user = await authService.register(request.body)
  response.status(201).json(user)
}

const login = async (request, response) => {
  const {token, user} = authService.login(request.body)
  response
  .status(200)
  .send({ token, username: user.username, firstName: user.firstName, lastName: user.lastName })
}

const updatePassword = async (request, response) => {
  const updatedUser = authService.updatePassword(request.body)
  return response.status(200).json(updatedUser);
}

module.exports = {
    register,
    login,
    updatePassword
}