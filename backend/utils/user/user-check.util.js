const User = require('../../models/user.model')

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

module.exports = {
    isExistedUser
}