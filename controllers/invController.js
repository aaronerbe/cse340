const invModel = require("../models/inventory-model")           //bring inventory-model.js into scope, store it's functionality into invModel
const utilities = require("../utilities/")                      //bring utilities into scope (which brings index.js under it into scope)

const invCont = {}                                              //create empty obj

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {                 //async, anoymous function.  accepts request, response objects + Express 'next'
    const classification_id = req.params.classificationId                           //collects classification_id.  req = request object which is sent to server.  params = express function used to represent data that's passed into the URL from client to server.  classification_id = name given to classification_id value in inventoryRoute.js(line7)
    const data = await invModel.getInventoryByClassificationId(classification_id)   //getInventoryByClassificationId in inventory_model.
    const grid = await utilities.buildClassificationGrid(data)                      //utility function to build grid (to be built later).  "Data" array is passed as parameter.  HTML string, containing a grid is returned and stored in grid variable
    let nav = await utilities.getNav()                                              //calls the function to build the nav bar 
    const className = data[0].classification_name                                   //extracts name of classification
    res.render("./inventory/classification", {                                      //Calls Express render function to return a view to broser.  view returned = classification, which is created whthin inventory folder, within the already existing views folder
        title: className + " vehicles",                                             //build 'title' value, not it's dynamic
        nav,                                                                        //nav variable, displays nav bar of the view
        grid,                                                                       //html string, containing the grid of invenotry items
    })
}

module.exports = invCont                                                            //export the invCont