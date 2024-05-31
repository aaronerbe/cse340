//Required Resources
const express = require("express")      //Bring express into scope
const router = new express.Router()     //Create new router object
const accountController = require("../controllers/accountController")   //import the account controller
const utilities = require("../utilities/")   //bring utitilies into scope
const regValidate = require('../utilities/account-validation')


//Route needed to build account page
router.get("/login/", utilities.handleErrors(accountController.buildLogin))  
//captures the /login to know we need the login account page.  calls the accountController function.  Included the middleware error handler from the utilities.

// Route to Post the login attempt for /login
router.post("/login",       //keys off /login
    regValidate.loginRules(), 
    utilities.handleErrors(regValidate.checkLoginData),
    utilities.handleErrors(accountController.accountLogin)
)

//default view for successful login (account management view)  /management
//router.get("/", utilities.handleErrors(accountController.buildManagement))  
//adding checklogin utility to see if they're already logged in
router.get("/", 
    utilities.handleErrors(utilities.checkJWTToken),
    utilities.handleErrors(accountController.buildManagement))

//+ Routes for Edit and Delete Reviews from Management Page
//+ EDIT
//todo need to build controllers for all of these
//todo not sure checklogin and check authn are required
//todo need to add validation to these
router.get("/edit-review/:review_id",
    utilities.handleErrors(utilities.checkLogin),
    utilities.handleErrors(utilities.checkAuthN),
    utilities.handleErrors((req, res, next) => accountController.buildEditReview(req, res, next, true))
)
router.post("/edit-review/:review_id",
    utilities.handleErrors(utilities.checkLogin),
    utilities.handleErrors(utilities.checkAuthN),
    utilities.handleErrors(accountController.editReview)
)
//+ DELETE
router.get("/delete-review/:review_id",
    utilities.handleErrors(utilities.checkLogin),
    utilities.handleErrors(utilities.checkAuthN),
    utilities.handleErrors((req, res, next) => accountController.buildEditReview(req, res, next, false)))
router.post("/delete-review/:review_id",
    utilities.handleErrors(utilities.checkLogin),
    utilities.handleErrors(utilities.checkAuthN),
    utilities.handleErrors(accountController.deleteReview)
)



//Route for registration view
router.get("/register/", utilities.handleErrors(accountController.buildRegister))
// Process the registration data
router.post("/register/",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

//Route for updating account information
router.get("/update/:account_id", 
    utilities.handleErrors(accountController.updateAccountView))

router.post("/update-account/:account_id",
    regValidate.UpdateRules(), 
    utilities.handleErrors(regValidate.checkUpdateData),
    utilities.handleErrors(accountController.updateAccount)
)

router.post("/update-password/:account_id",
    regValidate.UpdatePasswordRules(),
    utilities.handleErrors(regValidate.checkUpdateData),
    utilities.handleErrors(accountController.updatePassword)
)

router.get("/logout", utilities.handleErrors(accountController.logout))

//export the route
module.exports = router;