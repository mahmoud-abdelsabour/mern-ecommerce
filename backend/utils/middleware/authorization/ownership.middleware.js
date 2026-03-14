const ownership = (Model, paramName, ownerField = 'userId') => {
  return async (req, res, next) => {

    const resource = await Model.findById(req.params[paramName]).select(ownerField)

    if (!resource) {
      return res.status(404).json({ error: 'resource not found' })
    }

    if (String(resource[ownerField]) !== String(req.user.id)) {
      return res.status(403).json({ error: 'forbidden' })
    }

    req.resource = resource

    next()
  }
}

module.exports = ownership