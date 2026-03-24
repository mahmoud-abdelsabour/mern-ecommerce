const User = require('../models/user.model')
const {pickAllowedFields} = require('../utils/request/pick-fields.util')

const userProfileAllowedFields = [
    "firstName",
    "lastName",
    "username",
    "email",
    "phone",
    "profilePhoto"
]

const addressAllowedFields = [
    "address_name",
    "country",
    "city",
    "street",
    "building",
    "postalcode",
    "special_mark",
    "floor"
]

const updateProfile = async (data) => {    
    try {
        const { fields, user } = data    
        const updateOps = await pickAllowedFields({userProfileAllowedFields, fields})

        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            updateOps,
            { new: true, runValidators: true, context: "query" }
        ).select("-passwordHash");
        
        if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
        return updatedUser
    } catch (error) {
        throw error
    }
}

const createAddress = async (data) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
          data.user.id,
          { $push: { addresses: data.newAddress } },
          { new: true, runValidators: true, context: "query" }
        ).select("-passwordHash");

        if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
        return updatedUser
    } catch (error) {
        throw error
    }
}

const updateAddress = async (data) => {
    try {
        const {fields} = data
        const updateOps = await pickAllowedFields({addressAllowedFields, fields})

        const updatedUser = await User.findOneAndUpdate(
          {_id: data.user.id, "addresses._id": data.addressId},
          updateOps,
          { new: true, runValidators: true, context: "query" }
        ).select("-passwordHash")

        if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
        return updatedUser
    } catch (error) {
        throw error
    }
}

const getUser = async (data) => {
    try {
        const { user } = data
        if(!user) throw Object.assign(new Error("user not found"), {statusCode: 404})
        return user
    } catch (error) {
        throw error
    }
}

module.exports = {
    updateProfile,
    createAddress,
    updateAddress,
    getUser
}
