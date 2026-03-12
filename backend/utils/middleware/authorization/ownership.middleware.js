const requireOwnership = (getResourceUserId) => async (req, res, next) => {
  const resourceUserId = await getResourceUserId(req)
  if (!resourceUserId) return res.status(404).json({ error: 'resource not found' })

  if (String(req.user.id) !== String(resourceUserId)) {
    return res.status(403).json({ error: 'forbidden' })
  }
  next()
}

module.exports = requireOwnership
