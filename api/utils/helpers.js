const getIP = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.socket?.remoteAddress ||
  'unknown'

const isValidMobile = (m) => /^[6-9]\d{9}$/.test(m)

module.exports = { getIP, isValidMobile }
