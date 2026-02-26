const mongoose = require('mongoose')

const brandSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: false,
        unique: true
    },
    logo: {
        type: String,
        trim: true,
        validate: {
            validator: (value) => !value || /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(value),
            message: 'Logo must be a valid URL'
        }
    }
})

brandSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Brand = mongoose.model('Brand', brandSchema)

module.exports = Brand
