const bcrypt = require('bcrypt')
const User = require('../backend/models/user.model')
const config = require('../utils/config/config')

const isExistedUser = async (data, excludeUserId = null) => {
    const exclude = excludeUserId ? {_id: {$ne: excludeUserId}} : {}

    if(data.username){
        const usernameTaken = await User.findOne({username: data.username, ...exclude})
        if(usernameTaken) return {user: usernameTaken, message:'username already exits'}
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

const hashingValue = async (password, saltRounds) => await bcrypt.hash(password, saltRounds)

const passwordCompare = async (inputPassword, userPassword) => {
   const isCorrect = await bcrypt.compare(inputPassword, userPassword)
   if(!isCorrect) throw Object.assign(new Error('invalid credentials'), { statusCode: 401 })
    return true
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

const incrementTokenVersion = (user) => user.tokenVersion += 1

const register = async (data) => {
    const {firstName, lastName, username, phone, email, password} = data

    const {_, message} = await isExistedUser(username, email, phone)
    if(message !== '') throw Object.assign(new Error(message), { statusCode: 409 })

    const hashedPassword = hashingValue(password, 10)

    const newUser = new User({
        firstName,
        lastName,
        username,
        phone,
        email,
        hashedPassword
    })
    
    const savedUser = await newUser.save()
    return savedUser
}

const login = (data) => {
    const {email, password} = data
    const {user, _} = isExistedUser(email)

    const isCorrect = passwordCompare(password, user.passwordHash)

    const token = createToken(user)

    return {token, user}
}

const updatePassword = async (data) => {
    const {currentPassword, newPassword} = data
    const user = request.user

    passwordCompare(currentPassword, user.passwordHash)

    const hashedPassword = hashingValue(newPassword, 10)

    const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $set: {passwordHash: hashedPassword, tokenVersion: incrementTokenVersion(user)} },
        { new: true, runValidators: true, context: "query" }
    ).select("-passwordHash");

    if (!updatedUser) throw Object.assign(new error("user not found"), {statusCode: 404})
    
    return updatedUser

}

module.exports = {
    register,
    login,
    updatePassword,
    isExistedUser
}