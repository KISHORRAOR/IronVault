const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  mobile:             { type: String, required: true, unique: true, trim: true },
  masterPasswordHash: { type: String, required: true },
  mobileVerified:     { type: Boolean, default: false },
  loginAttempts:      { type: Number, default: 0 },
  isLocked:           { type: Boolean, default: false },
  lockedAt:           { type: Date, default: null },
  lastLoginAt:        { type: Date },
  lastLoginIP:        { type: String },
  createdAt:          { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)
