const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

const GameController = require('../controllers/games')
const authorize = require('../middleware/auth')

router.get('/',
    GameController.getAll
)

router.get('/:gameId',
    GameController.checkExists,
    GameController.getOne
)

router.post('/',
    authorize,
    GameController.checkNotExists,
    GameController.create
)

router.patch("/:gameId",
    authorize,
    GameController.checkExists,
    GameController.checkNewId,
    GameController.update
)

router.delete('/:gameId',
    authorize,
    GameController.checkExists,
    GameController.delete
)

module.exports = router