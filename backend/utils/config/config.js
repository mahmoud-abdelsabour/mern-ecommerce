require('dotenv').config()

const { PORT } = process.env
const MONGODB_URI =
    process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI
const { JWT_SECRET } = process.env
const { JWT_EXPIRES_IN } = process.env

module.exports = {
    MONGODB_URI,
    PORT,
    JWT_SECRET,
    JWT_EXPIRES_IN,
}
