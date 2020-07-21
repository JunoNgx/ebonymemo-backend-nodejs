const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = (authHeader)
        ? authHeader.split(' ')[1]
        : null
    
    if (token == null) return res.status(401).json({
        message: "No token found"
    })

    try {
        jwt.verify(token, process.env.JWT_SECRETKEY)
        next()
    } catch(err) {
        res.status(403).json({
            message: "Token is invalid"
        })
    }
}