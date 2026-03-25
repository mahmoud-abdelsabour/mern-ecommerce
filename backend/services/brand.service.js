const Brand = require('../models/brand.model')
const Product = require('../models/product.model')
const slugify = require('slugify')

const getAllBrands = async (data) => {
    try {
        const { page = 1, limit = 10 } = data

        const pageNumber = Math.max(Number(page) || 1, 1)
        const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
        const skip = (pageNumber - 1) * pageSize

        const [brands, totalBrands] = await Promise.all([
            Brand.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize),
            Brand.countDocuments()
        ])

        const brandsWithCounts = await Promise.all(
            brands.map(async (brand) => {
                const productsCount = await Product.countDocuments({ brand: brand.id })
                return { ...brand.toJSON(), productsCount }
            })
        )

        return {
            brands: brandsWithCounts,
            pagination: {
                totalBrands,
                totalPages: Math.ceil(totalBrands / pageSize),
                currentPage: pageNumber,
                limit: pageSize,
                hasMore: skip + brands.length < totalBrands
            }
        }
    } catch (error) {
        throw error
    }
}

const getBrandById = async ({ brandId }) => {
    try {
        const brand = await Brand.findById(brandId)
        if (!brand) {
            throw Object.assign(new Error('brand not found'), { statusCode: 404 })
        }

        const productsCount = await Product.countDocuments({ brand: brandId })

        return {
            ...brand.toJSON(),
            productsCount
        }
    } catch (error) {
        throw error
    }
}

const createBrand = async (data) => {
    try {
        const { name, logo } = data

        const slug = slugify(name, { lower: true, strict: true })

        const brand = new Brand({
            name,
            slug,
            logo
        })

        const savedBrand = await brand.save()
        return savedBrand
    } catch (error) {
        throw error
    }
}

const updateBrand = async ({ brandId, updateData }) => {
    try {
        const updateOps = await pickAllowedFields({
            allowedFields: ['name', 'logo'],
            requestFields: updateData,
            user: null
        })

        if (updateOps.$set.name) {
            updateOps.$set.slug = slugify(updateOps.$set.name, { lower: true, strict: true })
        }

        const updatedBrand = await Brand.findByIdAndUpdate(
            brandId,
            updateOps,
            { new: true, runValidators: true, context: 'query' }
        )

        if (!updatedBrand) {
            throw Object.assign(new Error('brand not found'), { statusCode: 404 })
        }

        return {
            ...updatedBrand.toJSON(),
        }
    } catch (error) {
        throw error
    }
}

const deleteBrand = async ({ brandId }) => {
    try {
        const brand = await Brand.findByIdAndUpdate(
            brandId,
            { $set: { isDeleted: true } },
            { new: true, runValidators: true, context: 'query' }
        )

        if (!brand) {
            throw Object.assign(new Error('brand not found'), { statusCode: 404 })
        }

        await Product.updateMany(
            { brand: brandId },
            { $set: { isDeleted: true } }
        )

        return brand
    } catch (error) {
        throw error
    }
}

const restoreBrand = async ({ brandId }) => {
    try {
        const brand = await Brand.findByIdAndUpdate(
            brandId,
            { $set: { isDeleted: false } },
            { new: true, runValidators: true, context: 'query' }
        )

        if (!brand) {
            throw Object.assign(new Error('brand not found'), { statusCode: 404 })
        }

        await Product.updateMany(
            { brand: brandId },
            { $set: { isDeleted: false } }
        )

        return brand
    } catch (error) {
        throw error
    }
}


module.exports = {
    createBrand,
    deleteBrand,
    restoreBrand,
    getAllBrands,
    getBrandById,
    updateBrand
}