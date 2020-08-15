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
    DevController.validateExists,
    DevController.getOne
)

router.post(
    '/',
    authorize,
    DevController.validateNotExists,
    DevController.create
)

router.patch(
    '/:devId',
    authorize,
    DevController.validateExists,
    DevController.validateNewId,
    DevController.update
)

router.delete(
    '/:devId',
    authorize,
    DevController.validateExists,
    DevController.delete
)

module.exports = router