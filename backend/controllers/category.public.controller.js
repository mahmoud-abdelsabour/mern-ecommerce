const categoryService = require('../services/category.service')

// Public storefront endpoint: fetch categories for Catalog filters.
const getCategories = async (request, response) => {
    const result = await categoryService.getPublicCategories()
    return response.status(200).json(result)
}

module.exports = {
    getCategories,
}

