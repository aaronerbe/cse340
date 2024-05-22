const utilities = require(".")
    const { body, validationResult } = require("express-validator")     
    const validate = {}
    const invModel = require("../models/inventory-model")

/* **********************************
* Classification Post Validation Rules
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
        .withMessage("Name Must be Alphabetic Characters <br>No Spaces <br>Special Characters")
        .custom(async (classification_name) => {          //custom check as async, arrow function with account_email as parameter
            classification_name = utilities.capitalize(classification_name)
            const classExists = await invModel.checkExistingClass(classification_name)        //call function from model and collect the value returned (0 or 1)
            if (classExists){                                                               //if it exists in the db
                throw new Error("Classification already exists.  Add a new classification")       //error if it does
            }
        }),
    ]
}

/* ******************************
 * Check data for posting to DB else return errors
 * ******************************/
validate.checkClassificationData = async (req, res, next) => {     
    const { classification_name } = req.body   
    let errors = []                         //create empty errors array
    errors = validationResult(req)          //calls express-validator "validationResult" function, sends request obj (with all incoming data) as parameter.  Errors will be stored into the errors array
    if (!errors.isEmpty()) {                //check if errors exist
        let nav = await utilities.getNav()      //build nav bar
        req.flash("notice", `New Category not submitted.  Invalid Entry  <br>Please correct and resubmit`)
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


/* **********************************
* Inventory Post Validation Rules
* ********************************* */
validate.inventoryRules = () => {         
    return [
        //check classification id
        body("classification_id")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min:1})
        .isNumeric()
        .withMessage("Vehicle Classification is required"),
        //check inv_year
        body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 4, max: 4 })
        .isInt({gt: 1000, lt: 9999})
        .withMessage("4 digit year is required"),
        body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min:3})
        .withMessage("Vehicle Make is required <br>Must be at least 3 characters"),
        body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min:3})
        .withMessage("Vehicle Model is required  <br>Must be at least 3 characters"),
        body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min:1})
        .withMessage("Vehicle description is required"),
        //image
        body("inv_image")
        .trim()
        //.escape()  had to remove these cause it's html encoding it in the db
        .notEmpty()
        .isLength({min:1})
        .withMessage("Path to image is required"),
        body("inv_thumbnail")
        .trim()
        //.escape()
        .notEmpty()
        .isLength({min:1})
        .withMessage("Path to thumbnail is required"),
        //check inv_price
        body("inv_price")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ max: 9})
        .isInt()
        .withMessage("Please enter a valid price  <br>No symbols <br>No special characters"),
        //check inv_miles
        body("inv_miles")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1})
        .isInt()
        .withMessage("Mileage is required  <br>No symbols or spaces"),
        body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min:1})
        .withMessage("Vehicle color is required"),
    ]
}

/* ******************************
 * Check data for posting to DB else return errors
 * ******************************/
validate.checkInventoryData = async (req, res, next) => {     
    let errors = []                         //create empty errors array
    errors = validationResult(req)          //calls express-validator "validationResult" function, sends request obj (with all incoming data) as parameter.  Errors will be stored into the errors array
    if (!errors.isEmpty()) {                //check if errors exist
        const { classification_id, inv_year, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body   
        const nav = await utilities.getNav()      //build nav bar
        const classSelect = await utilities.buildClassificationList(classification_id)
        req.flash("notice", `New Inventory not submitted.  Invalid Entry  <br>Please correct and resubmit`)
        res.render("inventory/add-inventory", {        //sends back to render function to rebuild add-classification view
            errors,                             //error array is returned
            title: "Add New Inventory",
            nav,
            classification_id, inv_year, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color,
            classSelect,
    })
    return
    }
    next()
}

//* copying from checkInventoryData.  this is almost identical but modified for the edit/update inventory view
/* ******************************
 * Check data for posting to DB else return errors.  ERRORS TO BE DIRECTED BACK TOTEH "EDIT" (Modify) VIEW
 * ******************************/
validate.checkUpdateData = async (req, res, next) => {     
    let errors = []                         //create empty errors array
    errors = validationResult(req)          //calls express-validator "validationResult" function, sends request obj (with all incoming data) as parameter.  Errors will be stored into the errors array
    if (!errors.isEmpty()) {                //check if errors exist
        const { classification_id, inv_year, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id } = req.body   
        const nav = await utilities.getNav()      //build nav bar
        const classSelect = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`               
        req.flash("notice", `Update to Inventory not submitted.  Invalid Entry  <br>Please correct and resubmit`)
        res.render("inventory/edit-inventory", {        //sends back to render function to rebuild add-classification view
            errors,                             //error array is returned
            title: "Edit " + itemName,
            nav,
            classification_id, inv_year, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id,
            classSelect,
    })
    return
    }
    next()
}

module.exports = validate