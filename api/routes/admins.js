const express = require('express')
const router = express.Router()

const AdminController = require('../controllers/admins.js')

router.post(
    '/login',
    AdminController.cleanFailedAttemptsLog,
    AdminController.validateFailedAttemptsLog,
    AdminController.login
)

router.post(
    '/refresh',
    AdminController.refresh
)

router.post(
    '/logout',
    AdminController.logout
)

module.exports = router