const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: false
    }
})

categorySchema.index(
    { slug: 1 },
    { unique: true, partialFilterExpression: { slug: { $exists: true, $type: 'string' } } }
)

categorySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category
