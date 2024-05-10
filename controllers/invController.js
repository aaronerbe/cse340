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

/* ***************************
 *  Build details by inventory view
 * ***************************/
invCont.buildByInventoryId = async function (req, res, next) {
    
    //to force an error 500 for the assignment
    //trigger off an inventory_id of 2 (the batmobile)
    if (req.params.inventoryId == 2){
        const forcedError = 5 / 0
        res.render(forcedError)
    }

    const inventory_id = req.params.inventoryId                                     //builds requests command that will be sent to the model.  req object that is sent.  params is an express function that represents the data that was passed in from the client.
    const data = await invModel.getDetailByInventoryId(inventory_id)             //calls getInventoryByInventoryId from model.  sends it the above request object
    const detail = await utilities.buildClassificationDetail(data)                  //utility function to build the details based on Data array.  Will contian html string
    let nav = await utilities.getNav()                                              //calls our util to build the nav bar for the page
    const year = data[0].inv_year                                                //extracts the inventory year
    const make = data[0].inv_make                                                //extracts the inventory make 
    const model = data[0].inv_model                                              //extracts the inventory model
    res.render("./inventory/detail", {
        title: `${year} ${make} ${model}`,                                 //build the title e.g. 1990 Ford Bronco
        nav,                                                                        //build the nav bar
        detail                                                                      //build the details into the view
    })
}


module.exports = invCont                                                            //export the invCont