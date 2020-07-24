const mongoose = require("mongoose")
const Game = require ('../models/game')

const FIELDS_TO_GET = 'gameId name coverUrl releaseYear devId ios android other dateAdded'

exports.getAll = (req, res) => {
    Game.find({})
        .select(FIELDS_TO_GET)
        .populate('developer')
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Game fetch ALL successful",
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
}

exports.getOne = (req, res) => {
    Game.findOne({gameId: req.params.gameId})
        .select(FIELDS_TO_GET)
        // defined in the Game model's virtual population
        .populate('developer')
        .exec()
        .then(result => {
            // console.log("Found from DB: ", result)
            if (result) {
                res.status(200).json({
                    message: "Game fetch successful",
                    result: result
                })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error: err})
        })
}

exports.create = async (req, res) => {

    const game = new Game({
        gameId: req.body.gameId,
        name: req.body.name,
        releaseYear: req.body.releaseYear,
        devId: req.body.devId,
        android: req.body.android,
        ios: req.body.ios,
        other: req.body.other,
        description: req.body.description,
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

}

exports.update = async (req, res) => {

    const fieldsToUpdate = {}
    for (const field in req.body) {
        fieldsToUpdate[field] = req.body[field]
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
}

exports.delete = async (req, res) => {

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
}

exports.updateCover = (req, res) => {
    Game.updateOne(
        {gameId: req.params.gameId},
        {$set: {coverUrl: req.body.publicCoverUrl}})
        .exec()
        .then(result=>{
            res.status(200).json({
                message: "Game cover updated successfully",
                result: result
            })
        })
        .catch(err => {
            res.status(500).json({
                message: "Error",
                error: err
            })
        })
}

exports.checkExists = async (req, res, next) => {
    if (await Game.exists({gameId: req.params.gameId})) {
        next()
    } else {
        res.status(404).json({
            message: "Error: requested gameId doesn't exit"
        })
    }
}
exports.checkNotExists = async (req, res, next) => {
    if (await Game.exists({gameId: req.body.gameId})) {
        res.status(409).json({
            message: "Error: gameId already axists"
        })
    } else {
        next()
    }
}

exports.checkNewId = async (req, res, next) => {
    if (!req.body.gameId) next()
    if (await (Game.exists({gameId: req.body.gameId}))) {
        res.status(409).json({
            message: "New gameId already exists."
        })
    } else {
        next()
    }
}