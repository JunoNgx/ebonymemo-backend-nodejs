const mongoose = require("mongoose")

const gameSchema = mongoose.Schema({
        gameId: {type: String, required: true, unique: true},
        name: {type: String, required: true},
        coverUrl: {type: String, required: false},
        releaseYear: {type: Number, required: true},
        devId: {type: String, required: true},
        ios: {type: String, required: false},
        android: {type: String, required: false},
        other: {type: Boolean, required: false},
        description: {type: String, required: false},
        featured: {type: Boolean, required: false},
        dateAdded: {type: Date}
    }, {
        versionKey: false,
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