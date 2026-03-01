const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "first name is required"],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, "last name is required"],
        trim: true
    },
    username: {
        type:String,
        required: [true, "username is required"],
        unique: true,
        minlength: 3
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address"
        ]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            "Password must include uppercase, lowercase, number and special character"
        ]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        minlength: [11, "valid phone number must be at least 11 characters"],
        match: [
            /^01[0125][0-9]{8}$/,
            "Please enter a valid Egyptian phone number"
        ]
    },
    address: {
        country: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        postalcode: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        building: {
            type: String,
            required: true
        },
        floor: {
            type: Number,
            required: true
        },
        special_mark: {
            type: String,
            required: false
        }
    },
    cart: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                }
            }
        ],
        default: []
    },
    wishlist: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        ],
        default: []
    },
    profilePhoto: {
        type: String,
        trim: true,
        default: null
    },
    tokenVersion: {
        type: Number,
        default: 0
    }

})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the password should not be revealed
    delete returnedObject.password
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
