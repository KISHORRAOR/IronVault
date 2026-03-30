const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const User    = require('../models/User')
const { sendOTP, verifyOTP } = require('../services/otpService')
const { log } = require('../services/auditService')
const { getIP, isValidMobile } = require('../utils/helpers')

const MAX_ATTEMPTS = 3

function makeTokens(userId) {
  const token        = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '2h' })
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
  return { token, refreshToken }
}

// POST /auth/send-register-otp
exports.sendRegisterOTP = async (req, res) => {
  try {
    const { mobile } = req.body
    if (!isValidMobile(mobile))
      return res.status(400).json({ message: 'Enter a valid 10-digit Indian mobile number.' })
    const exists = await User.findOne({ mobile })
    if (exists)
      return res.status(400).json({ message: 'An account already exists for this number. Please login.' })
    await sendOTP(mobile, 'register')
    res.json({ message: 'OTP sent successfully.' })
  } catch (e) {
    console.error('[auth] sendRegisterOTP:', e.message)
    res.status(500).json({ message: 'Failed to send OTP. Try again.' })
  }
}

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { mobile, otp, masterPassword } = req.body
    if (!mobile || !otp || !masterPassword)
      return res.status(400).json({ message: 'All fields are required.' })
    if (masterPassword.length < 8)
      return res.status(400).json({ message: 'Master password must be at least 8 characters.' })
    const result = await verifyOTP(mobile, otp, 'register')
    if (!result.valid) return res.status(400).json({ message: result.message })
    const exists = await User.findOne({ mobile })
    if (exists) return res.status(400).json({ message: 'Account already exists.' })
    const hash = await bcrypt.hash(masterPassword, 12)
    const user = await new User({ mobile, masterPasswordHash: hash, mobileVerified: true }).save()
    await log(user._id, 'REGISTER', 'Vault created', getIP(req))
    res.status(201).json({ message: 'Vault created! Please login.' })
  } catch (e) {
    console.error('[auth] register:', e.message)
    res.status(500).json({ message: 'Registration failed. Try again.' })
  }
}

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { mobile, masterPassword } = req.body
    if (!mobile || !masterPassword)
      return res.status(400).json({ message: 'Mobile and password are required.' })
    const user = await User.findOne({ mobile })
    if (!user)
      return res.status(404).json({ message: 'No account found. Please register first.' })
    if (user.isLocked)
      return res.status(403).json({ message: 'Account locked. Use OTP unlock to regain access.', locked: true })
    const match = await bcrypt.compare(masterPassword, user.masterPasswordHash)
    if (!match) {
      user.loginAttempts += 1
      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.isLocked = true
        user.lockedAt = new Date()
        await user.save()
        await log(user._id, 'LOCK', `Locked after ${MAX_ATTEMPTS} failed attempts`, getIP(req))
        return res.status(403).json({ message: `Account locked after ${MAX_ATTEMPTS} failed attempts. Use OTP unlock.`, locked: true })
      }
      await user.save()
      const left = MAX_ATTEMPTS - user.loginAttempts
      return res.status(401).json({ message: `Wrong password. ${left} attempt${left === 1 ? '' : 's'} remaining.`, attemptsLeft: left })
    }
    user.loginAttempts = 0
    user.isLocked      = false
    user.lockedAt      = null
    user.lastLoginAt   = new Date()
    user.lastLoginIP   = getIP(req)
    await user.save()
    const { token, refreshToken } = makeTokens(user._id)
    await log(user._id, 'LOGIN', 'Successful login', getIP(req))
    res.json({ message: 'Login successful.', token, refreshToken })
  } catch (e) {
    console.error('[auth] login:', e.message)
    res.status(500).json({ message: 'Login failed. Try again.' })
  }
}

// POST /auth/refresh
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required.' })
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const token   = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '2h' })
    res.json({ token })
  } catch (e) {
    res.status(401).json({ message: 'Invalid refresh token. Please login again.' })
  }
}

// POST /auth/logout
exports.logout = async (req, res) => {
  try {
    await log(req.userId, 'LOGOUT', 'User logged out', getIP(req))
    res.json({ message: 'Logged out.' })
  } catch (e) {
    res.status(500).json({ message: 'Server error.' })
  }
}

// POST /auth/send-unlock-otp
exports.sendUnlockOTP = async (req, res) => {
  try {
    const { mobile } = req.body
    if (!isValidMobile(mobile))
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number.' })
    const user = await User.findOne({ mobile })
    if (!user) return res.status(404).json({ message: 'No account found for this number.' })
    if (!user.isLocked) return res.status(400).json({ message: 'Account is not locked.' })
    await sendOTP(mobile, 'unlock')
    res.json({ message: 'Unlock OTP sent.' })
  } catch (e) {
    console.error('[auth] sendUnlockOTP:', e.message)
    res.status(500).json({ message: 'Failed to send OTP. Try again.' })
  }
}

// POST /auth/unlock
exports.unlock = async (req, res) => {
  try {
    const { mobile, otp, newPassword } = req.body
    if (!mobile || !otp || !newPassword)
      return res.status(400).json({ message: 'All fields are required.' })
    if (newPassword.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' })
    const result = await verifyOTP(mobile, otp, 'unlock')
    if (!result.valid) return res.status(400).json({ message: result.message })
    const user = await User.findOne({ mobile })
    if (!user) return res.status(404).json({ message: 'User not found.' })
    user.masterPasswordHash = await bcrypt.hash(newPassword, 12)
    user.isLocked      = false
    user.loginAttempts = 0
    user.lockedAt      = null
    await user.save()
    await log(user._id, 'UNLOCK', 'Account unlocked via OTP', getIP(req))
    res.json({ message: 'Account unlocked. Please login with your new password.' })
  } catch (e) {
    console.error('[auth] unlock:', e.message)
    res.status(500).json({ message: 'Unlock failed. Try again.' })
  }
}

// POST /auth/send-reset-otp
exports.sendResetOTP = async (req, res) => {
  try {
    const { mobile } = req.body
    if (!isValidMobile(mobile))
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number.' })
    const user = await User.findOne({ mobile })
    if (!user) return res.status(404).json({ message: 'No account found for this number.' })
    await sendOTP(mobile, 'reset')
    res.json({ message: 'Reset OTP sent.' })
  } catch (e) {
    console.error('[auth] sendResetOTP:', e.message)
    res.status(500).json({ message: 'Failed to send OTP. Try again.' })
  }
}

// POST /auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { mobile, otp, newPassword } = req.body
    if (!mobile || !otp || !newPassword)
      return res.status(400).json({ message: 'All fields are required.' })
    if (newPassword.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' })
    const result = await verifyOTP(mobile, otp, 'reset')
    if (!result.valid) return res.status(400).json({ message: result.message })
    const user = await User.findOne({ mobile })
    if (!user) return res.status(404).json({ message: 'User not found.' })
    user.masterPasswordHash = await bcrypt.hash(newPassword, 12)
    user.loginAttempts = 0
    user.isLocked      = false
    user.lockedAt      = null
    await user.save()
    await log(user._id, 'PASSWORD_RESET', 'Reset via OTP', getIP(req))
    res.json({ message: 'Password reset. Please login.' })
  } catch (e) {
    console.error('[auth] resetPassword:', e.message)
    res.status(500).json({ message: 'Reset failed. Try again.' })
  }
}
