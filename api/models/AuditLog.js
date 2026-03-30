const mongoose = require('mongoose')

const auditSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:    { type: String, required: true },
  detail:    { type: String, default: '' },
  ip:        { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
})

auditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 })

module.exports = mongoose.model('AuditLog', auditSchema)
