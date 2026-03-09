const User = require('../models/user.model')
const { hashingValue, passwordCompare } = require('../utils/auth/password.util')
const { createToken, incrementTokenVersion } = require('../utils/auth/token.util')

const register = async (data) => {
    const {firstName, lastName, username, phone, email, password} = data

    const { message } = await isExistedUser({username, email, phone})
    if(message !== '') throw Object.assign(new Error(message), { statusCode: 409 })

    const passwordHash = await hashingValue(password, 10)

    const newUser = new User({
        firstName,
        lastName,
        username,
        phone,
        email,
        passwordHash
    })
    
    const savedUser = await newUser.save()
    return savedUser
}

const login = async (data) => {
    const {email, password} = data
    const { user } = await isExistedUser({ email })
    if (!user) throw Object.assign(new Error('invalid credentials'), { statusCode: 401 });

    await passwordCompare(password, user.passwordHash)
    const token = createToken(user)

    return {token, user}
}

const updatePassword = async (data) => {
    const {currentPassword, newPassword, userId, user} = data

    await passwordCompare(currentPassword, user.passwordHash)

    const passwordHash = await hashingValue(newPassword, 10)

    const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $set: {passwordHash: passwordHash, tokenVersion: incrementTokenVersion(user)} },
        { new: true, runValidators: true, context: "query" }
    ).select("-passwordHash");

    if (!updatedUser) throw Object.assign(new Error("user not found"), {statusCode: 404})
    
    return updatedUser

}

module.exports = {
    register,
    login,
    updatePassword,
}