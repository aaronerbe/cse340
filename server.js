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
//routes
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
//controllers
const baseController = require("./controllers/baseController")
//utilities
const utilities = require("./utilities/") 
//Adding session and access to the db (packages were installed using: pnpm add express-session connect-pg-simple express-messages connect-flash)
const session = require("express-session")
const pool = require('./database')
//adding body-parser so it knows how to read the body info with post
const bodyParser = require("body-parser")
//for JWT usage
const cookieParser = require("cookie-parser")


//This is added for session capability.  specifically setting up the express-session
/* ***********************
 * Middleware
 * ************************/
app.use(session({                                         //app.use function.  indicates the session is to be applied.  app.use() applies whatever is involked through the entire app
  store: new (require('connect-pg-simple')(session))({    //store = where session data is stored.  create a new session table in postgreSQL db using "connect-pg-simple" package.
    createTableIfMissing: true,                           //create 'session' table if not already there
    pool,                                                 //uses our db connection pool to interact w/ the db server
  }),                                                     //closes config data object & the 'new' session store creation function
  secret: process.env.SESSION_SECRET,                     //a secret name-value pair used to protect the session.  Created in the .env file
  resave: true,                                           //normally set to false but set to true to enable 'flash' messages since we need to resave the session table after each msg
  saveUninitialized: true,                                //important for creation process
  name: 'sessionId',                                      //name we are assigning to the unique 'id' that is created for each session..  The session id is stored into a cookie and passed back and forth from browser to server to track the session
}))

//testing creating a message middleware for the session.  next step is to setup the view for the message in the index.ejs in views folder
// Express Messages Middleware
app.use(require('connect-flash')())                             //requires connect-flash package.  
app.use(function(req, res, next){                               //applied and function is passed in as a parameter
  res.locals.messages = require('express-messages')(req, res)   //express-messages package is required as a function.  Function accepts request, response objects as params.  Functionality is assigned to the response object using the 'locals' option and a name of 'messages'.  Allows any message to be stored into the response, making it avaiable in a view.  
      //note the msg lives in the controller
  next()                                                        //calls next() function, passing control to the next piece of middleware.  allos msg to be set, then pass on to the next process.
})

//Adding Body Parser Middleware
app.use(bodyParser.json())                          //tells express app to use body parser to work with JSON data (to be used later)
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded.  Tells express app to read/work with data sent via URL as well as from form, stored in request object's body.  "extended: true" object = config that allows Rich objects and arrays to be parsed.  

//For JWT usage
app.use(cookieParser())
app.use(utilities.checkJWTToken)

//!Assignement 5





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

//Inventory * Detail routes
app.use("/inv", inventoryRoute)             //app.use = express function telling app to use resources passed in.  /inv = keyword, indicates route w/ this will use this route file to work with inventory-related processes.  "inv" is simply short hand for "inventory".  inventoryRoute = var representing the inventoryRoute.js (see required statements at top).  IN SHORT - any route starting with /inv will be redirected to 'inventoryRoute.js' to find the rest of the route to fill the request

//Account routes
app.use("/account", accountRoute)         //triggers off /account and sends it to accountRoute.js


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
  if(err.status == 404)
    { message = err.message + " " + err.status} 
  else 
    {message = 'Oh no! There was a crash. Maybe try a different route? <br> If you are trying to get to the Batmobile, this error is intentional and exists in the invController' + " " + err.status}
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
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
