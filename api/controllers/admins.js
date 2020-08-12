const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Admin = require('../models/admin.js')

// Refresh tokens are stored in backend memory
// An unthordox choice but was thoroughly considered
// Admins are not expected to have long sessions
var refreshTokens = []

exports.login = (req, res) => {
    console.log(req.body);

    Admin.findOne({username: req.body.username})
        .select('username password')
        .exec()
        .then(result => {
            if (result) {
                console.log('here')
                // Yes, I'm aware that password is currently in plain text
                // This site is currently not customer facing
                if (req.body.password === result.password) {
                    const accessToken = jwt.sign({user: result.username}, process.env.JWT_SECRETKEY, {expiresIn: '1h'})
                    const refreshToken = jwt.sign({user: result.username}, process.env.JWT_SECRETKEY)

                    refreshTokens.push(refreshToken)
                    res.status(200).json({
                        message: "Authentication successful",
                        adminId: result.username,
                        accessToken,
                        refreshToken
                    })
                } else {
                    res.status(401).json({
                        message: "Authorization failed"
                    })
                }
            } else {
                res.status(404).json({
                    message: "Authorization failed"
                })
            }
        })
        .catch(err => {
            if (err) res.status(500).json({
                message: "Error",
                error: err
            })  
        })


    }

exports.refresh = (req, res) => {
    const refreshToken = req.body.refreshToken
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
        const accessToken = jwt.sign(user, process.env.JWT_SECRETKEY, {expiresIn: '1h'})
        res.status(200).json({accessToken})
    } catch(err) {
        res.status(403).json({
            message: "Token is invalid",
        })
    }
}

exports.logout = (req, res) => {
    if (!req.body.refreshToken) {
        res.status(400).json({
            message: "No token received."
        })
        return
    }
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    console.log(refreshTokens)
    res.status(200).json({
        message: "User logged out. Token deleted."
    })
}