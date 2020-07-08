const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

// const Developer = require ('../models/developer')
const Game = require ('../models/game')

router.get('/', (req, res, next) => {
    //Get ALL games
    Game.find({})
    .select('gameId name releaseYear devId')
    .populate('developer')
    .exec()
    .then(result => {
        res.status(200).json({
            message: "GET ALL successful",
            amount: result.length,
            result: result
        })
    })
    .catch(err => {
        res.status(500).json({
            message: "Error",
            error: err
        })
    })
})

router.get('/:gameId', (req, res, next) => {
    Game.findOne({gameId: req.params.gameId})
    .select('gameId name releaseYear devId')
    // defined in the Game model's virtual population
    .populate('developer')
    .exec()
    .then(result => {
        // console.log("Found from DB: ", result)
        if (result) {
            res.status(200).json(result)
        } else {
            res.status(404).json({
                message: "Error: gameId not found"
            })
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err})
    })
})

router.post('/', async (req, res, next) => {
    if (await Game.exists({gameId: req.body.gameId})) {
        res.status(500).json({
            message: "Error: gameId already axists"
        })
    } else {
        if (await Developer.exists({devId: req.body.devId})) {
            const game = new Game({
                gameId: req.body.gameId,
                name: req.body.name,
                releaseYear: req.body.releaseYear,
                devId: req.body.devId,
                android: req.body.android,
                ios: req.body.ios,
                otherReleases: req.body.otherReleases,
                dateAdded: Date.now()
            })
            game.save()
                .then(result => {
                    res.status(201).json({
                        message: "Game created successfully",
                        result: result
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        message: 'Error',
                        error: err 
                    })
                })
        } else {
            res.status(500).json({
                message: "Cannot enter an invalid dev"
            })
        }
        
    }   
})

router.delete('/:gameId', async (req, res, next) => {
    if (await Game.exists({gameId: req.params.gameId})) {
        Game.deleteOne({gameId: req.params.gameId})
            .exec()
            .then(result => {
                res.status(200).json({
                    message: "Game deleted successfully",
                    result: result
                })
            })
            .catch(err => {
                req.status(500).json({
                    message: "Error",
                    error: err
                })
            })
    } else {
        res.status(404).json({
            message: "Error: gameId not found"
        })
    }
})

router.patch("/:gameId", async (req, res, next) => {

    if (await (Game.exists({gameId: req.params.gameId}))) {

        const fieldsToUpdate = {}
        for (const field in req.body) {
            if (field === "gameId") {
                if (await (Game.exists({gameId: req.body.gameId}))) {
                    // TODO communicate with client about devId not being unique
                    console.log('New gameId already exists. Field not updated.')
                } else {
                    fieldsToUpdate[field] = req.body[field]
                }
            } else {
                fieldsToUpdate[field] = req.body[field]
            }
        }

        Game.updateOne(
            {gameId: req.params.gameId},
            {$set: fieldsToUpdate},
            {new: true})
            .exec()
            .then(result => {
                res.status(200).json({
                    message: "Game updated successfully",
                    result: result
                })
            })
            .catch(err => {
                res.status(500). json({
                    message: "Error",
                    error: err
                })
            })
        
    } else {
        res.status(404).json({
            message: "Error: gameId not found"
        })
    }
})

module.exports = router