const app = require('./app') // varsinainen Express-sovellus
const config = require('./utils/config/config')
const {logger} = require('./utils/middleware/index')

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})