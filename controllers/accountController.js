//Required
const utilities = require("../utilities/")                  //bring utils into scope
const accountModel = require("../models/account-model")     //bring account-model into scope


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

    const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
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