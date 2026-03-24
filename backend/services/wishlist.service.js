const Product = require('../models/product.model')

const getWishlist = async ({ user }) => {
    try {
        return user.wishlist
    } catch (error) {
        throw error
    }
}

const addToWishlist = async (data) => {
    try {
        const { productId, user } = data

        const product = await Product.findById(productId)

        if(!product){
            throw Object.assign(new Error('product not found'), { statusCode: 404 })
        }

        const existing = user.wishlist.some(item => String(item) === String(productId))

        if(existing){
            throw Object.assign(new Error('product already exists'), { statusCode: 409 })
        }else{
            user.wishlist.push(productId)
        }

        await user.save()

        return user.wishlist
    } catch (error) {
        throw error
    }

}

const removeFromWishlist = async (data) => {
    try {
        const { productId, user } = data

        const beforeCount = user.wishlist.length
        user.wishlist = user.wishlist.filter(
            item => String(item) !== String(productId)
        )

        if (user.wishlist.length === beforeCount) {
            throw Object.assign(new Error('product not in wishlist'), { statusCode: 404 })
        }

        await user.save()
        return user.wishlist
    } catch (error) {
        throw error
    }

}

const clearWishlist = async ({ user }) => {
    user.wishlist = []
    await user.save()
    return user.wishlist
}


module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
}
