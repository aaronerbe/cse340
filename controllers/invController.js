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
        errors: null
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
    
    //builds requests command that will be sent to the model.  req object that is sent.  params is an express function that represents the data that was passed in from the client.
    const inventory_id = req.params.inventoryId
    const data = await invModel.getDetailByInventoryId(inventory_id)             //calls getInventoryByInventoryId from model.  sends it the above request object
    const detail = await utilities.buildClassificationDetail(data)                  //utility function to build the details based on Data array.  Will contian html string
    let nav = await utilities.getNav()                                              //calls our util to build the nav bar for the page
    const year = data[0].inv_year                                                //extracts the inventory year
    const make = data[0].inv_make                                                //extracts the inventory make 
    const model = data[0].inv_model                                              //extracts the inventory model
    //req.flash("notice", "This is a flash message.")                               //use this for flash msg.  make sure to add <%- messages() %> to the view page as well to render it
    res.render("./inventory/detail", {
        title: `${year} ${make} ${model}`,                                 //build the title e.g. 1990 Ford Bronco
        nav,                                                                        //build the nav bar
        detail,                                                                      //build the details into the view
        errors: null
    })
}

/* ***************************
 *  Build management page - add classification & inventory
 * ***************************/
invCont.buildManagement = async function(req,res){
    //const data = await invModel.getManagement()   //not needed
    const links = await utilities.buildManagementDetail()
    const nav = await utilities.getNav()

    res.render("./inventory/management", {
        title: "Vehicle Management", 
        nav, 
        links,
        errors: null
    })
}

/* ***************************
 *  Build Add Classification Form Page
 * ***************************/
invCont.buildAddClassification = async function(req,res){

    //const form = await utilities.buildAddClassificationForm()
    const nav = await utilities.getNav()

    res.render("./inventory/add-classification", {
        title: "Add New Classification", 
        nav, 
        errors: null
    })
}
/* ***************************
 *  Process & Post Add Classification Page
 * ***************************/
invCont.addClassification = async function (req, res){
    let nav = await utilities.getNav()
    const {classification_name} = req.body
    
    const addClassResult = await invModel.addClassification(classification_name)

    //determine if result was recieved
    if (addClassResult){
        nav = await utilities.getNav()      //rebuilding the nav bar to reflect the new classification
        req.flash(
            "notice",
            `The ${classification_name} classification has successfully been added.`
        )
        res.status(201).render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            classification_name,
            errors: null
        })
    }
    else {
        req.flash("notice", `${classification_name} is invalid.  Please provide a correct classification name`)
        res.status(501).render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            classification_name,
            errors: null
        })
    }

}

/* ***************************
 *  Build add-inventory (add vehicle) form view
 * ***************************/
invCont.buildAddInventory = async function(req,res,next){
    //approach is collect all the db info I need, then pass to a utility to build the html needed for the form
    //take advantage of existing function used for getNav
    const classSelect = await utilities.buildClassificationList()
    const nav = await utilities.getNav()

    res.render("./inventory/add-inventory", {
        title: "Add New Inventory", 
        nav, 
        classSelect,
        errors: null
    })
}

/* ***************************
 *  Process & Post add-inventory (add vehicle) form
 * ***************************/
invCont.addInventory = async function (req,res,next){
    let classSelect = await utilities.buildClassificationList()
    const nav = await utilities.getNav()
    //collect all the variables from the form (sent via the body)
    let {classification_id, inv_year, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color} = req.body
    //cleanup the variables a bit to ensure make/model is always clean format
    inv_make = utilities.capitalize(inv_make)
    inv_model = utilities.capitalize(inv_model)
    inv_color = utilities.capitalize(inv_color)

    //run model function passing in the variables
    const addInventoryResult = await invModel.addInventory(classification_id, inv_year, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)

    //determine if result was recieved
    if (addInventoryResult){
        const links = await utilities.buildManagementDetail()

        req.flash(
            "notice",
            `${inv_year} ${inv_make} ${inv_model} successfully added`
        )
        res.status(201).render("inventory/management", {
            title: "Add New Inventory",
            nav,
            links,
            errors: null
        })
    }else{
        let classSelect = await utilities.buildClassificationList(classification_id)
        req.flash("notice", `New Inventory not submitted.  Entry is invalid.  Please correct and resubmit`)
        res.status(501).render("inventory/add-inventory", {
            title: "Add New Inventory",
            nav,
            classSelect,
            classification_id, inv_year, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color,
            errors: null
        })
    }
}

module.exports = invCont                 //export the invCont