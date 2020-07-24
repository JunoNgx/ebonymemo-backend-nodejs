const express = require("express")
const router = express.Router()

const DevController = require('../controllers/devs')
const authorize = require('../middleware/auth')

// mainly for the admin panel
router.get(
    '/',
    DevController.getAll
)

router.get(
    '/:devId',
    DevController.checkExists,
    DevController.getOne
)

router.post(
    '/',
    // authorize,
    DevController.checkNotExists,
    DevController.create
)

router.patch(
    '/:devId',
    // authorize,
    DevController.checkExists,
    DevController.checkNewId,
    DevController.update
)

router.delete(
    '/:devId',
    // authorize,
    DevController.checkExists,
    DevController.delete
)

module.exports = router