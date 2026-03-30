const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
  mobile:    { type: String, required: true },
  otp:       { type: String, required: true },
  purpose:   { type: String, enum: ['register', 'reset', 'unlock'], required: true },
  expiresAt: { type: Date, required: true },
  used:      { type: Boolean, default: false }
})

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('OTP', otpSchema)
