const bcrypt = require('bcrypt')

const hashingValue = async (password, saltRounds = 10) => await bcrypt.hash(password, saltRounds)

const passwordCompare = async (inputPassword, userPassword) => {
    const isCorrect = await bcrypt.compare(inputPassword, userPassword)
    if (!isCorrect) throw Object.assign(new Error('invalid credentials'), { statusCode: 401 })
    return true
}

module.exports = {
    hashingValue,
    passwordCompare,
}
