const userService = require('../services/user.service')

const getUserProfile = async (request, response) => {
  const user = request.user
  const {userId} = request.params

  const retrievedUser = await userService.getUser({user, userId})
  response.status(200).json(retrievedUser)
}

const updateProfile = async (request, response) => {
  const fields = request.body
  const {userId} = request.params
  const updatedUser = await userService.updateProfile({user: request.user, fields, userId})
  return response.status(200).json(updatedUser);
}

const createAddress = async (request, response) => {
  const newAddress = request.body
  const user = request.user
  const {userId} = request.params
  const updatedUser = await userService.createAddress({newAddress, user, userId})
    
  return response.status(201).json({
    message: "Address added successfully",
    addresses: updatedUser.addresses
  });
}

const updateAddress = async (request, response) => {
  const user = request.user
  const { addressId, userId } = request.params
  const fields = request.body

  if (!addressId) {
    return response.status(400).json({ error: "addressId is required" });
  }
  const updatedUser = await userService.updateAddress({fields, addressId, user, userId})

  return response.status(200).json({
    message: "Address updated successfully",
    addresses: updatedUser.addresses
  })
}

module.exports = { 
  updateProfile,
  createAddress,
  updateAddress,
  getUserProfile 
}