const { isExistedUser, isUserAuthorized } = require('./auth.service')
const User = require('../models/user.model')

const userProfileAllowedFields = [
    "firstName",
    "lastName",
    "username",
    "email",
    "phone",
    "profilePhoto"
]

const addressAllowedFields = [
    "country",
    "city",
    "street",
    "building",
    "postalcode",
    "special_mark",
    "floor"
]

const pickAllowedFields = (props) => {
    const updates = {};
    for (const field of props.allowedFields) {
        if (props.requestFields[field] !== undefined) {
            updates[field] = props.requestFields[field];
        }
    }

    const updateOps = {$set: updates}

    const {_, message} = isExistedUser(updates, data.user.id)
    if(message) throw Object.assign(new Error(message), { statusCode: 409 })

    if(updates.email){
        updateOps.$inc = { tokenVersion: 1 }
    }

    return updateOps
}

const updateProfile = async (data) => {
    if(!isUserAuthorized(data.userId, data.user)) throw Object.assign(new error("user is unauthorized"), {statusCode: 401})
        
    const updateOps = pickAllowedFields(userProfileAllowedFields, data.fields)

    const updatedUser = await User.findByIdAndUpdate(
        data.user.id,
        updateOps,
        { new: true, runValidators: true, context: "query" }
    ).select("-passwordHash");
    
    if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
    return updatedUser
}

const createAddress = async (data) => {
    if(!isUserAuthorized(data.userId, data.user)) throw Object.assign(new error("user is unauthorized"), {statusCode: 401})

    const updatedUser = await User.findByIdAndUpdate(
      data.user.id,
      { $push: { addresses: data.newAddress } },
      { new: true, runValidators: true, context: "query" }
    ).select("-passwordHash");

    if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
    return updatedUser
}

const updateAddress = async (data) => {
    if(!isUserAuthorized(data.userId, data.user)) throw Object.assign(new error("user is unauthorized"), {statusCode: 401})
    const updateOps = pickAllowedFields(addressAllowedFields, data.fields)

    const updatedUser = await User.findOneAndUpdate(
      {_id: data.user.id, "addresses._id": data.addressId},
      updateOps,
      { new: true, runValidators: true, context: "query" }
    ).select("-passwordHash")

    if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
    return updatedUser
}

const getUser = async (data) => {
    if(!isUserAuthorized(data.userId, data.user)) throw Object.assign(new error("user is unauthorized"), {statusCode: 401})
    const user = await User.findById(data.user.id)
    if(!user) throw Object.assign(new error("user not found"), {statusCode: 404})
    return user
}

module.exports = {
    updateProfile,
    createAddress,
    updateAddress,
    getUser
}