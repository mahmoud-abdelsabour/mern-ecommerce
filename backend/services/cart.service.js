const Product = require('../models/product.model')

// `cart.product` is a ref to Product; Product itself refs Brand and Category.
// Nested populate is required so clients receive `brand.name` / `category.name`, not raw ObjectIds.
const populateCartProducts = user =>
    user.populate({
        path: 'cart.product',
        populate: [
            { path: 'brand', select: 'name slug' },
            { path: 'category', select: 'name slug' },
        ],
    })

const getCart = async ({ user }) => {
    try {
        await populateCartProducts(user)
        return user.cart
    } catch (error) {
        throw error
    }
}

const addToCart = async ({ productId, quantity = 1, user }) => {
    try {
        const product = await Product.findById(productId)

        if (!product) {
            throw Object.assign(new Error('product not found'), { statusCode: 404 })
        }

        const existing = user.cart.find(item => String(item.product) === String(productId))

        if (existing) {
            if (product.stock < existing.quantity + quantity) {
                throw Object.assign(new Error('not enough stock'), { statusCode: 409 })
            }
            existing.quantity += quantity
        } else {
            if (product.stock < quantity) {
                throw Object.assign(new Error('not enough stock'), { statusCode: 409 })
            }
            user.cart.push({ product: productId, quantity })
        }

        await user.save()
        await populateCartProducts(user)

        return user.cart
    } catch (error) {
        throw error
    }
}

const removeFromCart = async ({ productId, user }) => {
    try {
        const beforeCount = user.cart.length
        user.cart = user.cart.filter(item => String(item.product) !== String(productId))

        if (user.cart.length === beforeCount) {
            throw Object.assign(new Error('product not in cart'), { statusCode: 404 })
        }

        await user.save()
        await populateCartProducts(user)
        return user.cart
    } catch (error) {
        throw error
    }
}

const decrementCartItem = async ({ productId, user, amount = 1 }) => {
    try {
        const item = user.cart.find(i => String(i.product) === String(productId))

        if (!item) {
            throw Object.assign(new Error('product not in cart'), { statusCode: 404 })
        }

        item.quantity -= amount

        if (item.quantity <= 0) {
            user.cart = user.cart.filter(i => String(i.product) !== String(productId))
        }

        await user.save()
        await populateCartProducts(user)
        return user.cart
    } catch (error) {
        throw error
    }
}

const clearCart = async ({ user }) => {
    try {
        user.cart = []
        await user.save()
        return user.cart
    } catch (error) {
        throw error
    }
}

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    decrementCartItem,
    clearCart,
}
