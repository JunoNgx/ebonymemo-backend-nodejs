const jwt = require('jsonwebtoken')
const Admin = require('../models/admin.js')

// Refresh tokens are stored in backend memory
// An unthordox choice but was thoroughly considered
// Admins are not expected to have long sessions
let refreshTokens = []

// Failed attempts are logged to prevent bruteforce
// Logs are only kept in the past 48 hours
let failedLoginAttemptsLog = []
const SEC_FAILED_ATTEMPTS_RECORD_LENGTH = 48 * 60 * 60 * 1000

// Rule: ip address will be temporarily blocked for 2 hours
// if more than 5 attempts have been made in the past 48 hours,
// with the last attempt made less than 2 hours ago
const SEC_THRESHOLD_NO_OF_ATTEMPTS = 7
const SEC_THRESHOLD_LAST_ATTEMPT = 2 * 60 * 60 * 1000

exports.login = (req, res) => {

    Admin.findOne({username: req.body.username})
        .select('username password')
        .exec()
        .then(result => {
            if (result) {
                // Yes, I'm aware that password is currently in plain text
                // As of time of writing, Juno is the only admin.
                // TODO: salt hash passwords and build proper UI for password reset
                if (req.body.password === result.password) {
                    const accessToken = jwt.sign({user: result.username}, process.env.JWT_SECRETKEY, {expiresIn: '1h'})
                    const refreshToken = jwt.sign({user: result.username}, process.env.JWT_SECRETKEY)
                    refreshTokens.push(refreshToken)

                    console.log('Admin successfully logged in: ' + req.body.username)

                    res.status(200).json({
                        message: "Authentication successful",
                        adminId: result.username,
                        accessToken,
                        refreshToken
                    })
                } else {

                    // Record the failed attempt
                    failedLoginAttemptsLog.push({
                        ip: req.clientIp,
                        date: Date.now(),
                        username: req.body.username
                    })
                    console.log('A failed attempt login has been made on the admin account: ' + req.body.username)

                    // Incorrect password
                    // Response messages are ambiguous to dissuade bruteforce attempts
                    res.status(401).json({
                        message: "Authorization failed"
                    })
                }
            } else {
                
                // Record the failed attempt
                failedLoginAttemptsLog.push({
                    ip: req.clientIp,
                    date: Date.now(),
                    username: req.body.username
                })

                // Username not found
                // Response messages are ambiguous to dissuade bruteforce attempts
                res.status(401).json({
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

exports.cleanFailedAttemptsLog = (req, res, next) => {
    failedLoginAttemptsLog = failedLoginAttemptsLog.filter(
        attempt => (Date.now() - attempt.date < SEC_FAILED_ATTEMPTS_RECORD_LENGTH)
    )
    
    console.log('Current log of failed login attempts:')
    console.log(failedLoginAttemptsLog)
    next()
}

exports.validateFailedAttemptsLog = (req, res, next) => {
    const strikeRecord = failedLoginAttemptsLog.filter(attempt => attempt.ip === req.clientIp)
    // console.log(strikeRecord)
    console.log('Login attempted by IP address: ' + req.clientIp)

    if (
            strikeRecord.length >= SEC_THRESHOLD_NO_OF_ATTEMPTS
            && Date.now() - strikeRecord[strikeRecord.length-1].date <= SEC_THRESHOLD_LAST_ATTEMPT
        ) {
        console.log(req.clientIp + 'has been temporarily blocked for multiple failed login attempts')
        res.status(429).json({
            message: "You have been temporarily blocked for too many recent failed attempts to login"
        })
    } else {
        next()
    }
}