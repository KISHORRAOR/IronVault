const axios  = require('axios')
const crypto = require('crypto')
const OTP    = require('../models/OTP')

function generateOTP() {
  return String(crypto.randomInt(100000, 999999))
}

async function sendOTP(mobile, purpose) {
  const otp       = generateOTP()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await OTP.deleteMany({ mobile, purpose })
  await new OTP({ mobile, otp, purpose, expiresAt }).save()

  // Always print OTP for dev/testing
  console.log('\n┌─────────────────────────────────────┐')
  console.log(`│  OTP [${purpose.toUpperCase().padEnd(8)}] → ${mobile}  │`)
  console.log(`│  Code: ${otp}                          │`)
  console.log('│  Expires in 5 minutes               │')
  console.log('└─────────────────────────────────────┘\n')

  // Attempt Fast2SMS
  const key = process.env.FAST2SMS_API_KEY
  if (key && !key.startsWith('PASTE_')) {
    try {
      const r = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
        params: { authorization: key, variables_values: otp, route: 'otp', numbers: mobile },
        timeout: 8000
      })
      console.log('✓ SMS sent via Fast2SMS')
    } catch (err) {
      const reason = err.response?.data?.message || err.message
      console.warn('⚠ Fast2SMS failed (use console OTP above):', reason)
    }
  }

  return otp
}

async function verifyOTP(mobile, inputOtp, purpose) {
  const record = await OTP.findOne({ mobile, purpose, used: false })
  if (!record)                         return { valid: false, message: 'OTP not found or already used.' }
  if (new Date() > record.expiresAt)   return { valid: false, message: 'OTP has expired. Request a new one.' }
  if (record.otp !== String(inputOtp).trim()) return { valid: false, message: 'Incorrect OTP.' }
  record.used = true
  await record.save()
  return { valid: true }
}

module.exports = { sendOTP, verifyOTP }
