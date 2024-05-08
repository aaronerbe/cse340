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
const utilities = require("./utilities/") 


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
//app.get("/", baseController.buildHome)
app.get("/", utilities.handleErrors(baseController.buildHome))    //sends utils middleware function to check if promise is successful.  if no, it carries on to baseController.buildHome.  else, it throws and error and passes on via next function

//Inventory routes
app.use("/inv", inventoryRoute)             //app.use = express function telling app to use resources passed in.  /inv = keyword, indicates route w/ this will use this route file to work with inventory-related processes.  "inv" is simply short hand for "inventory".  inventoryRoute = var representing the inventoryRoute.js (see required statements at top).  IN SHORT - any route starting with /inv will be redirected to 'inventoryRoute.js' to find the rest of the route to fill the request
//File Not Found route
app.use(async (req, res, next) => {                                         //express function 
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})  //next function to pass control to next function in process chain.  Object (error object), w/ status msg is sent.  
})


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {                            // app.use is an Express function, accepts default express arrow function for errors
  let nav = await utilities.getNav()                                //builds nav bar for error view
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)   //console statement to show the route and error.
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {                                      //calls error.ejs view in errors folder
    title: err.status || 'Server Error',                            //sets value of 'title' for the view.  uses status code or 'server error' as title if no status code
    message,                                           //sets msg to be displayed
    nav                                                             //sets nav bar
  })
})


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
//app.listen(port, () => {
//  console.log(`app listening on ${host}:${port}`)
//})
