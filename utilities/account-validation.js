const utilities = require(".")
    const { body, validationResult } = require("express-validator")     //2 tools, body and validationResult.  body = allow validator to access body object (all the data sent via HTTPRequest).  ValidationResult = object containing all errors detected by validation process.  1st too=access data, 2nd tool = retrieve errors
    const validate = {}

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registationRules = () => {         //anynomous function.  assigned function to registrationRules property of validate object
return [
    // firstname is required and must be string
    body("account_firstname")           //look inside httprequest body for a name-value pair where name=account_firstname.  
    .trim()                             //cleans it up
    .escape()                           //finds special chars and trasnforms to html entity so it's not functional as code (security)
    .notEmpty()                         //validate a value exists
    .isLength({ min: 1 })               //checks there's something there - at least 1 char
    .withMessage("Please provide a first name."), // on error this message is sent..  Default msg would be 'invalid value'

    // lastname is required and must be string
    body("account_lastname")            //see above
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 2 })
    .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body("account_email")           //looks for account_email   
    .trim()                         //similar to above
    .escape()
    .notEmpty()
    .isEmail()                      //checks string for chars that should be present in an email address.
    .normalizeEmail() // refer to validator.js docs     sanitation function that makes email lowercase, alters to 'canonicalize' the email.  
    .withMessage("A valid email is required."),

    // password is required and must be strong password
    body("account_password")
    .trim()
    .notEmpty()
    .isStrongPassword({             //check string to meet requirements for strong pass.  returns boolean.  can have a strength score returned as well
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    .withMessage("Password does not meet requirements."),
]
}


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {                             //async, anonymous function, accepts req, res, next & assigns to checkRegData property of validate obj
    const { account_firstname, account_lastname, account_email } = req.body     //jS Destructuring method.  collects/stores from the request body.  password is NOT stored.  used to repopulate the form if errors are found.  BKM is to have client redo password
    let errors = []                         //create empty errors array
    errors = validationResult(req)          //calls express-validator "validationResult" function, sends request obj (with all incoming data) as parameter.  Errors will be stored into the errors array
    if (!errors.isEmpty()) {                //check if errors exist
        let nav = await utilities.getNav()      //build nav bar
        res.render("account/register", {        //sends back to render function to rebuild registration view
            errors,                             //error array is returned
            title: "Registration",
            nav,
            account_firstname,                  //add these values to rebuild the form w/ them
            account_lastname,
            account_email,
    })
    return
    }
    next()
}

module.exports = validate