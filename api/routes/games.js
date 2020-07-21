const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

const Developer = require ('../models/developer')
const Game = require ('../models/game')

const GameController = require('../controllers/games')

router.get('/',
    GameController.getAll
)

router.get('/:gameId',
    GameController.checkExists,
    GameController.getOne
)

router.post('/',
    GameController.checkNotExists,
    GameController.create
)

router.patch("/:gameId",
    GameController.checkExists,
    GameController.update
)

router.delete('/:gameId',
    GameController.checkExists,
    GameController.delete
)

module.exports = router