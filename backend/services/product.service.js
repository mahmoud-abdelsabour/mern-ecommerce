const Product = require('../models/product.model')


const getProducts = async (data) => {
    const {
        brand,
        category,
        minPrice,
        maxPrice,
        page = 1,
        limit = 12,
        sort = 'createdAt'
    } = data

    const filter = {}

    if (brand) filter.brand = brand
    if (category) filter.category = category

    if (minPrice || maxPrice) {
        filter.price = {}
        if (minPrice) filter.price.$gte = Number(minPrice)
        if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    const skip = (page - 1) * limit

    const [products, totalProducts] = await Promise.all([
        Product.find(filter)
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

module.exports = {
  getProducts,
  getProductById
}