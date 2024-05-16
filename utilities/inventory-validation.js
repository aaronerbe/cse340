const utilities = require(".")
    const { body, validationResult } = require("express-validator")     
    const validate = {}
    const invModel = require("../models/inventory-model")




/* **********************************
* Login Data Validation Rules
* ********************************* */
validate.classificationRules = () => {         
    return [
        //check the classification name matches requirements
        body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min:1})
        .isAlpha()
        .withMessage("Password does not meet requirements.")
        .custom(async (classification_name) => {          //custom check as async, arrow function with account_email as parameter
            const classExists = await invModel.checkExistingClass(classification_name)        //call function from model and collect the value returned (0 or 1)
            if (classExists){                                                               //if it exists in the db
                throw new Error("Classification already exists.  Add a new classification")       //error if it does
            }
        }),
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ******************************/
validate.checkClassificationData = async (req, res, next) => {     
    const { classification_name } = req.body   
    let errors = []                         //create empty errors array
    errors = validationResult(req)          //calls express-validator "validationResult" function, sends request obj (with all incoming data) as parameter.  Errors will be stored into the errors array
    if (!errors.isEmpty()) {                //check if errors exist
        let nav = await utilities.getNav()      //build nav bar
        res.render("inventory/add-classification", {        //sends back to render function to rebuild add-classification view
            errors,                             //error array is returned
            title: "Add New Classification",
            nav,
            classification_name,
    })
    return
    }
    next()
}

module.exports = validate