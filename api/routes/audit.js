const express  = require('express')
const router   = express.Router()
const authMW   = require('../middleware/auth')
const ctrl     = require('../controllers/auditController')

router.get('/', authMW, ctrl.getLogs)
module.exports = router
