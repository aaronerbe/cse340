const utilities = require(".")
const { body, validationResult } = require("express-validator")     
const validate = {}
//const invModel = require("../models/inventory-model")


/* **********************************
* Classification Post Validation Rules
* ********************************* */
validate.reviewRules = () => {         
    return [
        //check the classification name matches requirements
        body("review_text")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min:1})
        .withMessage("Must be Alphanumeric Characters and Not Empty"),
    ]
}

/* ******************************
 * Check review_text for New Reviews
 * ******************************/
validate.checkNewReviewTextData = async (req, res, next) => {     
    const { inv_id } = req.body   
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        //let nav = await utilities.getNav()
        req.flash("notice", `Review not submitted.  <br>Must be Alphanumeric Characters and Not Empty <br>Please correct and resubmit`)
        res.redirect(`/inv/detail/${inv_id}`)
    return
    }
    next()
}

/* ******************************
 * Check review_text for Edit Reviews
 * ******************************/
validate.checkEditReviewTextData = async (req, res, next) => {     
    const { review_id } = req.body   
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        //let nav = await utilities.getNav()
        req.flash("notice", `Review not submitted.  <br>Must be Alphanumeric Characters and Not Empty <br>Please correct and resubmit`)
        res.redirect(`/account/edit-review/${review_id}`)
    return
    }
    next()
}

module.exports = validate