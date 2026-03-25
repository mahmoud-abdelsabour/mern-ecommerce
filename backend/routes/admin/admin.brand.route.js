// admin.brand.route.js
router.post(
    '/brands',
    auth,
    role('admin'),
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
