const AuditLog = require('../models/AuditLog')

async function log(userId, action, detail, ip) {
  try {
    await new AuditLog({ userId, action, detail: detail || '', ip: ip || '' }).save()
  } catch (e) {
    console.error('[Audit] write failed:', e.message)
  }
}

module.exports = { log }
