const requireOwnership = (getUserId) => {
  return (req, res, next) => {
    const resourceUserId = getUserId(req)

    if (String(req.user.id) !== String(resourceUserId)) {
      return res.status(403).json({ error: "forbidden" })
    }

    next()
  }
}

module.exports = requireOwnership