const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    console.log(data)
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
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){        //expects data array as parameter
    let grid                                                //variable to hold html string defining the grid
    if(data.length > 0){                                    //makes ure array isn't empty
        grid = '<ul id="inv-display">'                      //unordered list element, add to the grid string
        data.forEach(vehicle => {                           //break each element of the data array into a vehicle object
            grid += '<li>'                                  //builds single list element with an anchor that surrounds an img element, then div w/ horizontal rule, header, another anchor w/ make and model of vehicle.  finally span with formatted price is US
            grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
            + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
            + 'details"><img src="' + vehicle.inv_thumbnail 
            +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
            +' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$' 
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })                                                  //close foreach
        grid += '</ul>'                                     //close ul
    } else { 
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'     //if array is empty
    }
    return grid
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

module.exports = Util