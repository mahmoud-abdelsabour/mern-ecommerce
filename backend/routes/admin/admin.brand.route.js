const express = require('express')
const brandController = require('../../controllers/brand.controller')
const brandValidator = require('../../validators/brand.validator')
const { asyncWrapper, validate, auth, role } = require('../../utils/middleware/index')
//api/admin/brands
const router = express.Router()

router.post(
    '/',
    auth,
    role('admin'),
    validate(brandValidator.createBrandSchema),
    asyncWrapper(brandController.createBrand)
)

router.get(
    '/',
    auth,
    role('admin'),
    asyncWrapper(brandController.getAllBrands)
)

router.get(
    '/:brandId',
    auth,
    role('admin'),
    asyncWrapper(brandController.getBrandById)
)

router.patch(
    '/:brandId',
    auth,
    role('admin'),
    validate(brandValidator.updateBrandSchema),
    asyncWrapper(brandController.updateBrand)
)

router.delete(
    '/:brandId',
    auth,
    role('admin'),
    asyncWrapper(brandController.softDeleteBrand)
)

router.patch(
    '/:brandId/restore',
    auth,
    role('admin'),
    asyncWrapper(brandController.restoreBrand)
)

module.exports = router