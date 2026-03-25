const express = require('express')
const brandController = require('../../controllers/brand.controller')
const brandValidator = require('../../validators/brand.validator')
const { asyncWrapper, validate, auth, role } = require('../../utils/middleware/index')

const router = express.Router()

router.post(
    '/brands',
    auth,
    role('admin'),
    validate(brandValidator.createBrandSchema),
    asyncWrapper(brandController.createBrand)
)

router.get(
    '/brands',
    auth,
    role('admin'),
    asyncWrapper(brandController.getAllBrands)
)

router.get(
    '/brands/:brandId',
    auth,
    role('admin'),
    asyncWrapper(brandController.getBrandById)
)

router.patch(
    '/brands/:brandId',
    auth,
    role('admin'),
    validate(brandValidator.updateBrandSchema),
    asyncWrapper(brandController.updateBrand)
)

router.delete(
    '/brands/:brandId',
    auth,
    role('admin'),
    asyncWrapper(brandController.softDeleteBrand)
)

router.patch(
    '/brands/:brandId/restore',
    auth,
    role('admin'),
    asyncWrapper(brandController.restoreBrand)
)

module.exports = router