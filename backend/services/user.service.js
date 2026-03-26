const User = require('../models/user.model')
const {pickAllowedFields} = require('../utils/request/pick-fields.util')

const userProfileAllowedFields = [
    "firstName",
    "lastName",
    "username",
    "email",
    "phone",
    "profilePhoto"
]

const addressAllowedFields = [
    "address_name",
    "country",
    "city",
    "street",
    "building",
    "postalcode",
    "special_mark",
    "floor"
]

const updateProfile = async (data) => {    
    try {
        const { fields, user } = data    
        const updateOps = await pickAllowedFields({userProfileAllowedFields, fields})

        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            updateOps,
            { new: true, runValidators: true, context: "query" }
        ).select("-passwordHash");
        
        if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
        return updatedUser
    } catch (error) {
        throw error
    }
}

const createAddress = async (data) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
          data.user.id,
          { $push: { addresses: data.newAddress } },
          { new: true, runValidators: true, context: "query" }
        ).select("-passwordHash");

        if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
        return updatedUser
    } catch (error) {
        throw error
    }
}

const updateAddress = async (data) => {
    try {
        const {fields} = data
        const updateOps = await pickAllowedFields({addressAllowedFields, fields})

        const updatedUser = await User.findOneAndUpdate(
          {_id: data.user.id, "addresses._id": data.addressId},
          updateOps,
          { new: true, runValidators: true, context: "query" }
        ).select("-passwordHash")

        if (!updatedUser) throw Object.assign(new Error('user not found'), { statusCode: 404 })
        return updatedUser
    } catch (error) {
        throw error
    }
}

const getUser = async (data) => {
    try {
        let { user, userId } = data

        if(userId){
            user = await User.findById(userId).select('firstName lastName username phone email profilePhoto role createdAt')
        }
        else if(!user) throw Object.assign(new Error("user not found"), {statusCode: 404})
        
        return user
    } catch (error) {
        throw error
    }
}

const getAllUsers = async (data) => {
    try {
        const {
            page = 1,
            limit = 10,
            role,
            search,
            startDate,
            endDate,
            hasOrders,          // true / false
            minOrders,          // number
            maxOrders,          // number
            sortOrders          // 'high' | 'low' (optional)
        } = data

        const pageNumber = Math.max(Number(page) || 1, 1)
        const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)
        const skip = (pageNumber - 1) * pageSize

        const match = {}

        if (role) match.role = role

        if (startDate || endDate) {
            match.createdAt = {}
            if (startDate) match.createdAt.$gte = new Date(startDate)
            if (endDate) match.createdAt.$lte = new Date(endDate)
        }

        if (search) {
            match.$text = { $search: search }
        }

        const pipeline = [
            { $match: match },

            {
                $lookup: {
                    from: 'orders',
                    let: { userId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
                        {
                            $group: {
                                _id: '$deliveryStatus',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    as: 'ordersByStatus'
                }
            },

            {
                $addFields: {
                    totalOrders: {
                        $sum: '$ordersByStatus.count'
                    },
                    activeOrders: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$ordersByStatus',
                                        as: 's',
                                        cond: { $in: ['$$s._id', ['pending', 'shipped']] }
                                    }
                                },
                                as: 'x',
                                in: '$$x.count'
                            }
                        }
                    },
                    deliveredOrders: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$ordersByStatus',
                                        as: 's',
                                        cond: { $eq: ['$$s._id', 'delivered'] }
                                    }
                                },
                                as: 'x',
                                in: '$$x.count'
                            }
                        }
                    },
                    cancelledOrders: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$ordersByStatus',
                                        as: 's',
                                        cond: { $eq: ['$$s._id', 'cancelled'] }
                                    }
                                },
                                as: 'x',
                                in: '$$x.count'
                            }
                        }
                    },
                    activeReturnRequests: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$ordersByStatus',
                                        as: 's',
                                        cond: { $eq: ['$$s._id', 'return requested'] }
                                    }
                                },
                                as: 'x',
                                in: '$$x.count'
                            }
                        }
                    },
                    returnedOrders: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$ordersByStatus',
                                        as: 's',
                                        cond: { $eq: ['$$s._id', 'returned'] }
                                    }
                                },
                                as: 'x',
                                in: '$$x.count'
                            }
                        }
                    },
                    refundedOrders: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$ordersByStatus',
                                        as: 's',
                                        cond: { $eq: ['$$s._id', 'refunded'] }
                                    }
                                },
                                as: 'x',
                                in: '$$x.count'
                            }
                        }
                    }
                }
            },

            { $project: { passwordHash: 0, ordersByStatus: 0, email: 0, phone: 0, addresses: 0, cart: 0, wishlist: 0, tokenVersion: 0 } }
        ]

        if (hasOrders === 'true' || hasOrders === true) {
            pipeline.push({ $match: { totalOrders: { $gt: 0 } } })
        } else if (hasOrders === 'false' || hasOrders === false) {
            pipeline.push({ $match: { totalOrders: 0 } })
        }

        if (hasOrders !== false && hasOrders !== 'false') {
            if (minOrders !== undefined || maxOrders !== undefined) {
                const countFilter = {}
                if (minOrders !== undefined) countFilter.$gte = Number(minOrders)
                if (maxOrders !== undefined) countFilter.$lte = Number(maxOrders)
                pipeline.push({ $match: { totalOrders: countFilter } })
            }
        }

        if (sortOrders === 'high') {
            pipeline.push({ $sort: { totalOrders: -1 } })
        } else if (sortOrders === 'low') {
            pipeline.push({ $sort: { totalOrders: 1 } })
        } else {
            pipeline.push({ $sort: { createdAt: -1 } })
        }

        pipeline.push({
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: pageSize }
                ],
                total: [{ $count: 'totalUsers' }]
            }
        })

        const result = await User.aggregate(pipeline)
        const users = result[0]?.data || []
        const totalUsers = result[0]?.total[0]?.totalUsers || 0

        return {
            users,
            pagination: {
                totalUsers,
                totalPages: Math.ceil(totalUsers / pageSize),
                currentPage: pageNumber,
                limit: pageSize,
                hasMore: skip + users.length < totalUsers
            }
        }
    } catch (error) {
        throw error
    }
}

const makeAdmin = async ({ userId }) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { role: 'admin' } },
            { new: true, runValidators: true, context: 'query' }
        ).select('-passwordHash')

        if (!user) {
            throw Object.assign(new Error('user not found'), { statusCode: 404 })
        }

        return user
    } catch (error) {
        throw error
    }
}


module.exports = {
    getAllUsers,
    updateProfile,
    createAddress,
    updateAddress,
    getUser,
    makeAdmin
}
