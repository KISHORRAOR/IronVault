const express    = require('express')
const router     = express.Router()
const ctrl       = require('../controllers/authController')
const authMW     = require('../middleware/auth')
const rateLimit  = require('express-rate-limit')

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, max: 5,
  message: { message: 'Too many OTP requests. Wait 10 minutes.' },
  standardHeaders: true, legacyHeaders: false
})
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { message: 'Too many login attempts. Wait 15 minutes.' },
  standardHeaders: true, legacyHeaders: false
})

router.post('/send-register-otp', otpLimiter,   ctrl.sendRegisterOTP)
router.post('/register',                         ctrl.register)
router.post('/login',             loginLimiter,  ctrl.login)
router.post('/refresh',                          ctrl.refreshToken)
router.post('/logout',            authMW,        ctrl.logout)
router.post('/send-unlock-otp',   otpLimiter,    ctrl.sendUnlockOTP)
router.post('/unlock',                           ctrl.unlock)
router.post('/send-reset-otp',    otpLimiter,    ctrl.sendResetOTP)
router.post('/reset-password',                   ctrl.resetPassword)

module.exports = router
