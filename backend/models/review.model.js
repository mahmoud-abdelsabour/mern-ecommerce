const { required } = require('joi')
const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        required: true
    }
}, { timestamps: true })

reviewSchema.index({ user: 1, product: 1 }, { unique: true })
reviewSchema.index({ product: 1 })

reviewSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
