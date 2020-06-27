const mongoose = require("mongoose")

const gameSchema = mongoose.Schema({
        gameId: {type: String, required: true},
        name: {type: String, required: true},
        releaseYear: {type: Number, required: true},
        devId: {type: String, required: true},
        android: {type: String, required: false},
        ios: {type: String, required: false},
        otherReleases: {type: Array, required: false},
        dateAdded: {type: Date}
    }, {
        // These two lines are important for virtual schema population
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    }
)

// will create a new key developer
// with the content from the model Developer
// when populated
gameSchema.virtual('developer', {
    // To fetch from the Developer model
    ref: 'Developer',
    localField: 'devId',
    foreignField: 'devId',
    justOne: true
})

module.exports = mongoose.model("Game", gameSchema)