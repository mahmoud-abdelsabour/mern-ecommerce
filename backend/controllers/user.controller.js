const userService = require('../services/user.service')

const getAllUsers = async (request, response) => {
    const result = await userService.getAllUsers({ ...request.query })
    return response.status(200).json(result)
}

const getUserById = async (request, response) => {
    const { userId } = request.params
    const user = await userService.getUser({ userId })
    return response.status(200).json(user)
}

const getUserProfile = async (request, response) => {
    const { user } = request
    const retrievedUser = await userService.getUser({ user })
    response.status(200).json(retrievedUser)
}

const updateProfile = async (request, response) => {
    const fields = request.body
    const updatedUser = await userService.updateProfile({ user: request.user, fields })
    return response.status(200).json(updatedUser)
}

const createAddress = async (request, response) => {
    const newAddress = request.body
    const { user } = request
    const updatedUser = await userService.createAddress({ newAddress, user })

    return response.status(201).json({
        message: 'Address added successfully',
        addresses: updatedUser.addresses,
    })
}

const updateAddress = async (request, response) => {
    const { user } = request
    const { addressId } = request.params
    const fields = request.body

    if (!addressId) {
        return response.status(400).json({ error: 'addressId is required' })
    }
    const updatedUser = await userService.updateAddress({ fields, addressId, user })

    return response.status(200).json({
        message: 'Address updated successfully',
        addresses: updatedUser.addresses,
    })
}

const deleteAddress = async (request, response) => {
    const { user } = request
    const { addressId } = request.params

    if (!addressId) {
        return response.status(400).json({ error: 'addressId is required' })
    }

    const updatedUser = await userService.deleteAddress({ addressId, user })

    return response.status(200).json({
        message: 'Address deleted successfully',
        addresses: updatedUser.addresses,
    })
}

const makeAdmin = async (request, response) => {
    const { userId } = request.params
    const user = await userService.makeAdmin({ userId })
    return response.status(200).json(user)
}

const deleteUser = async (request, response) => {
    const { user } = request
    const result = await userService.deleteUser({ user })
    return response.status(200).json(result)
}

module.exports = {
    getAllUsers,
    getUserById,
    updateProfile,
    createAddress,
    updateAddress,
    deleteAddress,
    getUserProfile,
    makeAdmin,
    deleteUser,
}
