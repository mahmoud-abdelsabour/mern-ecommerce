const userService = require('../services/user.service')


const updateProfile = async (request, response) => {
  const fields = request.body
  const updatedUser = userService.updateProfile(request.user, fields)
  return response.status(200).json(updatedUser);
}



const createAddress = async (request, response) => {
  const newAddress = request.body
  const user = request.user
  const updatedUser = userService.createAddress(newAddress, user)
    
  return response.status(201).json({
    message: "Address added successfully",
    addresses: updatedUser.addresses
  });
}

const updateAddress = async (request, response) => {
  const user = request.user
  const { addressId } = request.params
  const fields = request.body

  if (!addressId) {
    return response.status(400).json({ error: "addressId is required" });
  }
  const updatedUser = userService.updateAddress(fields, addressId, user)

  return response.status(200).json({
    message: "Address updated successfully",
    addresses: updatedUser.addresses
  })
}

module.exports = { updateProfile, createAddress, updateAddress }