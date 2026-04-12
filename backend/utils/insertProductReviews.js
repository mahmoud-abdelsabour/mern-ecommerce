/* eslint-disable no-console -- CLI script */
/**
 * One-off utility: inserts N review documents for a fixed product using real users
 * from the database (skips users who already reviewed that product), then recomputes
 * the product's aggregate rating via the same helper the API uses.
 *
 * Run from the backend folder (development DB only — do not point at production by mistake):
 *   npm run insert-product-reviews
 *
 * Requirements:
 *   - MONGODB_URI in .env (NODE_ENV=development so TEST_MONGODB_URI is not used)
 *   - At least N users in the DB who have not yet reviewed the target product
 *   - Target product must exist (including non-deleted is preferred; deleted products
 *     are still found with skipDeletedFilter so you can repair test data)
 */

const mongoose = require('mongoose')
const config = require('./config/config')
const User = require('../models/user.model')
const Product = require('../models/product.model')
const Review = require('../models/review.model')
const { updateProductRating } = require('../services/product.service')

/** Product to attach reviews to (24-char hex ObjectId). */
const TARGET_PRODUCT_ID = '69ce934ecc806eee9c94ef74'

/** How many reviews to insert (each uses a distinct user; unique index user+product). */
const REVIEWS_TO_INSERT = 20

const RATINGS_SEQUENCE = [5, 5, 4, 5, 3, 5, 4, 4, 5, 5, 4, 5, 3, 4, 5, 4, 5, 5, 4, 5]

const COMMENTS = [
    'Excellent product — fast shipping and exactly as pictured.',
    'Very happy with this purchase. Quality exceeded my expectations.',
    'Solid build quality. Would buy again without hesitation.',
    'Good value for money. Minor packaging dent but item was fine.',
    'It is okay; does the job but nothing exceptional.',
    'Love it! Five stars for design and comfort.',
    'Arrived on time. Works well with my setup.',
    'Nice finish and accurate description on the site.',
    'Decent product. A few small imperfections but acceptable for the price.',
    'Outstanding — recommended to friends already.',
    'Met my needs. Customer support was helpful when I had a question.',
    'Great overall experience from order to delivery.',
    'Pretty good. I might try a different variant next time.',
    'Exactly what I was looking for. No surprises.',
    'Average quality — not bad, not amazing.',
    'Impressed by the materials used. Feels durable.',
    'Good product; installation was straightforward.',
    'Very satisfied. Will order from this store again.',
    'Mixed feelings — great features but slightly overpriced.',
    'Fantastic! Exceeded expectations in every way.',
]

const assertSafeToRun = () => {
    if (!config.MONGODB_URI) {
        throw new Error('MONGODB_URI is missing. Set it in backend/.env')
    }
    if (process.env.NODE_ENV === 'test') {
        throw new Error(
            'Refusing to run while NODE_ENV=test (use development with a dedicated URI).'
        )
    }
}

const connectDb = async () => {
    assertSafeToRun()
    await mongoose.connect(config.MONGODB_URI, { family: 4 })
}

const main = async () => {
    await connectDb()

    if (!mongoose.Types.ObjectId.isValid(TARGET_PRODUCT_ID)) {
        throw new Error(`Invalid TARGET_PRODUCT_ID: ${TARGET_PRODUCT_ID}`)
    }
    const productObjectId = new mongoose.Types.ObjectId(TARGET_PRODUCT_ID)

    const product = await Product.findById(productObjectId).setOptions({ skipDeletedFilter: true })
    if (!product) {
        throw new Error(`Product not found for id ${TARGET_PRODUCT_ID}`)
    }
    if (product.isDeleted) {
        console.warn('Warning: product is marked deleted; reviews will still be inserted.')
    }

    const alreadyReviewedUserIds = await Review.find({ product: productObjectId }).distinct('user')

    const users = await User.find({
        _id: { $nin: alreadyReviewedUserIds },
    })
        .select('_id firstName')
        .limit(REVIEWS_TO_INSERT)
        .lean()

    if (users.length < REVIEWS_TO_INSERT) {
        throw new Error(
            `Need ${REVIEWS_TO_INSERT} users without an existing review for this product; ` +
                `found only ${users.length}. Add more users or remove duplicate reviews first.`
        )
    }

    const docs = users.map((user, index) => ({
        user: user._id,
        product: productObjectId,
        rating: RATINGS_SEQUENCE[index],
        comment: COMMENTS[index],
        name: user.firstName,
    }))

    const session = await mongoose.startSession()
    let usedTransaction = false

    try {
        session.startTransaction()
        usedTransaction = true
        await Review.insertMany(docs, { session, ordered: true })
        await updateProductRating({ productId: productObjectId, session })
        await session.commitTransaction()
    } catch (err) {
        if (usedTransaction) {
            await session.abortTransaction().catch(() => {})
        }
        const msg = String(err?.message ?? err)
        const isReplicaSetIssue =
            /replica set|transaction numbers|Transaction numbers|IllegalOperation/i.test(msg)
        if (!isReplicaSetIssue) {
            throw err
        }
        console.warn(
            'MongoDB transaction not available (typical on standalone). ' +
                'Retrying without transaction: inserts are still validated; if insertMany fails, no partial rating update is applied.'
        )
        await Review.insertMany(docs, { ordered: true })
        await updateProductRating({ productId: productObjectId })
    } finally {
        await session.endSession()
    }

    const totalForProduct = await Review.countDocuments({ product: productObjectId })
    const refreshed = await Product.findById(productObjectId).setOptions({ skipDeletedFilter: true })

    console.log('Done.')
    console.log(`Inserted ${docs.length} reviews for product ${TARGET_PRODUCT_ID}`)
    console.log(`Total reviews for this product: ${totalForProduct}`)
    console.log(`Product rating now: score=${refreshed?.rating?.score}, voters=${refreshed?.rating?.voters}`)
}

main()
    .catch(err => {
        console.error(err)
        process.exitCode = 1
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close()
        }
    })
