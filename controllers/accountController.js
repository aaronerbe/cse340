//Required
const utilities = require("../utilities/")                  //bring utils into scope
const accountModel = require("../models/account-model")     //bring account-model into scope
//TODO For Password Hashing Team Activity
const bcrypt = require("bcryptjs")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {     //async, passing in request, response, next params
    let nav = await utilities.getNav()          //retrives and stores the nav bar for use int he view
    res.render("account/login", {               //calls the render function, indicates the view to be returned, opens the object that will carry data to the view
        title: "Login",                         //data to be sent to the view
        nav,                                    //data to be sent to the view
        errors: null
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    })
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {          //async function, pass in req, response as params
    let nav = await utilities.getNav()              //build the nav bar
    const { account_firstname, account_lastname, account_email, account_password } = req.body   //collect/store values from HTML form being sent from the browser in the body of the request object.  ONE MORE STEP TO MAKE THIS WORK TBD - done by installing body-parser (to read the info in a body), then updating server.js to add it as a require statement, then add it as middleware

    // Hash the password before storing
    let hashedPassword      //declare hashPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)        //calls bcrypt and stores resulting hash into hashedPassword.  Accepts txt password & 'saltRounds' value.  saltRounds = integer indicating how many times a hash will be resent through hashing algo.  10 means hashed 10 times
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')   //flash msg if it fails
        res.status(500).render("account/register", {                                    //build reg view if it fails
        title: "Registration",
        nav,
        errors: null,
        })
    }

    const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    //remove account_password and replace w/ hashedPassword
    //account_password
    hashedPassword
    )
    //determine if result was recieved
    if (regResult) {                                        
    //set flash msg to be displayed using object literal
        req.flash(                                              
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        //calls render function to return the login view w/ an HTTP 201 status code for successful insertion of data.  Note it opens login so they can go straight to logging in after registration
        res.status(201).render("account/login", {               
            title: "Login",
            nav,
            errors: null
    })
    }else {
        //flash msg if post failed to updated (insertion)
        req.flash("notice", "Sorry, the registration failed.")  
        //renders the registration page (to try again) and returns a 501 status.  501 = 'not successful' in this case
        res.status(501).render("account/register", {            
            title: "Registration",
            nav,
            errors: null
        })
    }
}

module.exports = { buildLogin, buildRegister, registerAccount }         //exports the function for use