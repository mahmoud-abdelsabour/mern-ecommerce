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
        score: {
            type: Number,
            default: 0
        },
        voters: {
            type: Number,
            default: 0
        }
    },
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
    isDeleted: {
        type: Boolean,
        default: false
    }
    
},{timestamps: true})

productSchema.index({ category: 1 })
productSchema.index({ brand: 1 })
productSchema.index({ price: 1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ 'rating.score': -1 })

productSchema.index({ name: 'text', description: 'text' })

productSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

productSchema.pre(/^find|countDocuments/, function(next) {
  if (!this.getOptions().skipDeletedFilter) {
    this.where({ isDeleted: false })
  }
  next()
})


const Product = mongoose.model('Product', productSchema)

module.exports = Product
