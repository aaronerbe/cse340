const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const Util = {}
//forJWT
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    //console.log(data)
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view for inv/add-classification
* ************************************ */
Util.buildClassificationGrid = async function(data){        //expects data array as parameter
    let grid                                                //variable to hold html string defining the grid
    if(data.length > 0){                                    //makes ure array isn't empty
        grid = '<ul id="inv-display">'                      //unordered list element, add to the grid string
            data.forEach(vehicle => {                           //break each element of the data array into a vehicle object
                grid += '<li>'                                  //builds single list element with an anchor that surrounds an img element, then div w/ horizontal rule, header, another anchor w/ make and model of vehicle.  finally span with formatted price is US
                    grid += '<div class="inv-card">'
                        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
                            + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
                            + ' Details"><img src="' + vehicle.inv_thumbnail 
                            +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
                            +' on CSE Motors" /></a>'
                        grid += '<div class="namePrice">'
                            grid += '<hr />'

                            grid += '<h2>'
                            grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
                                + vehicle.inv_make + ' ' + vehicle.inv_model + ' Details">' 
                                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
                            grid += '</h2>'

                            grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
                        grid += '</div>'
                    grid += '</div>'
                grid += '</li>'
            })                                                  //close foreach
        grid += '</ul>'                                     //close ul
    } else { 
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'     //if array is empty
    }
    return grid
}

/* **************************************
* Build the inventory detail view HTML
* **************************************/
Util.buildClassificationDetail = async function(data){
    let detail
    const make = data[0].inv_make
    const model = data[0].inv_model
    const year = data[0].inv_year
    const desc = data[0].inv_description
    const img = data[0].inv_image
    const thumbnail = data[0].inv_thumbnail
    const price = parseInt(data[0].inv_price).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
    const miles = parseInt(data[0].inv_miles).toLocaleString('en-US')
    const color = data[0].inv_color

    detail = '<div class="detail-container">'

        detail += '<div class=detail-img-card>'
            detail += '<img class="detail-img" src="' + img +'" alt="'+ make + ' ' + model +' on CSE Motors" >'
        detail += '</div>'

        detail += '<div class="detail-info-card">'
            detail += '<div class="detail-info-header"><span class="price-txt"> Our Best Price </span> <span class="price">'+price +'</span></div>'
            
            detail += '<div class="detail-specs">'
                detail += '<div class="detail-specs-miles"> <span>Mileage:</span> ' +miles + '</div>'
                detail += '<div class="detail-specs-color"> <span>Ext. Color:</span> ' +color + '</div>'
            detail += '</div>'
            
        detail += '</div>'

        detail += '<div class="detail-desc">'+desc+'</div>'

    detail += '</div>'
    return detail
}

Util.buildInventoryDetailReviews = async function(reviewData, loggedin, fName, lName, inventory_id, account_id) {
    let reviewList = ''  // Initialize reviewList as an empty string
    reviewList = '<div class="inv-reviews-container reviews-container">'
    reviewList += '<h2 class="subtitle">Customer Reviews</h2>'
    if (reviewData.length > 0) {
        reviewList += '<ul id="inv-reviews">'
        for (const review of reviewData) {
            try {
                // Fetch account data to build username below
                const accountData = await accountModel.getAccountByID(review.account_id)
                const fname = accountData.account_firstname
                const lname = accountData.account_lastname
                const username = fname[0] + lname

                reviewList += '<li>'
                reviewList += '<div class="inv-review-card review-card">'
                reviewList += '<div class="review-content">'
                
                reviewList += '<div class="inv-review-card-text review-card-text">'
                reviewList += `<p><span class="review-username">${username}</span> wrote on ${new Date(review.review_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>`
                reviewList += '<p>' + review.review_text + '</p>'
                reviewList += '</div>'

                reviewList += '</div>'
                reviewList += '</div>'
                reviewList += '</li>'
            } catch (error) {
                console.error(`Error fetching account data for account ID ${review.account_id}:`, error)
            }
        }
        reviewList += '</ul>'
    } else {
        reviewList += '<p class="review-notice">Be the first to review this vehicle</p>'
    }
    reviewList += '</div>'
    reviewList += await Util.buildSubmitReviewForm(loggedin, fName, lName, inventory_id, account_id)
    return reviewList
}


Util.buildSubmitReviewForm = async function(loggedin, fName, lName, inventory_id, account_id){
    let form = ''
    if(loggedin){
        const username = fName[0]+lName
        //todo handle submission of form
        form = `
            
            <div id="submit-new-review-form-container">
                <form class="submit-review-form forms" action="/inv/submit-review/${inventory_id}" method="post"> 
                    <h2 class="subtitle-centered">Submit a New Review</h2>
                    <div class="submit-review-username field">
                        <label for="username">Screen Name:
                            <input type="text" id="username" name="username" placeholder="" title="Screen Name" required pattern="^[A-Za-z]+$"  value="${username}" readonly>
                        </label>
                    </div>
                
                    <div class="submit-review-text field">
                        <label for="review_text">Review:
                            <textarea id="review_text" name="review_text" placeholder="Submit a review of the vehicle" required minlength="1" rows="4"></textarea>
                        </label>
                    </div>
                    <button class="submit-review-button button" type="submit">Submit Review</button>

                    <input type="hidden" name="inv_id" value="${inventory_id}">
                    
                    <input type="hidden" name="account_id" value="${account_id}">

                </form>
            </div>`




    } else{
        form = `<p>You must <a href="/account/login" title="login">login</a> to write a review.</p>`
    }
    return form

}


/* **************************************
* Build the Management view HTML for inv/
* **************************************/
Util.buildManagementDetail = async function(data){
    let links
    const addClassLink = '<a href="../../inv/add-classification/">Add New Classification</a>'
    const addVehicleLink = '<a href="../../inv/add-inventory/">Add New Vehicle</a>'

    links = '<div class="links-container">'
        links += addClassLink
        links += addVehicleLink
    links += '</div>'
    return links
}

//+ Build Review List by User

Util.buildUserReviewList = async function(reviewData) {
    let reviewList = '' 
    reviewList = '<div class="mgmt-reviews-container reviews-container">'
    reviewList += '<h2 class="subtitle">My Reviews</h2>'
    if (reviewData.length > 0) {
        reviewList += '<ol id="mgmt-reviews">'
        for (const review of reviewData) {
            reviewList += '<li>'
            reviewList += '<div class="mgmt-review-card review-card">'
            reviewList += '<div class="review-content">'
            reviewList += '<div class="mgmt-review-card-text review-card-text">'
            reviewList += `<p>${review.review_text} on ${new Date(review.review_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>`
            reviewList += '</div>'
            reviewList += '<div class="review-actions">'
            reviewList += `<a href="/account/edit-review/${review.review_id}">EDIT</a>&nbsp; | &nbsp;<a href="/account/delete-review/${review.review_id}">DELETE</a>`
            reviewList += '</div>'
            reviewList += '</div>'
            reviewList += '</div>'
            reviewList += '</li>'
        }
        reviewList += '</ol>'
    } else {
        reviewList += '<p class="no-reviews">No Reviews Yet</p>'
    }
    reviewList += '</div>'
    return reviewList
}

//+ Build Edit/Delete Form 
Util.buildEditReviewForm = async function(isEdit, review_id, review_date, review_text, account_id, inv_id){
    //todo build this form
    let form = ''
    let action = ""
    let label = ""
    let readonly = ""
    const date = new Date(review_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    //! isEdit = true means edit form view.  Else delete form view
    if(isEdit){
        action = `/account/edit-review/${review_id}`
        label = "Edit"
        readonly = ""
    }else{
        action = `/account/delete-review/${review_id}`
        label = "Delete"
        readonly = "readonly"
    }

        //todo handle submission of form
    form = `
        
        <div id="${label}-review-form-container">
            <form class="${label}-review-form forms" action="${action}" method="post"> 
                <h2 class="subtitle-centered">${label} Review</h2>
                <div class="${label}-review-date field">
                    <label for="date">Date:
                        <input type="text" id="date" name="date" placeholder="" title="Date" required value="${date}" readonly>
                    </label>
                </div>
            
                <div class="${label}-review-text field">
                    <label for="review_text">Review:
                        <textarea id="review_text" name="review_text" placeholder="" required minlength="1" rows="4" ${readonly}>${review_text}</textarea>
                    </label>
                </div>
                <button class="${label}-review-button button" type="submit">${label} Review</button>

                <input type="hidden" name="inv_id" value="${inv_id}">
                
                <input type="hidden" name="account_id" value="${account_id}">

            </form>
        </div>`
    return form

}

/* **************************************
* Build the Add Inventory view for inv/add-inventory
* **************************************/
Util.buildAddInventoryForm = async function(data){
    let links
    const addClassLink = '<a href="../../inv/add-classification/">Add New Classification</a>'
    const addVehicleLink = '<a href="../../inv/add-inventory/">Add New Vehicle</a>'

    links = '<div class="links-container">'
        links += addClassLink
        links += addVehicleLink
    links += '</div>'
    return links
}

/* **************************************
* Build the classification input for add-classification
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()      //use model to go get the classification_names
    let classificationList = '<select name="classification_id" id="classification_id" required>'
        classificationList += "<option value=''>Choose a Classification</option>"
        //iterate through each row of the classification table
        data.rows.forEach((row) => {
            //create an option for each.  the value is the classification_id    
            classificationList += '<option value="' + row.classification_id + '"'
            //checks if the classification_id passed into the function (optional) matches the current row.  if so, mark it as default
            if (classification_id != null && row.classification_id == classification_id){
                classificationList += " selected "
            }
            //adds the classification_name for the user visibility to select
            classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}

/* **************************************
* Utility to Capitalize 1st letter of string
* **************************************/
Util.capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
//Util.handleErrors declares property which is appended to the Util object
//fn => (req, res, next) => arrow function named fn, accepts requests, response, next as params
//Promise.resolve(fn(req, res, next)) - a wrapper that accepts a function as a parameter of the Promise.resolve function.  
//.catch(next) - if an error, then Promis 'fails', error is caught and forwarded to next process in the app chain.
//since it's an error being passed via next, Express Error handler will catch and then build and deliver the error view to the client.  

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {      //see if the cookie exists
        jwt.verify(             //use jsonwebtoken 'verify' function to check validity of token.  
            req.cookies.jwt,    //token from cookie
            process.env.ACCESS_TOKEN_SECRET,    //secret value stored as env variable
            function (err, accountData) {       //callback function
                if (err) {              
                    req.flash("notice","Please log in") 
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                //console.table(accountData)
                res.locals.accountData = accountData 
                res.locals.loggedin = true
                res.locals.fName = accountData.account_firstname
                res.locals.lName = accountData.account_lastname
                res.locals.accountType = accountData.account_type
                res.locals.accountId = accountData.account_id
                next()
            })
    } else {
        res.locals.loggedin = false
        res.locals.fName = ""
        res.locals.lName = ""
        res.locals.accountType = ""
        res.locals.accountId = ""
        next()
    }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {      //check if login flag is set (jwt)
        next()
    } else {
        req.flash("notice", "Please log in.")   //if not, force them to login
        return res.redirect("/account/login")
    }
}


/* ****************************************
 *  Check Authorization
 * ************************************ */
Util.checkAuthN = (req, res, next) => {
    if (res.locals.accountType !== "Admin" && res.locals.accountType !== "Employee") {
        req.flash("notice",`Insufficient Credentials.  Please login with Admin or Employee account`)
        return res.redirect("/account/login")
    }else{
        next()
    }
}

module.exports = Util