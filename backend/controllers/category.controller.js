const categoryService = require('../services/category.service')

const createCategory = async (request, response) => {
    const category = await categoryService.createCategory(request.body)
    return response.status(201).json(category)
}

const getAllCategories = async (request, response) => {
    const result = await categoryService.getAllCategories({ ...request.query })
    return response.status(200).json(result)
}

const updateCategory = async (request, response) => {
    const { categoryId } = request.params
    const category = await categoryService.updateCategory({ categoryId, updateData: request.body })
    return response.status(200).json(category)
}

const deleteCategory = async (request, response) => {
    const { categoryId } = request.params
    const category = await categoryService.deleteCategory({ categoryId })
    return response.status(200).json(category)
}

module.exports = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
}
