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
    const {fields} = data    
    const updateOps = await pickAllowedFields({userProfileAllowedFields, fields})

    const updatedUser = await User.findByIdAndUpdate(
        data.user.id,
        updateOps,
        { new: true, runValidators: true, context: "query" }
    ).select("-passwordHash");
    
    if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
    return updatedUser
}

const createAddress = async (data) => {
    const updatedUser = await User.findByIdAndUpdate(
      data.user.id,
      { $push: { addresses: data.newAddress } },
      { new: true, runValidators: true, context: "query" }
    ).select("-passwordHash");

    if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
    return updatedUser
}

const updateAddress = async (data) => {
    const {fields} = data
    const updateOps = await pickAllowedFields({addressAllowedFields, fields})

    const updatedUser = await User.findOneAndUpdate(
      {_id: data.user.id, "addresses._id": data.addressId},
      updateOps,
      { new: true, runValidators: true, context: "query" }
    ).select("-passwordHash")

    if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
    return updatedUser
}

const getUser = async (data) => {
    const user = await User.findById(data.user.id)
    if(!user) throw Object.assign(new Error("user not found"), {statusCode: 404})
    return user
}

module.exports = {
    updateProfile,
    createAddress,
    updateAddress,
    getUser
}