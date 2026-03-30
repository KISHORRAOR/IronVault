require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'AES_SECRET']
const missing  = required.filter(k => !process.env[k] || process.env[k].startsWith('PASTE_'))
if (missing.length) {
  console.error('\n✗ Missing .env values:', missing.join(', '))
  console.error('  Edit .env and fill in the required values, then restart.\n')
  process.exit(1)
}

const connectDB = require('./config/db')
const app       = require('./app')
const PORT      = process.env.PORT || 3000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════╗')
    console.log('║         IronVault is running             ║')
    console.log(`║   http://localhost:${PORT}                   ║`)
    console.log('╚══════════════════════════════════════════╝\n')
  })
})

module.exports = app
