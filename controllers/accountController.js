//Required
const utilities = require("../utilities/")
const accountModel = require("../models/account-model") 
const reviewModel = require("../models/review-model")
const bcrypt = require("bcryptjs")
//adding for jwt capability - missing from instructions but I think this will work
const jwt = require('jsonwebtoken')
require("dotenv").config()

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
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body 

    // Hash the password before storing
    let hashedPassword      //declare hashPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)        //calls bcrypt and stores resulting hash into hashedPassword.  Accepts txt password & 'saltRounds' value.  saltRounds = integer indicating how many times a hash will be resent through hashing algo.  10 means hashed 10 times
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')   //flash msg if it fails
        res.status(500).render("account/register", {                                    //build reg view if it fails
        title: "Register",
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
            title: "Register",
            nav,
            errors: null
        })
    }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()              //builds nav bar
    const { account_email, account_password } = req.body       //collects variables from request body
    console.log('running model')
    const accountData = await accountModel.getAccountByEmail(account_email)     //makes call to model-based function to locate data associated w/ an existing email (to be built).  Returned data, if any, is stored into 'accountData' variable
    console.log('finished model')
    if (!accountData) {     //check if data was returned
        //set message if nothing returned (so no matching creds)
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,      //sticky email
        })
    return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {     //uses bcrypt.compare function to take incoming, plain text password & hashed password from db and compare them to see if they match.  Plain text is hashed using same algo and secret used w/ original password.  Returns TRUE or FALSE
            delete accountData.account_password         //if matching, then js delete function is used to remove the hashed password from accountData array.  Removes it so this can be added to the jwt sent back to client - no password sent back
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })     //Create a JWT token.  AccountData is inserted as payload.  Secret is read from .env.  When ready, it's stored into 'accessToken' variable.  NOTE expiration is set in seconds (60s x 60min = 3600s).  So life of 1 hr in seconds.
            if(process.env.NODE_ENV === 'development') {        //Check if we are in dev environment.  If TRUE - set cookie named 'jwt' with set options
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } 
            else {  //else, we are prodution.  Forces secure (HTTPS) transfer of cookie.  
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect(`/account/`)    
        }
    } catch (error) {
        return new Error('Access Forbidden')    //if an error, set the error msg for error handler.  
    }
}

/* ****************************************
*  Deliver account management view (on successful login)
* *************************************** */
async function buildManagement(req, res, next) {     
    let nav = await utilities.getNav()         
    const account_id = res.locals.accountId
    const reviewData = await reviewModel.getReviewsByAccountId(parseInt(account_id))
    const reviews = await utilities.buildUserReviewList(reviewData)

    res.render("account/management", {
        title: "Account Management",
        nav,
        reviews,
        errors: null
    })
}

/* ****************************************
*  Deliver update account
* *************************************** */
async function updateAccountView(req, res, next) {   
    account_id = req.params.account_id
    console.log(account_id)  
    const {account_firstname, account_lastname, account_email, account_type} = await accountModel.getAccountByID(account_id)
    let nav = await utilities.getNav()
    res.render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        account_type
    })
}

async function updateAccount(req,res, nest){
    const nav = await utilities.getNav()
    const {
        account_firstname,
        account_lastname,
        account_email,
        account_id,
    } = req.body
    const updateResult = await accountModel.updateAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_id,
    )
    if (updateResult){
        req.flash(
            "notice",
            "Account Successfully Update"
        )
        res.redirect("/account/")
    }else{
        req.flash(
            "notice",
            "Failed to update!  Check entries and try again"
        )
        res.status(501).render("/account/update",{
            title: "Update Account",
            nav,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
            errors: null
        })
    }
}

async function updatePassword(req,res, nest){
    const nav = await utilities.getNav()
    const {
        account_firstname,
        account_lastname,
        account_email,
        account_id,
        account_password
    } = req.body

    let hashedPassword      //declare hashPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)        //calls bcrypt and stores resulting hash into hashedPassword.  Accepts txt password & 'saltRounds' value.  saltRounds = integer indicating how many times a hash will be resent through hashing algo.  10 means hashed 10 times
    } catch (error) {
        res.status(501).render("/account/update",{
            title: "Update Account",
            nav,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
            errors: null
        })
    }

    const updateResult = await accountModel.updatePassword(
        account_id,
        hashedPassword
    )
    if (updateResult){
        req.flash(
            "notice",
            "Account Successfully Update"
        )
        res.redirect("/account/")
    }else{
        req.flash(
            "notice",
            "Failed to update!  Check entries and try again"
        )
        res.status(501).render("/account/update",{
            title: "Update Account",
            nav,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
            errors: null
        })
    }
}

async function logout(req, res, next){
    res.clearCookie("jwt")
    req.flash(
        "notice",
        "Successfully logged out"
    )
    res.redirect("/")
}

/* ****************************************
*  REVIEW EDIT/DELETE
* *************************************** */
//+EDIT
async function buildEditReview(req, res, next, isEdit=true){
    //todo copied from inventory build update inv
    //todo need to get inv_id.
    //! note isEdit determines if this is for an Edit or Delete view
    const nav = await utilities.getNav()
    const review_id = parseInt(req.params.review_id)
    let data = await reviewModel.getReviewByReviewId(review_id)
    const review_text = data.review_text
    const review_date = data.review_date
    const account_id = data.account_id
    const inv_id = data.inv_id
    const userId = res.locals.accountId

    if (account_id === userId){  //double check the user is the owner of the review
        const reviewDetails = await utilities.buildEditReviewForm(
            isEdit, 
            review_id, 
            review_date, 
            review_text, 
            account_id, 
            inv_id)  //send isEdit boolean
        
        //todo customize the title for the action edit or delete...
        res.render("./account/edit-review",{
            title: "Edit Review",
            nav,
            reviewDetails,
            errors: null,
    })

    }else{
        req.flash("notice", "Insufficient perimissions to edit this review")
        res.redirect("/account/")
    }


}

//+POST EDIT UPDATE
async function editReview(req, res, next){
    const nav = await utilities.getNav()
    const review_id = req.params.review_id
    const {
        review_text,
        account_id,
    } = req.body
    const updateReview = await reviewModel.updateReview(
        review_text,
        review_id,
        account_id,
    )
    if (updateReview){
        req.flash(
            "notice",
            "Review Successfully Update"
        )
        console.log("SUCCESSFULL UPDATE")
        res.redirect(`/account/`)
    }else{
        req.flash(
            "notice",
            "Failed to update!  Please try again"
        )
        res.status(501).redirect(`/account/edit-review/${review_id}`)
    }
}
//+ DELETE REVIEW
async function deleteReview(req, res, next){
    const review_id = req.params.review_id;
    const {
        review_text,
        account_id
    } = req.body;

    console.log("review_id: " + review_id);
    console.log("review_text: " + review_text);
    console.log("account_id: " + account_id);

    const deleteResult = await reviewModel.deleteReview(
        review_id,
        account_id
    );

    console.table("deleteResult: " + deleteResult)

    if (deleteResult){
        req.flash(
            "notice",
            "Review Successfully Deleted"
        );
        res.redirect(`/account/`);
    } else {
        req.flash(
            "notice",
            "Failed to delete! Check permissions and try again"
        );
        res.status(501).redirect(`/account/delete-review/${review_id}`);
    }
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, updateAccountView, updateAccount, updatePassword, logout, buildEditReview, editReview, deleteReview}         //exports the function for use