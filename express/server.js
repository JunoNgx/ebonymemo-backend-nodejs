const express = require('express')
const app = express()
const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv').config()

const gameRoutes = require("../api/routes/games")
const devRoutes = require("../api/routes/devs")

const URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}${process.env.DB_DBHOST}/${process.env.DB_DBNAME}?retryWrites=true&w=majority`
// console.log(URI)
mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true});

// Middlewares
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// // CORS handling
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE')
        return res.status(200).json({})
    }
    next()
})

// Main request handling routes
app.use('/.netlify/functions/server/games', gameRoutes)
app.use('/.netlify/functions/server/devs', devRoutes)

// Handling requests that make past /games and /devs, which are basically errors
app.use((req, res, next) => {
    const error = new Error('Route not found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        message: error.message
    })
})

module.exports = app
module.exports.handler = serverless(app)