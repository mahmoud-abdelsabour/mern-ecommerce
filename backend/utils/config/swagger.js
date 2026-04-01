const swaggerJsdoc = require('swagger-jsdoc')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MERN E-commerce API',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                    },
                    example: { error: 'forbidden', message: 'access denied' },
                },
                ValidationErrorResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        errors: {
                            type: 'array',
                            items: { type: 'object' },
                        },
                    },
                    example: {
                        message: 'Validation error',
                        errors: [{ field: 'email', message: 'email is required' }],
                    },
                },
                Address: {
                    type: 'object',
                    properties: {
                        address_name: { type: 'string' },
                        country: { type: 'string' },
                        city: { type: 'string' },
                        postalcode: { type: 'string' },
                        street: { type: 'string' },
                        building: { type: 'string' },
                        floor: { type: 'number' },
                        special_mark: { type: 'string', nullable: true },
                    },
                    example: {
                        address_name: 'Home',
                        country: 'Egypt',
                        city: 'Cairo',
                        postalcode: '12345',
                        street: 'Street 1',
                        building: '1',
                        floor: 2,
                        special_mark: 'nearby',
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        addresses: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Address' },
                        },
                        profilePhoto: { type: 'string', nullable: true },
                        role: { type: 'string', enum: ['user', 'admin'] },
                        isDeleted: { type: 'boolean' },
                        deletedAt: { type: 'string', format: 'date-time', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                    example: {
                        id: '64f0c2a1d9f3a2a1b0c12345',
                        firstName: 'Test',
                        lastName: 'User',
                        username: 'testuser',
                        email: 'user@example.com',
                        phone: '01012345678',
                        addresses: [],
                        profilePhoto: null,
                        role: 'user',
                        isDeleted: false,
                        deletedAt: null,
                        createdAt: '2024-01-01T00:00:00.000Z',
                        updatedAt: '2024-01-01T00:00:00.000Z',
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                        username: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                    },
                    example: {
                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        username: 'testuser',
                        firstName: 'Test',
                        lastName: 'User',
                    },
                },
                ProductRating: {
                    type: 'object',
                    properties: {
                        score: { type: 'number' },
                        voters: { type: 'number' },
                    },
                    example: { score: 4.5, voters: 10 },
                },
                Brand: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        logo: { type: 'string', nullable: true },
                        isDeleted: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                    example: {
                        id: '64f0c2a1d9f3a2a1b0c67890',
                        name: 'Apple',
                        slug: 'apple',
                        logo: 'https://example.com/logo.png',
                        isDeleted: false,
                        createdAt: '2024-01-01T00:00:00.000Z',
                        updatedAt: '2024-01-01T00:00:00.000Z',
                    },
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                    example: {
                        id: '64f0c2a1d9f3a2a1b0c99999',
                        name: 'Phones',
                        slug: 'phones',
                        createdAt: '2024-01-01T00:00:00.000Z',
                        updatedAt: '2024-01-01T00:00:00.000Z',
                    },
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        photos: { type: 'array', items: { type: 'string' } },
                        description: { type: 'string' },
                        category: {
                            oneOf: [
                                { type: 'string' },
                                {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        name: { type: 'string' },
                                    },
                                },
                            ],
                        },
                        brand: {
                            oneOf: [
                                { type: 'string' },
                                {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        name: { type: 'string' },
                                    },
                                },
                            ],
                        },
                        rating: { $ref: '#/components/schemas/ProductRating' },
                        stock: { type: 'number' },
                        isDeleted: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                    example: {
                        id: '64f0c2a1d9f3a2a1b0c55555',
                        name: 'iPhone 14',
                        price: 999,
                        photos: ['https://example.com/p1.jpg'],
                        description: 'High-end smartphone',
                        category: '64f0c2a1d9f3a2a1b0c99999',
                        brand: '64f0c2a1d9f3a2a1b0c67890',
                        rating: { score: 4.7, voters: 120 },
                        stock: 10,
                        isDeleted: false,
                        createdAt: '2024-01-01T00:00:00.000Z',
                        updatedAt: '2024-01-01T00:00:00.000Z',
                    },
                },
                Review: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        user: { type: 'string' },
                        product: { type: 'string' },
                        rating: { type: 'number' },
                        comment: { type: 'string' },
                        name: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                    example: {
                        id: '64f0c2a1d9f3a2a1b0c77777',
                        user: '64f0c2a1d9f3a2a1b0c12345',
                        product: '64f0c2a1d9f3a2a1b0c55555',
                        rating: 5,
                        comment: 'Great product',
                        name: 'Test',
                        createdAt: '2024-01-01T00:00:00.000Z',
                        updatedAt: '2024-01-01T00:00:00.000Z',
                    },
                },
                CartItem: {
                    type: 'object',
                    properties: {
                        product: {
                            oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/Product' }],
                        },
                        quantity: { type: 'number' },
                    },
                    example: {
                        product: '64f0c2a1d9f3a2a1b0c55555',
                        quantity: 2,
                    },
                },
                ShippingAddress: {
                    type: 'object',
                    properties: {
                        country: { type: 'string' },
                        city: { type: 'string' },
                        postalcode: { type: 'string' },
                        street: { type: 'string' },
                        building: { type: 'string' },
                        floor: { type: 'number' },
                        special_mark: { type: 'string', nullable: true },
                    },
                    example: {
                        country: 'Egypt',
                        city: 'Cairo',
                        postalcode: '12345',
                        street: 'Street 1',
                        building: '1',
                        floor: 2,
                        special_mark: 'nearby',
                    },
                },
                ShippingInfo: {
                    type: 'object',
                    properties: {
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        address: { $ref: '#/components/schemas/ShippingAddress' },
                    },
                    example: {
                        firstName: 'Test',
                        lastName: 'User',
                        username: 'testuser',
                        email: 'user@example.com',
                        phone: '01012345678',
                        address: {
                            country: 'Egypt',
                            city: 'Cairo',
                            postalcode: '12345',
                            street: 'Street 1',
                            building: '1',
                            floor: 2,
                            special_mark: 'nearby',
                        },
                    },
                },
                OrderProduct: {
                    type: 'object',
                    properties: {
                        product: { type: 'string' },
                        quantity: { type: 'number' },
                        priceAtPurchase: { type: 'number' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        photos: { type: 'array', items: { type: 'string' } },
                        brand: { type: 'string' },
                        category: { type: 'string' },
                    },
                    example: {
                        product: '64f0c2a1d9f3a2a1b0c55555',
                        quantity: 2,
                        priceAtPurchase: 999,
                        name: 'iPhone 14',
                        description: 'High-end smartphone',
                        photos: ['https://example.com/p1.jpg'],
                        brand: 'Apple',
                        category: 'Phones',
                    },
                },
                ReturnItem: {
                    type: 'object',
                    properties: {
                        product: { type: 'string' },
                        quantity: { type: 'number' },
                        reason: { type: 'string' },
                    },
                    example: {
                        product: '64f0c2a1d9f3a2a1b0c55555',
                        quantity: 1,
                        reason: 'Damaged',
                    },
                },
                ReturnInfo: {
                    type: 'object',
                    properties: {
                        returnedItems: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/ReturnItem' },
                        },
                        returnDate: { type: 'string', format: 'date-time', nullable: true },
                    },
                    example: {
                        returnedItems: [
                            { product: '64f0c2a1d9f3a2a1b0c55555', quantity: 1, reason: 'Damaged' },
                        ],
                        returnDate: null,
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        products: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/OrderProduct' },
                        },
                        userId: { type: 'string' },
                        shippingInfo: { $ref: '#/components/schemas/ShippingInfo' },
                        totalPrice: { type: 'number' },
                        returnInfo: { $ref: '#/components/schemas/ReturnInfo' },
                        deliveryStatus: { type: 'string' },
                        deliveredAt: { type: 'string', format: 'date-time', nullable: true },
                        shippedAt: { type: 'string', format: 'date-time', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                    example: {
                        id: '64f0c2a1d9f3a2a1b0c88888',
                        products: [
                            {
                                product: '64f0c2a1d9f3a2a1b0c55555',
                                quantity: 2,
                                priceAtPurchase: 999,
                                name: 'iPhone 14',
                                description: 'High-end smartphone',
                                photos: ['https://example.com/p1.jpg'],
                                brand: 'Apple',
                                category: 'Phones',
                            },
                        ],
                        userId: '64f0c2a1d9f3a2a1b0c12345',
                        shippingInfo: {
                            firstName: 'Test',
                            lastName: 'User',
                            username: 'testuser',
                            email: 'user@example.com',
                            phone: '01012345678',
                            address: {
                                country: 'Egypt',
                                city: 'Cairo',
                                postalcode: '12345',
                                street: 'Street 1',
                                building: '1',
                                floor: 2,
                                special_mark: 'nearby',
                            },
                        },
                        totalPrice: 1998,
                        returnInfo: { returnedItems: [], returnDate: null },
                        deliveryStatus: 'pending',
                        deliveredAt: null,
                        shippedAt: null,
                        createdAt: '2024-01-01T00:00:00.000Z',
                        updatedAt: '2024-01-01T00:00:00.000Z',
                    },
                },
                OrderCard: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        deliveryStatus: { type: 'string' },
                        totalPrice: { type: 'number' },
                        firstPhoto: { type: 'array', items: { type: 'string' } },
                    },
                    example: {
                        _id: '64f0c2a1d9f3a2a1b0c88888',
                        createdAt: '2024-01-01T00:00:00.000Z',
                        deliveryStatus: 'pending',
                        totalPrice: 999,
                        firstPhoto: ['https://example.com/p1.jpg'],
                    },
                },
                ProductUserStatus: {
                    type: 'object',
                    properties: {
                        inCart: { type: 'boolean' },
                        cartQuantity: { type: 'number' },
                        inWishlist: { type: 'boolean' },
                    },
                    example: { inCart: true, cartQuantity: 2, inWishlist: false },
                },
                PaginationProducts: {
                    type: 'object',
                    properties: {
                        totalProducts: { type: 'number' },
                        totalPages: { type: 'number' },
                        currentPage: { type: 'number' },
                        limit: { type: 'number' },
                        hasMore: { type: 'boolean' },
                    },
                    example: {
                        totalProducts: 100,
                        totalPages: 10,
                        currentPage: 1,
                        limit: 10,
                        hasMore: true,
                    },
                },
                PaginationOrders: {
                    type: 'object',
                    properties: {
                        totalOrders: { type: 'number' },
                        totalPages: { type: 'number' },
                        currentPage: { type: 'number' },
                        limit: { type: 'number' },
                        hasMore: { type: 'boolean' },
                    },
                    example: {
                        totalOrders: 20,
                        totalPages: 2,
                        currentPage: 1,
                        limit: 10,
                        hasMore: true,
                    },
                },
                PaginationBrands: {
                    type: 'object',
                    properties: {
                        totalBrands: { type: 'number' },
                        totalPages: { type: 'number' },
                        currentPage: { type: 'number' },
                        limit: { type: 'number' },
                        hasMore: { type: 'boolean' },
                    },
                    example: {
                        totalBrands: 5,
                        totalPages: 1,
                        currentPage: 1,
                        limit: 10,
                        hasMore: false,
                    },
                },
                PaginationCategories: {
                    type: 'object',
                    properties: {
                        totalCategories: { type: 'number' },
                        totalPages: { type: 'number' },
                        currentPage: { type: 'number' },
                        limit: { type: 'number' },
                        hasMore: { type: 'boolean' },
                    },
                    example: {
                        totalCategories: 8,
                        totalPages: 1,
                        currentPage: 1,
                        limit: 10,
                        hasMore: false,
                    },
                },
                PaginationUsers: {
                    type: 'object',
                    properties: {
                        totalUsers: { type: 'number' },
                        totalPages: { type: 'number' },
                        currentPage: { type: 'number' },
                        limit: { type: 'number' },
                        hasMore: { type: 'boolean' },
                    },
                    example: {
                        totalUsers: 50,
                        totalPages: 5,
                        currentPage: 1,
                        limit: 10,
                        hasMore: true,
                    },
                },
                PaginationReviews: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        total: { type: 'number' },
                        totalPages: { type: 'number' },
                        hasMore: { type: 'boolean' },
                    },
                    example: { page: 1, limit: 10, total: 23, totalPages: 3, hasMore: true },
                },
                ProductsListResponse: {
                    type: 'object',
                    properties: {
                        products: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Product' },
                        },
                        pagination: { $ref: '#/components/schemas/PaginationProducts' },
                    },
                    example: {
                        products: [
                            {
                                id: '64f0c2a1d9f3a2a1b0c55555',
                                name: 'iPhone 14',
                                price: 999,
                                photos: ['https://example.com/p1.jpg'],
                                description: 'High-end smartphone',
                                category: '64f0c2a1d9f3a2a1b0c99999',
                                brand: '64f0c2a1d9f3a2a1b0c67890',
                                rating: { score: 4.7, voters: 120 },
                                stock: 10,
                                isDeleted: false,
                            },
                        ],
                        pagination: {
                            totalProducts: 1,
                            totalPages: 1,
                            currentPage: 1,
                            limit: 10,
                            hasMore: false,
                        },
                    },
                },
                OrdersListResponse: {
                    type: 'object',
                    properties: {
                        orders: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
                        pagination: { $ref: '#/components/schemas/PaginationOrders' },
                    },
                    example: {
                        orders: [
                            {
                                id: '64f0c2a1d9f3a2a1b0c88888',
                                products: [
                                    {
                                        product: '64f0c2a1d9f3a2a1b0c55555',
                                        quantity: 1,
                                        priceAtPurchase: 999,
                                        name: 'iPhone 14',
                                        description: 'High-end smartphone',
                                        photos: ['https://example.com/p1.jpg'],
                                        brand: 'Apple',
                                        category: 'Phones',
                                    },
                                ],
                                userId: '64f0c2a1d9f3a2a1b0c12345',
                                shippingInfo: {
                                    firstName: 'Test',
                                    lastName: 'User',
                                    username: 'testuser',
                                    email: 'user@example.com',
                                    phone: '01012345678',
                                    address: {
                                        country: 'Egypt',
                                        city: 'Cairo',
                                        postalcode: '12345',
                                        street: 'Street 1',
                                        building: '1',
                                        floor: 2,
                                        special_mark: 'nearby',
                                    },
                                },
                                totalPrice: 999,
                                returnInfo: { returnedItems: [], returnDate: null },
                                deliveryStatus: 'pending',
                                deliveredAt: null,
                                shippedAt: null,
                                createdAt: '2024-01-01T00:00:00.000Z',
                                updatedAt: '2024-01-01T00:00:00.000Z',
                            },
                        ],
                        pagination: {
                            totalOrders: 1,
                            totalPages: 1,
                            currentPage: 1,
                            limit: 10,
                            hasMore: false,
                        },
                    },
                },
                AdminOrdersListResponse: {
                    type: 'object',
                    properties: {
                        orders: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/OrderCard' },
                        },
                        pagination: { $ref: '#/components/schemas/PaginationOrders' },
                    },
                    example: {
                        orders: [
                            {
                                _id: '64f0c2a1d9f3a2a1b0c88888',
                                createdAt: '2024-01-01T00:00:00.000Z',
                                deliveryStatus: 'pending',
                                totalPrice: 999,
                                firstPhoto: ['https://example.com/p1.jpg'],
                            },
                        ],
                        pagination: {
                            totalOrders: 1,
                            totalPages: 1,
                            currentPage: 1,
                            limit: 10,
                            hasMore: false,
                        },
                    },
                },
                BrandsListResponse: {
                    type: 'object',
                    properties: {
                        brands: {
                            type: 'array',
                            items: {
                                allOf: [
                                    { $ref: '#/components/schemas/Brand' },
                                    {
                                        type: 'object',
                                        properties: { productsCount: { type: 'number' } },
                                    },
                                ],
                            },
                        },
                        pagination: { $ref: '#/components/schemas/PaginationBrands' },
                    },
                    example: {
                        brands: [
                            {
                                id: '64f0c2a1d9f3a2a1b0c67890',
                                name: 'Apple',
                                slug: 'apple',
                                logo: 'https://example.com/logo.png',
                                isDeleted: false,
                                productsCount: 5,
                            },
                        ],
                        pagination: {
                            totalBrands: 1,
                            totalPages: 1,
                            currentPage: 1,
                            limit: 10,
                            hasMore: false,
                        },
                    },
                },
                CategoriesListResponse: {
                    type: 'object',
                    properties: {
                        categories: {
                            type: 'array',
                            items: {
                                allOf: [
                                    { $ref: '#/components/schemas/Category' },
                                    {
                                        type: 'object',
                                        properties: { productsCount: { type: 'number' } },
                                    },
                                ],
                            },
                        },
                        pagination: { $ref: '#/components/schemas/PaginationCategories' },
                    },
                    example: {
                        categories: [
                            {
                                id: '64f0c2a1d9f3a2a1b0c99999',
                                name: 'Phones',
                                slug: 'phones',
                                productsCount: 12,
                            },
                        ],
                        pagination: {
                            totalCategories: 1,
                            totalPages: 1,
                            currentPage: 1,
                            limit: 10,
                            hasMore: false,
                        },
                    },
                },
                UsersListResponse: {
                    type: 'object',
                    properties: {
                        users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                        pagination: { $ref: '#/components/schemas/PaginationUsers' },
                    },
                    example: {
                        users: [
                            {
                                id: '64f0c2a1d9f3a2a1b0c12345',
                                firstName: 'Test',
                                lastName: 'User',
                                username: 'testuser',
                                role: 'user',
                                isDeleted: false,
                            },
                        ],
                        pagination: {
                            totalUsers: 1,
                            totalPages: 1,
                            currentPage: 1,
                            limit: 10,
                            hasMore: false,
                        },
                    },
                },
                ReviewsListResponse: {
                    type: 'object',
                    properties: {
                        reviews: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
                        pagination: { $ref: '#/components/schemas/PaginationReviews' },
                    },
                    example: {
                        reviews: [
                            {
                                id: '64f0c2a1d9f3a2a1b0c77777',
                                user: '64f0c2a1d9f3a2a1b0c12345',
                                product: '64f0c2a1d9f3a2a1b0c55555',
                                rating: 5,
                                comment: 'Great product',
                                name: 'Test',
                            },
                        ],
                        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
                    },
                },
                ProductDetailResponse: {
                    type: 'object',
                    properties: {
                        product: { $ref: '#/components/schemas/Product' },
                        reviewsPreview: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Review' },
                        },
                        hasMoreReviews: { type: 'boolean' },
                    },
                    example: {
                        product: {
                            id: '64f0c2a1d9f3a2a1b0c55555',
                            name: 'iPhone 14',
                            price: 999,
                            photos: ['https://example.com/p1.jpg'],
                            description: 'High-end smartphone',
                            category: '64f0c2a1d9f3a2a1b0c99999',
                            brand: '64f0c2a1d9f3a2a1b0c67890',
                            rating: { score: 4.7, voters: 120 },
                            stock: 10,
                            isDeleted: false,
                        },
                        reviewsPreview: [
                            {
                                id: '64f0c2a1d9f3a2a1b0c77777',
                                user: '64f0c2a1d9f3a2a1b0c12345',
                                product: '64f0c2a1d9f3a2a1b0c55555',
                                rating: 5,
                                comment: 'Great product',
                                name: 'Test',
                            },
                        ],
                        hasMoreReviews: false,
                    },
                },
            },
        },
    },
    apis: ['./routes/**/*.route.js'], // where your routes are
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = {
    swaggerSpec,
}
