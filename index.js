const app = require("./express/server")
require("dotenv").config()

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`)
})