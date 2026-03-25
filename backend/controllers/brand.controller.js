const brandService = require('../services/brand.service')

const createBrand = async (request, response) => {
    const brand = await brandService.createBrand(request.body)
    return response.status(201).json(brand)
}

const getAllBrands = async (request, response) => {
    const result = await brandService.getAllBrands({ ...request.query })
    return response.status(200).json(result)
}

const getBrandById = async (request, response) => {
    const { brandId } = request.params
    const brand = await brandService.getBrandById({ brandId })
    return response.status(200).json(brand)
}

const updateBrand = async (request, response) => {
    const { brandId } = request.params
    const brand = await brandService.updateBrand({ brandId, updateData: request.body })
    return response.status(200).json(brand)
}

const deleteBrand = async (request, response) => {
    const { brandId } = request.params
    const brand = await brandService.deleteBrand({ brandId })
    return response.status(200).json(brand)
}

const restoreBrand = async (request, response) => {
    const { brandId } = request.params
    const brand = await brandService.restoreBrand({ brandId })
    return response.status(200).json(brand)
}

module.exports = {
    createBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    restoreBrand
}
