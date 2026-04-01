const mongoose = require('mongoose')

const brandSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            required: false,
        },
        logo: {
            type: String,
            trim: true,
            validate: {
                validator: value => !value || /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(value),
                message: 'Logo must be a valid URL',
            },
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

brandSchema.index(
    { slug: 1 },
    { unique: true, partialFilterExpression: { slug: { $exists: true, $type: 'string' } } }
)

brandSchema.index({ name: 'text', slug: 'text' })

brandSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    },
})

const Brand = mongoose.model('Brand', brandSchema)

module.exports = Brand
