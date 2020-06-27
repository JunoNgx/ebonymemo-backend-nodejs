// const http = require ("http")
const app = require("./express/server")
require("dotenv").config()

const PORT = process.env.PORT
// const server = http.createServer(app)

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`)
})