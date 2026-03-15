const Product = require('../models/product.model')

const getCart = async ({ user }) => {
    return user.cart
}

const addToCart = async ({ productId, quantity, user }) => {
    const product = Product.findById(productId)

    if(!product){
        throw Object.assign(new Error('product not found'), { statusCode: 404 })
    }

    if(product.stock < quantity){
        throw Object.assign(new Error('not enough stock'), { statusCode: 409 })
    }

    const existing = user.cart.find(
        item => String(item.product) === String(productId)
    )

    if (existing) {
        existing.quantity += quantity
    } else {
        user.cart.push({ product: productId, quantity })
    }

    await user.save()

    return user.cart

}

const removeFromCart = async ({ productId, user }) => {
 
    const beforeCount = user.cart.length
    user.cart = user.cart.filter(
        item => String(item.product) !== String(productId)
    )

    if (user.cart.length === beforeCount) {
        throw Object.assign(new Error('product not in cart'), { statusCode: 404 })
    }

    await user.save()
    return user.cart
}

const decrementCartItem = async ({ productId, user, amount = 1 }) => {

    const item = user.cart.find(
        i => String(i.product) === String(productId)
    )

    if (!item) {
        throw Object.assign(new Error('product not in cart'), { statusCode: 404 })
    }

    item.quantity -= amount

    if (item.quantity <= 0) {
        user.cart = user.cart.filter(
            i => String(i.product) !== String(productId)
        )
    }

    await user.save()
    return user.cart
}



module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    decrementCartItem
}