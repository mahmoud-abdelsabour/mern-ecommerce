const mongoose = require('mongoose')

const productsType = [
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        priceAtPurchase: {
            type: Number,
            required: true,
            min: 0,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        photos: {
            type: [String],
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
    },
]

const orderSchema = mongoose.Schema(
    {
        products: {
            type: productsType,
            required: true,
            validate: {
                validator: arr => Array.isArray(arr) && arr.length > 0,
                message: 'Order must include at least one product',
            },
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        shippingInfo: {
            firstName: {
                type: String,
                required: true,
            },
            lastName: {
                type: String,
                required: true,
            },
            username: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            address: {
                country: {
                    type: String,
                    required: true,
                },
                city: {
                    type: String,
                    required: true,
                },
                postalcode: {
                    type: String,
                    required: true,
                },
                street: {
                    type: String,
                    required: true,
                },
                building: {
                    type: String,
                    required: true,
                },
                floor: {
                    type: Number,
                    required: true,
                },
                special_mark: {
                    type: String,
                    required: false,
                },
            },
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        codFees: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentMethod: {
            type: String,
            enum: ['COD', 'Credit'],
            required: true,
            default: 'COD',
        },
        returnInfo: {
            returnedItems: [
                {
                    product: mongoose.Schema.Types.ObjectId,
                    quantity: Number,
                    reason: String,
                },
            ],
            returnDate: Date,
        },
        deliveryStatus: {
            type: String,
            enum: [
                'pending',
                'shipped',
                'delivered',
                'cancelled',
                'return requested',
                'returned',
                'refunded',
            ],
            default: 'pending',
        },
        deliveredAt: Date,
        shippedAt: Date,
    },
    { timestamps: true }
)

orderSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    },
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
