// category.service.js
const slugify = require('slugify')
const Category = require('../models/category.model')
const Product = require('../models/product.model')

const createCategory = async data => {
    try {
        const { name } = data
        const slug = slugify(name, { lower: true, strict: true })

        const category = new Category({ name, slug })
        const savedCategory = await category.save()
        return savedCategory
    } catch (error) {
        throw error
    }
}

const updateCategory = async ({ categoryId, updateData }) => {
    try {
        const updates = {}
        if (updateData.name !== undefined) {
            updates.name = updateData.name
            updates.slug = slugify(updateData.name, { lower: true, strict: true })
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { $set: updates },
            { new: true, runValidators: true, context: 'query' }
        )

        if (!updatedCategory) {
            throw Object.assign(new Error('category not found'), { statusCode: 404 })
        }

        return updatedCategory
    } catch (error) {
        throw error
    }
}

const deleteCategory = async ({ categoryId }) => {
    try {
        const hasProducts = await Product.exists({ category: categoryId })
        if (hasProducts) {
            throw new Error('Category has products, cannot delete')
        }

        const deletedCategory = await Category.findByIdAndDelete(categoryId)

        if (!deletedCategory) {
            throw Object.assign(new Error('category not found'), { statusCode: 404 })
        }

        return deletedCategory
    } catch (error) {
        throw error
    }
}

const getAllCategories = async data => {
    try {
        const { page = 1, limit = 10, search, hasProducts } = data

        const pageNumber = Math.max(Number(page) || 1, 1)
        const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
        const skip = (pageNumber - 1) * pageSize

        const match = {}

        if (search) {
            match.$text = { $search: search }
        }

        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: 'products',
                    let: { categoryId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$category', '$$categoryId'] } } },
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

        pipeline.push({
            $facet: {
                data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: pageSize }],
                total: [{ $count: 'totalCategories' }],
            },
        })

        const result = await Category.aggregate(pipeline)
        const categories = result[0]?.data || []
        const totalCategories = result[0]?.total[0]?.totalCategories || 0

        return {
            categories,
            pagination: {
                totalCategories,
                totalPages: Math.ceil(totalCategories / pageSize),
                currentPage: pageNumber,
                limit: pageSize,
                hasMore: skip + categories.length < totalCategories,
            },
        }
    } catch (error) {
        throw error
    }
}

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
}
