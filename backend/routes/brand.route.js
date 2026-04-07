const express = require('express')
const brandPublicController = require('../controllers/brand.public.controller')
const { asyncWrapper } = require('../utils/middleware')

// /api/brands
const router = express.Router()

router.get('/', asyncWrapper(brandPublicController.getBrands))

module.exports = router

