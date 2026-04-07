const brandService = require('../services/brand.service')

// Public storefront endpoint: fetch brands for Catalog filters.
const getBrands = async (request, response) => {
    const result = await brandService.getPublicBrands()
    return response.status(200).json(result)
}

module.exports = {
    getBrands,
}

