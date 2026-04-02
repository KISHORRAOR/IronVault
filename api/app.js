const express   = require('express')
const cors      = require('cors')
const helmet    = require('helmet')
const path      = require('path')
const rateLimit = require('express-rate-limit')

const app = express()

app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
      scriptSrcAttr: ["'unsafe-inline'"],   // ⭐ ADD THIS LINE
      styleSrc:   ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc:    ["'self'", "fonts.gstatic.com"],
      connectSrc: ["'self'", "https://ironvault-rh8x.onrender.com/", "api.pwnedpasswords.com", "www.fast2sms.com"],
      imgSrc:     ["'self'", "data:", "www.google.com", "https:"],
    }
  }
}))

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.options('*',cors())
app.use(express.json({ limit: '1mb' }))

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, max: 500,
  standardHeaders: true, legacyHeaders: false,
  message: { message: 'Too many requests. Slow down.' }
}))

const publicDir = path.join(__dirname, '..', 'public')
app.use(express.static(publicDir))

app.use('/api/auth',        require('./routes/auth'))
app.use('/api/credentials', require('./routes/credentials'))
app.use('/api/audit',  require('./routes/audit'))

app.get('/vault',    (_, res) => res.sendFile(path.join(publicDir, 'vault.html')))
app.get('/register', (_, res) => res.sendFile(path.join(publicDir, 'register.html')))
app.get('/forgot',   (_, res) => res.sendFile(path.join(publicDir, 'forgot.html')))
app.get('/unlock',   (_, res) => res.sendFile(path.join(publicDir, 'unlock.html')))
//app.get('/audit',    (_, res) => res.sendFile(path.join(publicDir, 'audit.html')))
app.get('/login',    (_, res) => res.sendFile(path.join(publicDir, 'login.html')))
app.get('/',         (_, res) => res.sendFile(path.join(publicDir, 'login.html')))

app.use((req, res) => res.status(404).json({ message: 'Not found.' }))
app.use((err, req, res, next) => {
  console.error('[Error]', err.message)
  res.status(500).json({ message: 'Internal server error.' })
})

module.exports = app
