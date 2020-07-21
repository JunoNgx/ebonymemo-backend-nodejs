const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

const Developer = require ('../models/developer')

router.get('/', (req, res, next) => {
    Developer.find({})
    .select("devId name origin website twitter peronnel")
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Dev read ALL successful',
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
})

router.get('/:devId', checkExists, (req, res, next) => {
    Developer.findOne({devId: req.params.devId})
        .select('devId name origin personnel twitter website')
        .exec()
        .then(result => {
            if (result) {
                // console.log("Found from DB: ", data)
                res.status(200).json(result)
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error: err})
        })
})

router.post("/", async (req, res, next) => {

    // Making sure that no item of the same id already exists
    if (await Developer.exists({devId: req.body.devId})) {
        res.status(409).json({
            message: "Error: devId already exists"
        })
        return;
    } else {
        // console.log('confirming not exists')
        const dev = new Developer({
            _id: mongoose.Types.ObjectId(),
            devId: req.body.devId,
            name: req.body.name,
            origin: req.body.origin,
            personnel: req.body.personnel,
            twitter: req.body.twitter,
            websote: req.body.website
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
})

router.delete("/:devId", checkExists, async (req, res, next) => {

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

})

router.patch("/:devId", checkExists, async (req, res, next) => {
    // console.log(req.body);
    const fieldsToUpdate = {}
    for (const field in req.body) {
        if (field === "devId") {
            if (await Developer.exists({devId: req.body.devId})) {
                // console.log('New devId already exists. Field not updated.')
                res.status(409).json({
                    message: "New devId already exists."
                })
            } else {
                fieldsToUpdate[field] = req.body[field]
            }
        } else {
            fieldsToUpdate[field] = req.body[field]
        }

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

})

async function checkExists(req, res, next) {
    if (await Developer.exists({devId: req.params.devId})) {
        next()
    } else {
        res.status(404).json({
            message: "Error: requested devId doesn't exist"
        })
    }
}

module.exports = router