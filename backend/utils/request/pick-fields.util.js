const { isExistedUser } = require('../user/user-check.util')

const pickAllowedFields = async (props) => {
    const updates = {};
    for (const field of props.allowedFields) {
        if (props.requestFields[field] !== undefined) {
            updates[field] = props.requestFields[field];
        }
    }

    const updateOps = {$set: updates}

    const {_, message} = await isExistedUser(updates, props.user.id)
    if(message) throw Object.assign(new Error(message), { statusCode: 409 })

    if(updates.email){
        updateOps.$inc = { tokenVersion: 1 }
    }

    return updateOps
}

module.exports = {pickAllowedFields}
