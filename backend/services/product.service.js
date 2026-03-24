const Product = require('../models/product.model')
const Category = require('../models/category.model')
const Brand = require('../models/brand.model')
const Review = require('../models/review.model')

const getProducts = async (data) => {
    try {
        const {
            brand,
            category,
            minPrice,
            maxPrice,
            minRating,
            search,
            page = 1,
            limit = 12,
            sort = { createdAt: -1 }
        } = data

        const filter = {}

        filter.isActive = true

        if (brand) {
            const brandDoc = await Brand.findOne({ slug: brand })
            if (!brandDoc) return { products: [], pagination: { totalProducts: 0, totalPages: 0, currentPage: Number(page), limit: Number(limit) } }
            filter.brand = brandDoc.id
        }

        if (category) {
            const categoryDoc = await Category.findOne({ slug: category })
            if (!categoryDoc) return { products: [], pagination: { totalProducts: 0, totalPages: 0, currentPage: Number(page), limit: Number(limit) } }
            filter.category = categoryDoc.id
        }

        if (minPrice || maxPrice) {
            filter.price = {}
            if (minPrice) filter.price.$gte = Number(minPrice)
            if (maxPrice) filter.price.$lte = Number(maxPrice)
        }

        if (minRating){
            filter.rating.score = { $gte: Number(minRating) }
        }

        if (search){
            filter.$text = { $search: search }
        }

        const pageNumber = Math.max(Number(page) || 1, 1)
        const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
        const skip = (pageNumber - 1) * pageSize


        const sortObj = typeof sort === 'string' ? JSON.parse(sort) : sort

        const [products, totalProducts] = await Promise.all([
            Product.find(filter)
            .select('name price photos category rating brand')
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort(sortObj)
            .skip(skip)
            .limit(Number(limit)),

            Product.countDocuments(filter)
        ])

        const totalPages = Math.ceil(totalProducts / limit)

        return {
            products,
            pagination: {
                totalProducts,
                totalPages,
                currentPage: Number(page),
                limit: Number(limit),
                hasMore: skip + products.length < totalProducts
            }
        }
    } catch (error) {
        throw error
    }
}

const getProductById = async (data) => {
    try {
        const { productId } = data

        const product = await Product.findById(productId)
        .populate('category', 'name')
        .populate('brand', 'name')

        
        if (!product) {
            throw Object.assign(new Error('product not found'), { statusCode: 404 })
        }
        
        if (!product.isActive){
            throw Object.assign(new Error('product not available'), { statusCode: 400 })
        }

        const reviewsPreview = await Review.find({ product: productId })
        .sort({ createdAt: -1 })
        .limit(5)

        const totalReviews = await Review.countDocuments({ product: productId })

        return {
            product,
            reviewsPreview,
            hasMoreReviews: totalReviews > 5
        }
    } catch (error) {
        throw error
    }
}

const updateProductRating = async (data) => {
    try {
        const { productId, session } = data
        const stats = await Review.aggregate([
            { $match: { product: productId } },
            {
                $group: {
                    _id: '$product',
                    avgRating: { $avg: '$rating' },
                    voters: { $sum: 1 }
                }
            }
        ]).session(session)

        if (stats.length === 0) {
            await Product.findByIdAndUpdate(
                productId, 
                { rating: { score: 0, voters: 0 } },
                { session }
            )
            return
        }

        await Product.findByIdAndUpdate(
            productId, 
            { 
                rating: {
                    score: stats[0].avgRating,
                    voters: stats[0].voters
                } 
            },
            { session }
        )
    } catch (error) {
        throw error
    }
}

const getProductUserStatus = async ({ productId, user }) => {
    try {
        const cartItem = user.cart.find(
            item => String(item.product) === String(productId)
        )

        const wishlistItem = user.wishlist.find(
            item => String(item) === String(productId)
        )

        return {
            inCart: !!cartItem,
            cartQuantity: cartItem ? cartItem.quantity : 0,
            inWishlist: !!wishlistItem
        }
    } catch (error) {
        throw error
    }
}

// Admin

const createProduct = async (data) => {
    try {
        const {
            name,
            price,
            photos,
            description,
            category,
            stock,
            brand,
            isActive
        } = data

        const DbBrand = await Brand.findById(brand)
        const DbCategory = await Brand.findById(brand)

        if(!DbBrand || DbCategory){
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
            isActive
        })

        const savedProduct = await product.save()
        return savedProduct
    } catch (error) {
        throw error
    }
}


module.exports = {
  getProducts,
  getProductById, 
  updateProductRating,
  getProductUserStatus,
  createProduct
}
