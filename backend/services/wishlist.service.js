const Product = require('../models/product.model')

const getWishlist = async ({ user }) => {
    return user.wishlist
}

const addToWishlist = async (data) => {
    const { productId, user } = data

    const product = Product.findById(productId)

    if(!product){
        throw Object.assign(new Error('product not found'), { statusCode: 404 })
    }

    const existing = user.wishlist.find(
        item => String(item.product) === String(productId)
    )

    if(existing){
        throw Object.assign(new Error('product already exist'), { statusCode: 404 })
    }else{
        user.wishlist.push({ product: productId })
    }

    await user.save()

    return user.wishlist

}

const removeFromWishlist = async (data) => {
    const { productId, user } = data

    const beforeCount = user.wishlist.length
    user.wishlist = user.wishlist.filter(
        item => String(item.product) !== String(productId)
    )

    if (user.wishlist.length === beforeCount) {
        throw Object.assign(new Error('product not in wishlist'), { statusCode: 404 })
    }

    await user.save()
    return user.wishlist

}

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
}