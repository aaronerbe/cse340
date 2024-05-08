/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const env = require("dotenv").config()
const app = express()
const expressLayouts = require("express-ejs-layouts")
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout","./layouts/layout")//not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)

//Index route
app.get("/", baseController.buildHome)

//Inventory routes
app.use("/inv", inventoryRoute)             //app.use = express function telling app to use resources passed in.  /inv = keyword, indicates route w/ this will use this route file to work with inventory-related processes.  "inv" is simply short hand for "inventory".  inventoryRoute = var representing the inventoryRoute.js (see required statements at top).  IN SHORT - any route starting with /inv will be redirected to 'inventoryRoute.js' to find the rest of the route to fill the request

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
