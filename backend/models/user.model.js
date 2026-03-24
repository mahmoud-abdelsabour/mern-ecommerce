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
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        unique: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address"
        ]
    },
    passwordHash: {
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
        unique: true,
        minlength: [11, "valid phone number must be at least 11 characters"],
        match: [
            /^01[0125][0-9]{8}$/,
            "Please enter a valid Egyptian phone number"
        ]
    },
    addresses: {
        type: [
            {
                address_name: {
                    type: String,
                    trim: true,
                    required: true
                },
                country: {
                    type: String,
                    trim: true,
                    required: true
                },
                city: {
                    type: String,
                    trim: true,
                    required: true
                },
                postalcode: {
                    type: String,
                    trim: true,
                    required: true
                },
                street: {
                    type: String,
                    trim: true,
                    required: true
                },
                building: {
                    type: String,
                    trim: true,
                    required: true
                },
                floor: {
                    type: Number,
                    required: true
                },
                special_mark: {
                    type: String,
                    trim: true,
                    required: false
                }
            }
        ],
        default: []
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
                ref: "Product",
                required: true
                
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
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }

})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the password should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
