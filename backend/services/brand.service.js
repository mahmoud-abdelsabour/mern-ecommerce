const slugify = require('slugify')
const Brand = require('../models/brand.model')
const Product = require('../models/product.model')
const { pickAllowedFields } = require('../utils/request/pick-fields.util')
const { PAGINATION } = require('../utils/constants')

const getAllBrands = async data => {
    try {
        const {
            page = 1,
            limit = 10,
            includeDeleted,
            onlyDeleted,
            search,
            hasProducts,
            minProducts,
            maxProducts,
            sort = { createdAt: -1 },
        } = data

        const pageNumber = Math.max(Number(page) || 1, 1)
        const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
        const skip = (pageNumber - 1) * pageSize

        const match = {}

        if (onlyDeleted === 'true' || onlyDeleted === true) {
            match.isDeleted = true
        } else if (includeDeleted === 'true' || includeDeleted === true) {
            // no filter => include all
        } else {
            match.isDeleted = false
        }

        if (search) {
            match.$text = { $search: search }
        }

        let sortObj = { createdAt: -1 }
        if (sort) {
            if (typeof sort === 'object') {
                sortObj = sort
            } else if (typeof sort === 'string') {
                try {
                    sortObj = JSON.parse(sort)
                } catch (e) {
                    sortObj = { createdAt: -1 }
                }
            }
        }

        const sanitizedSort = {}
        for (const key of Object.keys(sortObj || {})) {
            const dir = Number(sortObj[key])
            sanitizedSort[key] = dir === 1 ? 1 : -1
        }
        if (Object.keys(sanitizedSort).length === 0) {
            sanitizedSort.createdAt = -1
        }

        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: 'products',
                    let: { brandId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$brand', '$$brandId'] } } },
                        { $count: 'count' },
                    ],
                    as: 'productsCountArr',
                },
            },
            {
                $addFields: {
                    productsCount: {
                        $ifNull: [{ $arrayElemAt: ['$productsCountArr.count', 0] }, 0],
                    },
                },
            },
            { $project: { productsCountArr: 0 } },
        ]

        if (hasProducts === 'true' || hasProducts === true) {
            pipeline.push({ $match: { productsCount: { $gt: 0 } } })
        } else if (hasProducts === 'false' || hasProducts === false) {
            pipeline.push({ $match: { productsCount: 0 } })
        }

        if (hasProducts !== false && hasProducts !== 'false') {
            if (minProducts !== undefined || maxProducts !== undefined) {
                const countFilter = {}
                if (minProducts !== undefined) countFilter.$gte = Number(minProducts)
                if (maxProducts !== undefined) countFilter.$lte = Number(maxProducts)
                pipeline.push({ $match: { productsCount: countFilter } })
            }
        }

        pipeline.push({
            $facet: {
                data: [{ $sort: sanitizedSort }, { $skip: skip }, { $limit: pageSize }],
                total: [{ $count: 'totalBrands' }],
            },
        })

        const result = await Brand.aggregate(pipeline)
        const brands = result[0]?.data || []
        const totalBrands = result[0]?.total[0]?.totalBrands || 0

        return {
            brands,
            pagination: {
                totalBrands,
                totalPages: Math.ceil(totalBrands / pageSize),
                currentPage: pageNumber,
                limit: pageSize,
                hasMore: skip + brands.length < totalBrands,
            },
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
            productsCount,
        }
    } catch (error) {
        throw error
    }
}

const createBrand = async data => {
    try {
        const { name, logo } = data

        const slug = slugify(name, { lower: true, strict: true })

        const brand = new Brand({
            name,
            slug,
            logo,
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
            user: null,
        })

        if (updateOps.$set.name) {
            updateOps.$set.slug = slugify(updateOps.$set.name, { lower: true, strict: true })
        }

        const updatedBrand = await Brand.findByIdAndUpdate(brandId, updateOps, {
            new: true,
            runValidators: true,
            context: 'query',
        })

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
        const hasProducts = await Product.exists({ brand: brandId })
        if (hasProducts) {
            throw new Error('Brand has products, cannot delete')
        }

        const brand = await Brand.findByIdAndUpdate(
            brandId,
            { $set: { isDeleted: true } },
            { new: true, runValidators: true, context: 'query' }
        )

        if (!brand) {
            throw Object.assign(new Error('brand not found'), { statusCode: 404 })
        }

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

        return brand
    } catch (error) {
        throw error
    }
}

// Public: return all non-deleted brands for storefront filters (no pagination).
const getPublicBrands = async () => {
    try {
        const brands = await Brand.find({ isDeleted: false })
            .select('name slug logo')
            .sort({ name: 1 })

        return { brands }
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
    updateBrand,
    getPublicBrands,
}
