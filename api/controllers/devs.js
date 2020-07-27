const mongoose = require('mongoose')
const Developer = require ('../models/developer')
const FIELDS_TO_GET = "devId name origin website twitter personnel"

exports.getAll = (req, res) => {
    Developer.find({})
    .select(FIELDS_TO_GET)
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Dev fetch ALL successful',
            amount: result.length,
            result: result
        })
    })
    .catch(err => {
        if (err) {
            res.status(500).json({
                message: "Error",
                error: err
            })
        }
    })
}

exports.getOne = (req, res) => {
    Developer.findOne({devId: req.params.devId})
        .select(FIELDS_TO_GET)
        .exec()
        .then(result => {
            if (result) {
                // console.log("Found from DB: ", data)
                res.status(200).json({
                    message: "Dev fetch successful",
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

    const dev = new Developer({
        _id: mongoose.Types.ObjectId(),
        devId: req.body.devId,
        name: req.body.name,
        origin: req.body.origin,
        personnel: req.body.personnel,
        twitter: req.body.twitter,
        website: req.body.website,
    })
    dev.save()
        .then(result => {
            res.status(201).json({
                message: 'Dev created succesfully',
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

    Developer.updateOne(
        {devId: req.params.devId},
        {$set: fieldsToUpdate},
        {new: true})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Dev updated successfully",
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

exports.delete = async (req, res) => {

    Developer.deleteOne({devId: req.params.devId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Dev deleted successfully",
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

exports.checkExists = async (req, res, next) => {
    if (await Developer.exists({devId: req.params.devId})) {
        next()
    } else {
        res.status(404).json({
            message: "Error: requested devId doesn't exist"
        })
    }
}

exports.checkNotExists = async (req, res, next) => {
    if (await Developer.exists({devId: req.body.devId})) {
        res.status(409).json({
            message: "Error: devId already exists"
        })
    } else {
        next()
    }
}

exports.checkNewId = async (req, res, next) => {
    if (!req.body.gameId) {
        next()
        return
    }
    if (await Developer.exists({devId: req.body.devId})) {
        res.status(409).json({
            message: "New devId already exists."
        })
    } else {
        next();
    }
}