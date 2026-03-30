const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const header = req.headers['authorization']
  if (!header) return res.status(401).json({ message: 'No token provided.' })
  const token = header.startsWith('Bearer ') ? header.slice(7) : header
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Session expired. Please login again.' })
  }
}
