const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    photos: {
        type: [String],
        required: true,
        validate: [
            {
                validator: (arr) => Array.isArray(arr) && arr.length >= 1,
                message: "At least one URL is required"
            },
            {
                validator: (arr) => arr.every((u) => /^https?:\/\/.+/i.test(u)),
                message: "All items must be valid URLs"
            }
        ]
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    rating: {
        type: {
            score: {
                type: Number,
                default: 0
            },
            voters: {
                type: Number,
                default: 0
            }
        }
    },
    reviews:  [
        new mongoose.Schema(
            {
                rating: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5
                },
                comment: {
                    type: String,
                    required: true
                },
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                username: {
                    type: String,
                    required: true
                }
            },
            { timestamps: true, _id: true }
        )
    ],
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true
    },
    isActive: Boolean
    
},{timestamps: true})

productSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product