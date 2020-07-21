const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const Admin = require('../models/admin.js')

// Refresh tokens are stored in backend memory
// An unthordox choice but was thoroughly considered
// Admins are not expected to have long sessions
let refreshTokens = []

router.post('/login', (req, res) => {
    Admin.findOne({username: req.body.username})
        .select('username password')
        .exec()
        .then(result => {
            if (result) {
                if (req.body.password === result.password) {
                    const accessToken = jwt.sign({user: result.username}, process.env.JWT_SECRETKEY, {expiresIn: '15m'})
                    const refreshToken = jwt.sign({user: result.username}, process.env.JWT_SECRETKEY)

                    refreshTokens.push(refreshToken)
                    res.status(200).json({
                        message: "Authentication successful",
                        accessToken,
                        refreshToken
                    })
                } else {
                    res.status(401).json({
                        message: "Authorization failed"
                    })
                }
            } else {
                // TODO: To change to 401 in production to avoid providing cues
                // for hacking attempts
                res.status(404).json({
                    message: "Username not found"
                })
            }
        })
        .catch(err => {
            if (err) res.status(500).json({
                message: "Error",
                error: err
            })  
        })

})

router.post('/refresh', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) {
        res.status(401).json({
            message: "Token not received"
        })
        return;
    }
    if (!refreshTokens.includes(refreshToken)) {
        res.status(403).json({
            message: "Token is invalid"
        })
        return;
    }

    try {
        user = jwt.verify(refreshToken, process.env.JWT_SECRETKEY)
        const accessToken = jwt.sign(user, process.env.JWT_SECRETKEY, {expiresIn: '30m'})
        res.status(200).json({accessToken})
    } catch(err) {
        res.status(403).json({
            message: "Token is invalid",
        })
    }
})

router.post('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    console.log(refreshTokens)
    res.status(200).json({
        message: "User logged out. Token deleted."
    })
})

module.exports = router