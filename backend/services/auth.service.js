const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const config = require('../utils/config/config')
const {hashingValue, passwordCompare} = require('../utils/auth/password.util')

const isExistedUser = async (data, excludeUserId = null) => {
    const exclude = excludeUserId ? {_id: {$ne: excludeUserId}} : {}

    if(data.username){
        const usernameTaken = await User.findOne({username: data.username, ...exclude})
        if(usernameTaken) return {user: usernameTaken, message:'username already exists'}
    }

    if(data.email){
        const emailTaken = await User.findOne({email: data.email, ...exclude})
        if(emailTaken) return {user:emailTaken, message:'email already exist'}
    }

    if(data.phone) {
        const phoneTaken = await User.findOne({phone: data.phone, ...exclude})
        if(phoneTaken) return {user:phoneTaken, message:'phone already exist'}
    }

    return {user: null, message: ''}
}

const createToken = (user) => {

    const token = jwt.sign(
        {
            username: user.username,
            id: user._id,
            tokenVersion: user.tokenVersion
        }, 
        config.JWT_SECRET,
        {expiresIn: config.JWT_EXPIRES_IN}
    )

    return token
}

const incrementTokenVersion = (user) => user.tokenVersion + 1

const isUserAuthorized = (data) => String(data.user.id) === String(data.userId)


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

    if(!isUserAuthorized(userId, user)) 
    {
        throw Object.assign(new Error("user is unauthorized"), {statusCode: 401})
    }

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
    isExistedUser,
    isUserAuthorized
}