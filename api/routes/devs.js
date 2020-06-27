const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

const Developer = require ('../models/developer')

router.get('/:devId', (req, res, next) => {
    Developer.findOne({devId: req.params.devId})
        .select('devId name origin personnel twitter website')
        .exec()
        .then(data => {
            if (data) {
                console.log("Found from DB: ", data)
                res.status(200).json(data)
            } else {
                res.status(404).json({
                    message: "Dev not found"
                })
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
        res.status(500).json({
            message: "Error: devId already exists"
        })
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

    
    
    // const dev = new Developer({
    //     _id: mongoose.Types.ObjectId(),
    //     devId: req.body.devId,
    //     name: req.body.name,
    //     origin: req.body.origin,
    //     personnel: req.body.personnel,
    //     twitter: req.body.twitter,
    //     websote: req.body.website
    // })
    // dev.save()
    //     .then(result => {
    //         console.log("Write succesful")
    //         res.status(201).json({
    //             message: 'Write succesful',
    //             result: result
    //         })
    //     })
    //     .catch(err => {
    //         console.log(err)
    //     })

    // res.status(201).json({
    //     message: "Write successful",
    //     dev: dev
    // })
})

router.delete("/:devId", async (req, res, next) => {
    if (await Developer.exists({devId: req.params.devId})) {
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
    } else {
        res.status(404).json({
            message: "Error: Dev doesn't exist"
        })
    }
})

router.patch("/:devId", async (req, res, next) => {

    if (await Developer.exists({devId: req.params.devId})) {

        const fieldsToUpdate = {}
        for (const field in req.body) {
            // console.log(field, req.body[field])
            if (field === "devId") {
                if (await Developer.exists({devId: req.body.devId})) {
                    // res.status(500).json({
                    //     message: "Error: new devId must be unique"
                    // })
                    // break
                    // error = new Error ("New devId must be unique")
                    // error.status = 500
                    // next(error)
                    // TODO communicate with client about devId not being unique
                    console.log('New devId already exists. Field not updated.')
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
    } else {
        res.status(404).json({
            message: "Error: Dev doesn't exist"
        })
    }

    // Developer.findOneAndUpdate({devId: req.params.devId}, {},
    //     {new: true},
    //     (err, result) => {
    //         if (err) {
    //             res.status(500).json({
    //                 message: "Error in update",
    //                 error: err
    //             })
    //         } else {
    //             res.status(200).json({
    //                 message: "Update successful",
    //                 result: result
    //             })
    //         }
    //     }
    // )
})

// function confirmDevIdExistence(_devId) {
//     Developer.findOne({devId: _devId}, function(err, result) {
//         console.log(result)
//         return result
//     })
// }

module.exports = router