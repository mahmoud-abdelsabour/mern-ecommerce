const Product = require('../models/product.model')
const Category = require('../models/category.model')
const Brand = require('../models/brand.model')
const Review = require('../models/review.model')

const getProducts = async (data) => {
    const {
        brand,
        category,
        minPrice,
        maxPrice,
        minRating,
        page = 1,
        limit = 12,
        sort = 'createdAt'
    } = data

    const filter = {}

    if (brand) {
        const brandDoc = await Brand.findOne({ name: brand });
        if (!brandDoc) return { products: [], pagination: { totalProducts: 0, totalPages: 0, currentPage: Number(page), limit: Number(limit) } };
        filter.brand = brandDoc._id;
    }

    if (category) {
        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) return { products: [], pagination: { totalProducts: 0, totalPages: 0, currentPage: Number(page), limit: Number(limit) } };
        filter.category = categoryDoc._id;
    }

    if (minPrice || maxPrice) {
        filter.price = {}
        if (minPrice) filter.price.$gte = Number(minPrice)
        if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    if(minRating){
        filter.rating = { $gte: Number(minRating) }
    }

    const skip = (page - 1) * limit

    const [products, totalProducts] = await Promise.all([
        Product.find(filter)
        .populate('category')
        .populate('brand')
        .sort(sort)
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
            limit: Number(limit)
        }
    }
}

const getProductById = async (data) => {
  const { productId } = data

  const product = await Product.findById(productId)

  if (!product) {
    throw Object.assign(new Error('product not found'), { statusCode: 404 })
  }

  return product
}

const updateProductRating = async (data) => {
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
}

module.exports = {
  getProducts,
  getProductById, 
  updateProductRating
}