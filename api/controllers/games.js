const mongoose = require("mongoose")
const Game = require ('../models/game')

exports.getWithQuery = async (req, res) => {

    let q = {}
    // QUERY PARAMETER: searchName, to string to search from game.name with regex processing
    // ^ to match at start of the line
    // | to create a boolean OR
    // \s to match at start of every word (i.e. after a whitespace)
    // 3. Flag: case insensitive
    q.searchOption = (req.query.searchName)
        ? {name: { $regex: new RegExp("^" + req.query.searchName + "|\\s" + req.query.searchName, "i") }}
        : {}

    // QUERY PARAMETER: limit, the amount of results to return
    q.limit = parseInt(req.query.limit) || 0
    // QUERY PARAMETER: page, the page of the paginated response
    q.page = parseInt(req.query.page) || 1
    // The start index of the result iaccording to page number
    q.startIndex = q.limit * (q.page - 1)

    // QUERY PARAMETER: sortBy, the property to sort by
    const sortProp = req.query.sortBy || ''
    // QUERY PARAMETER: sortOrder, anything not 'desc' is 'asc'
    const sortOrder = (req.query.sortOrder === 'desc')
        ? 'desc' : 'asc'
    // Create object for sortOption from strings
    // If sortProp is parsed, then make sortOption blank
    q.sortOption = (sortProp)
        ? JSON.parse('{"' + sortProp + '":"' + sortOrder + '"}')
        : {}
    // console.log(q.sortOption)


    q.last_page = (q.limit===0)
        ? 1
        : Math.ceil((await Game.countDocuments(q.searchOption))/q.limit)
    
    console.log(await Game.countDocuments(q.searchOption) )

    Game.find(q.searchOption)
        .select('gameId name coverUrl releaseYear devId ios android other dateAdded featured')
        .populate('developer', 'name')
        .skip(q.startIndex)
        .limit(q.limit)
        .collation({'locale': 'en'})
        .sort(q.sortOption)
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Games fetch successful",
                limit: q.limit,
                page: q.page,
                last_page: q.last_page,
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
        .select('gameId name coverUrl releaseYear devId ios android other dateAdded description featured')
        // defined in the Game model's virtual population
        .populate('developer')
        .exec()
        .then(result => {
            // console.log("Found from DB: ", result)
            if (result) {
                res.status(200).json({
                    message: "Single game fetch successful",
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
        featured: req.body.featured,
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
                url: req.body.publicCoverUrl,
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

exports.validateExists = async (req, res, next) => {
    if (await Game.exists({gameId: req.params.gameId})) {
        next()
    } else {
        res.status(404).json({
            message: "Error: requested gameId doesn't exit"
        })
    }
}

exports.validateNotExists = async (req, res, next) => {
    if (await Game.exists({gameId: req.body.gameId})) {
        res.status(409).json({
            message: "Error: gameId already axists"
        })
    } else {
        next()
    }
}

exports.validateNewId = async (req, res, next) => {
    if (!req.body.gameId) {
        next()
        return
    }
    if (await (Game.exists({gameId: req.body.gameId}))) {
        res.status(409).json({
            message: "New gameId already exists."
        })
    } else {
        next()
    }
}