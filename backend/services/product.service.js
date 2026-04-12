const Product = require('../models/product.model')
const Category = require('../models/category.model')
const Brand = require('../models/brand.model')
const Review = require('../models/review.model')
const Order = require('../models/order.model')
const { pickAllowedFields } = require('../utils/request/pick-fields.util')

// Parse list-like query params into an array of slugs.
// Supports:
// - "apple,samsung"
// - ["apple", "samsung"]
// - ["apple,samsung"] (repeated query params)
const parseSlugList = value => {
    if (value === null || value === undefined) return []
    const parts = Array.isArray(value) ? value : [value]
    return parts
        .flatMap(v => String(v).split(','))
        .map(v => v.trim())
        .filter(Boolean)
}

const getProducts = async data => {
    try {
        const {
            user,
            brand,
            category,
            minPrice,
            maxPrice,
            minRating,
            includeDeleted,
            onlyDeleted,
            search,
            page = 1,
            limit = 12,
            sort = { createdAt: -1 },
        } = data

        const filter = {}

        if (brand) {
            const brandSlugs = parseSlugList(brand)
            const brandDocs = await Brand.find({ slug: { $in: brandSlugs } }).select('_id')

            // Keep existing behavior: if nothing matches, return an empty list rather than "ignore filter".
            if (!brandDocs || brandDocs.length === 0)
                return {
                    products: [],
                    pagination: {
                        totalProducts: 0,
                        totalPages: 0,
                        currentPage: Number(page),
                        limit: Number(limit),
                    },
                }

            filter.brand = { $in: brandDocs.map(b => b._id) }
        }

        if (category) {
            const categorySlugs = parseSlugList(category)
            const categoryDocs = await Category.find({ slug: { $in: categorySlugs } }).select(
                '_id'
            )

            if (!categoryDocs || categoryDocs.length === 0)
                return {
                    products: [],
                    pagination: {
                        totalProducts: 0,
                        totalPages: 0,
                        currentPage: Number(page),
                        limit: Number(limit),
                    },
                }

            filter.category = { $in: categoryDocs.map(c => c._id) }
        }

        if (minPrice || maxPrice) {
            filter.price = {}
            if (minPrice) filter.price.$gte = Number(minPrice)
            if (maxPrice) filter.price.$lte = Number(maxPrice)
        }

        if (minRating) {
            filter['rating.score'] = { $gte: Number(minRating) }
        }

        let skipDeletedFilter = false

        if (user && user.role === 'admin') {
            skipDeletedFilter = true
            if (onlyDeleted === 'true' || onlyDeleted === true) {
                filter.isDeleted = true
            } else if (includeDeleted === 'true' || includeDeleted === true) {
                // no filter => include all
            } else {
                filter.isDeleted = false
            }
        }

        if (search) {
            filter.$text = { $search: search }
        }

        const pageNumber = Math.max(Number(page) || 1, 1)
        const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
        const skip = (pageNumber - 1) * pageSize

        const sortObj = typeof sort === 'string' ? JSON.parse(sort) : sort

        const [products, totalProducts] = await Promise.all([
            Product.find(filter)
                .setOptions({ skipDeletedFilter })
                .select('name price photos category rating brand')
                .populate('category', 'name')
                .populate('brand', 'name')
                .sort(sortObj)
                .skip(skip)
                .limit(Number(limit)),

            Product.countDocuments(filter).setOptions({ skipDeletedFilter }),
        ])

        const totalPages = Math.ceil(totalProducts / limit)

        return {
            products,
            pagination: {
                totalProducts,
                totalPages,
                currentPage: Number(page),
                limit: Number(limit),
                hasMore: skip + products.length < totalProducts,
            },
        }
    } catch (error) {
        throw error
    }
}

const getProductById = async data => {
    try {
        const { productId, user } = data

        let skipDeletedFilter = false

        if (user && user.role === 'admin') {
            skipDeletedFilter = true
        }
        const product = await Product.findById(productId)
            .setOptions({ skipDeletedFilter })
            .populate('category', 'name')
            .populate('brand', 'name')

        if (!product) {
            throw Object.assign(new Error('product not found'), { statusCode: 404 })
        }

        const reviewsPreview = await Review.find({ product: productId })
            .sort({ createdAt: -1 })
            .limit(5)

        const totalReviews = await Review.countDocuments({ product: productId })

        return {
            product,
            reviewsPreview,
            hasMoreReviews: totalReviews > 5,
        }
    } catch (error) {
        throw error
    }
}

const updateProductRating = async data => {
    try {
        const { productId, session } = data
        const aggregate = Review.aggregate([
            { $match: { product: productId } },
            {
                $group: {
                    _id: '$product',
                    avgRating: { $avg: '$rating' },
                    voters: { $sum: 1 },
                },
            },
        ])
        const stats = session ? await aggregate.session(session) : await aggregate
        const updateOpts = session ? { session } : {}

        if (stats.length === 0) {
            await Product.findByIdAndUpdate(
                productId,
                { rating: { score: 0, voters: 0 } },
                updateOpts
            )
            return
        }

        await Product.findByIdAndUpdate(
            productId,
            {
                rating: {
                    score: stats[0].avgRating,
                    voters: stats[0].voters,
                },
            },
            updateOpts
        )
    } catch (error) {
        throw error
    }
}

const getProductUserStatus = async ({ productId, user }) => {
    try {
        const userId = user.id
        const cartItem = user.cart.find(item => String(item.product) === String(productId))

        const wishlistItem = user.wishlist.find(item => String(item) === String(productId))

        const [hasEligibleOrder, hasReviewed] = await Promise.all([
            Order.exists({
                userId,
                'products.product': productId,
                deliveryStatus: { $in: ['delivered', 'return requested', 'returned', 'refunded'] },
            }),
            Review.exists({ user: userId, product: productId }),
        ])

        return {
            inCart: !!cartItem,
            cartQuantity: cartItem ? cartItem.quantity : 0,
            inWishlist: !!wishlistItem,
            hasReviewed: Boolean(hasReviewed),
            canReview: Boolean(hasEligibleOrder && !hasReviewed),
        }
    } catch (error) {
        throw error
    }
}

// Admin

const createProduct = async data => {
    try {
        const { name, price, photos, description, category, stock, brand } = data

        const DbBrand = await Brand.findById(brand)
        const DbCategory = await Category.findById(category)

        if (!DbBrand || !DbCategory) {
            throw Object.assign(new Error('Bad Request'), { statusCode: 400 })
        }

        const product = new Product({
            name,
            price,
            photos,
            description,
            category,
            stock,
            brand,
        })

        const savedProduct = await product.save()
        return savedProduct
    } catch (error) {
        throw error
    }
}

const updateProduct = async data => {
    try {
        const { productId, updateData } = data

        const allowedFields = [
            'name',
            'price',
            'photos',
            'description',
            'category',
            'brand',
            'stock',
        ]

        const updateOps = await pickAllowedFields({
            allowedFields,
            requestFields: updateData,
            user: null,
        })

        if (!updateOps.$set || Object.keys(updateOps.$set).length === 0) {
            throw Object.assign(new Error('no valid fields to update'), { statusCode: 400 })
        }

        if (updateOps.$set.brand) {
            const brandExists = await Brand.exists({ _id: updateOps.$set.brand })
            if (!brandExists) {
                throw Object.assign(new Error('brand not found'), { statusCode: 404 })
            }
        }

        if (updateOps.$set.category) {
            const categoryExists = await Category.exists({ _id: updateOps.$set.category })
            if (!categoryExists) {
                throw Object.assign(new Error('category not found'), { statusCode: 404 })
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, updateOps, {
            new: true,
            runValidators: true,
            context: 'query',
        })

        if (!updatedProduct) {
            throw Object.assign(new Error('product not found'), { statusCode: 404 })
        }

        return updatedProduct
    } catch (error) {
        throw error
    }
}

const deleteProduct = async ({ productId }) => {
    try {
        const product = await Product.findByIdAndUpdate(
            productId,
            { $set: { isDeleted: true } },
            { new: true, runValidators: true, context: 'query' }
        )

        if (!product) {
            throw Object.assign(new Error('product not found'), { statusCode: 404 })
        }

        return product
    } catch (error) {
        throw error
    }
}

const restoreProduct = async ({ productId }) => {
    try {
        const product = await Product.findById(productId).setOptions({ skipDeletedFilter: true })
        if (!product) {
            throw Object.assign(new Error('product not found'), { statusCode: 404 })
        }

        const brand = await Brand.findById(product.brand)
        if (brand && brand.isDeleted) {
            throw Object.assign(new Error('brand is deleted; restore brand first'), {
                statusCode: 409,
            })
        }

        product.isDeleted = false
        await product.save()

        return product
    } catch (error) {
        throw error
    }
}

module.exports = {
    getProducts,
    getProductById,
    updateProductRating,
    getProductUserStatus,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
}
