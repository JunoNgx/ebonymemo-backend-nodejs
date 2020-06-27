const mongoose = require("mongoose")

const developerSchema = mongoose.Schema({
    devId: {type: String, required: true},
    name: {type: String, required: true},
    origin: {type: String, required: true},
    personnel: {type: Array, required: false},
    twitter: {type: String, required: false},
    website: {type: String, required: false}
})

module.exports = mongoose.model('Developer', developerSchema)