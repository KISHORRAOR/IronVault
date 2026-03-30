const express  = require('express')
const router   = express.Router()
const authMW   = require('../middleware/auth')
const ctrl     = require('../controllers/credentialController')

router.use(authMW)
router.get('/search',          ctrl.search)
router.get('/export',          ctrl.exportVault)
router.get('/',                ctrl.getAll)
router.post('/',               ctrl.create)
router.post('/bulk-delete',    ctrl.bulkDelete)
router.put('/:id',             ctrl.update)
router.patch('/:id/favourite', ctrl.toggleFavourite)
router.patch('/:id/used',      ctrl.markUsed)
router.delete('/:id',          ctrl.remove)

module.exports = router
