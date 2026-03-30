const AuditLog = require('../models/AuditLog')

exports.getLogs = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 50
    const logs  = await AuditLog.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    const total = await AuditLog.countDocuments({ userId: req.userId })
    res.json({ logs, total, page, pages: Math.ceil(total / limit) })
  } catch (e) { res.status(500).json({ message: 'Server error.' }) }
}
