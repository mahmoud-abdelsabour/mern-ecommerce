const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../app')

const api = request(app)

const waitForDb = (timeoutMs = 20000) => {
    if (mongoose.connection.readyState === 1) return Promise.resolve()
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('MongoDB connection timeout')), timeoutMs)
        mongoose.connection.once('open', () => {
            clearTimeout(timer)
            resolve()
        })
        mongoose.connection.once('error', (err) => {
            clearTimeout(timer)
            reject(err)
        })
    })
}

module.exports = {
    api,
    mongoose,
    waitForDb
}
