const express = require("express")
const router = express.Router()

const GameController = require('../controllers/games')
const authorize = require('../middleware/auth')
const uploadCover = require('../middleware/upload')

router.get(
    '/',
    GameController.getWithQuery
)

router.get(
    '/:gameId',
    GameController.validateExists,
    GameController.getOne
)

router.post(
    '/',
    authorize,
    GameController.validateNotExists,
    GameController.create
)

router.post(
    '/:gameId/cover',
    authorize,
    GameController.validateExists,
    uploadCover,
    GameController.updateCover
)

router.patch(
    '/:gameId',
    authorize,
    GameController.validateExists,
    GameController.validateNewId,
    GameController.update
)

router.delete(
    '/:gameId',
    authorize,
    GameController.validateExists,
    GameController.delete
)

module.exports = router