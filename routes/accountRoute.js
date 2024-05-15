//Required Resources
const express = require("express")      //Bring express into scope
const router = new express.Router()     //Create new router object
const accountController = require("../controllers/accountController")   //import the account controller
const utilities = require("../utilities/")   //bring utitilies into scope
const regValidate = require('../utilities/account-validation')


//Route needed to build account page
router.get("/login/", utilities.handleErrors(accountController.buildLogin))  
//captures the /login to know we need the login account page.  calls the accountController function.  Included the middleware error handler from the utilities.

//Route for registration view
router.get("/register/", utilities.handleErrors(accountController.buildRegister))
//Route to Post Registration
// Process the registration data
router.post(
    "/register/",
    regValidate.registationRules(),         //function containing rules to be used in validation process
    regValidate.checkRegData,               //call to run validation & handle errors
    utilities.handleErrors(accountController.registerAccount)   //call to controllre to handle registration if no errors
)

//export the route
module.exports = router;