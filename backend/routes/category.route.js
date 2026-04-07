const express = require('express')
const categoryPublicController = require('../controllers/category.public.controller')
const { asyncWrapper } = require('../utils/middleware')

// /api/categories
const router = express.Router()

router.get('/', asyncWrapper(categoryPublicController.getCategories))

module.exports = router

