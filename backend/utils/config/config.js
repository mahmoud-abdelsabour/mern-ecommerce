require('dotenv').config()

let PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI
let JWT_SECRET = process.env.JWT_SECRET
let JWT_EXPIRES_ON = process.env.JWT_EXPIRES_ON

module.exports = {
  MONGODB_URI,
  PORT,
  JWT_SECRET,
  JWT_EXPIRES_ON
}