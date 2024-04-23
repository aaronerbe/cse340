//THIS IS THE APPLICATION SERVER


const express = require("express")

const app = express()

//DEFAULT GET ROUTE
app.get("/", (req, res) => {
    res.send('Welcome home!')
})


//SERVER HOST NAME AND PORT
const HOST = 'localhost'
const PORT = 3000

//LOG STATEMENT TO CONFIRM SERVER OPERATION
app.listen(PORT, () => {
    console.log(`trial app listening on ${HOST}:${PORT}`)
    })
