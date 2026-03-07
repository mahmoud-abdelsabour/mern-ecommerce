const { isExistedUser } = require('./auth.service');

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

const updating = (props) => {
    const updates = {};
    for (const field of props.allowedFields) {
        if (props.requestFields[field] !== undefined) {
            updates[field] = props.requestFields[field];
        }
    }

    const updateOps = {$set: updates}

    const {_, message} = isExistedUser(updates, data.user.id)
    if(message) throw Object.assign(new Error(message), { statusCode: 409 })
  

    return updateOps
}

const updateProfile = async (data) => {
    const updateOps = updating(userProfileAllowedFields, data.fields)

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
    const updateOps = updating(addressAllowedFields, data.fields)

    const updatedUser = await User.findByIdAndUpdate(
      {_id: data.user.id, "addresses._id": data.addressId},
      updateOps,
      { new: true, runValidators: true, context: "query" }
    ).select("-passwordHash")

    if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
    return updatedUser
}

module.exports = {
    updateProfile,
    createAddress,
    updateAddress
}