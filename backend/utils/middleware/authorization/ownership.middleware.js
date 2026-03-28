const ownership = (Model, paramName, ownerField = 'userId', adminBypass = false) => {
  return async (req, res, next) => {

    const resource = await Model.findById(req.params[paramName])

    if (!resource) {
      return res.status(404).json({ error: 'resource not found' })
    }

    req.resource = resource

    if (adminBypass && req.user && req.user.role === 'admin') {
      return next()
    }

    if (String(resource[ownerField]) !== String(req.user.id)) {
      return res.status(403).json({ error: 'forbidden' })
    }

    next()
  }
}

module.exports = ownership
