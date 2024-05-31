const invModel = require("../models/inventory-model")           //bring inventory-model.js into scope, store it's functionality into invModel
const utilities = require("../utilities/")                      //bring utilities into scope (which brings index.js under it into scope)

const invCont = {}                                              //create empty obj


//+ INVENTORY CLASSIFICATION VIEW
/* ***************************
 *  Build inventory by classification view for /inv/type/x
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

//+ INVENTORY DETAIL VIEW
/* ***************************
 *  Build details by inventory view for /inv/detail/x
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
    const account_id = res.locals.accountId
    const data = await invModel.getDetailByInventoryId(inventory_id)             //calls getInventoryByInventoryId from model.  sends it the above request object
    const detail = await utilities.buildClassificationDetail(data)                  //utility function to build the details based on Data array.  Will contian html string
    //+ get & build review data
    const reviewData = await invModel.getReviewsByInventoryId(inventory_id)
    const reviews = await utilities.buildInventoryDetailReviews(reviewData, res.locals.loggedin, res.locals.fName, res.locals.lName, inventory_id, account_id)

    let nav = await utilities.getNav()                                              //calls our util to build the nav bar for the page
    const year = data[0].inv_year                                                //extracts the inventory year
    const make = data[0].inv_make                                                //extracts the inventory make 
    const model = data[0].inv_model                                              //extracts the inventory model
    //req.flash("notice", "This is a flash message.")                               //use this for flash msg.  make sure to add <%- messages() %> to the view page as well to render it
    res.render("./inventory/detail", {
        title: `${year} ${make} ${model}`,                                 //build the title e.g. 1990 Ford Bronco
        nav,                                                                        //build the nav bar
        detail,                                                                      //build the details into the view
        reviews,
        errors: null
    })
}
/* ***************************
 *  POST New Review
 * ***************************/
invCont.postNewReview = async function (req, res, next){
    //let nav = await utilities.getNav()
    const {  
        inv_id,
        account_id,
        username,
        review_text,
        } = req.body
    //const classSelect = await utilities.buildClassificationList()
    //run model function passing in the variables
    const addResult = await invModel.addReview(
        inv_id,
        account_id,
        review_text,
    )
    
    if (addResult){
        req.flash(
            "notice",
            `Thank you for your review!`
        )
        res.redirect(`/inv/detail/${inv_id}`)
    }else{
        req.flash("notice", `Review not submit.  Please try again`)
        res.status(501).redirect(`/inv/detail/${inv_id}`)
    }
}

//+ MANAGEMENT VIEW
/* ***************************
 * Build management page - add classification & inventory for /inv/
 * ***************************/
invCont.buildManagement = async function(req,res){
    const nav = await utilities.getNav()
    const links = await utilities.buildManagementDetail()
    const classSelect = await utilities.buildClassificationList()

    res.render("./inventory/management", {
        title: "Vehicle Management", 
        nav, 
        links,
        classSelect,
        errors: null
    })

}
/* ***************************
 *  Return Inventory by Classification As JSON FOR MANAGEMENT VIEW CLASSIFICATION DROP DOWN
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)    //gets classification_id that's been passed as parameter through the URL.
    const invData = await invModel.getInventoryByClassificationId(classification_id)    //calls the model function
    if (invData[0].inv_id) {    //check for valid value in first element of array
        return res.json(invData)    //return the result set as JSON object
    } else {
        next(new Error("No data returned"))
    }
}

//+ EDIT INVENTORY 'MODIFY' (FROM MANAGEMENT VIEW)
/* ***************************
 *  Modify existing inventory.  Builds 'edit inventory' view
 * ***************************/
invCont.buildEditInventory = async function(req,res,next){
    //approach is collect all the db info I need, then pass to a utility to build the html needed for the form
    //take advantage of existing function used for getNav
    console.log("enter buildEditInventory")
    const nav = await utilities.getNav()
    const inventory_id = parseInt(req.params.inventory_id)
    let data = await invModel.getDetailByInventoryId(inventory_id)    //get inv details.  same as inventory detail view
    data = data[0]                                                      //had to do this to get 1st item in the array
    const inv_id = data.inv_id
    const inv_make = data.inv_make
    const inv_model = data.inv_model
    const inv_year = data.inv_year
    const inv_description = data.inv_description
    const inv_image = data.inv_image
    const inv_thumbnail = data.inv_thumbnail
    const inv_price = data.inv_price
    const inv_miles = data.inv_miles
    const inv_color = data.inv_color
    const classification_id = data.classification_id

    const classSelect = await utilities.buildClassificationList(classification_id)     //modify to pass in classification_id
    const itemName = `${data.inv_make} ${data.inv_model}`               //creating a name to pass back for title/h1

    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName, 
        nav, 
        inventory_id,
        classSelect,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
    })
}
/* ***************************
 *  copied from addInventory UPDATE INVENTORY DATA
 * ***************************/
invCont.updateInventory = async function (req,res,next){
    let nav = await utilities.getNav()
    const {  
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id} = req.body
    //const classSelect = await utilities.buildClassificationList()
    //run model function passing in the variables
    const updateResult = await invModel.updateInventory(
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    )
    const itemName = inv_make + " " + inv_model
    //determine if result was recieved
    if (updateResult){
        req.flash(
            "notice",
            `${itemName} successfully updated`
        )
        res.redirect("/inv/")
    }else{
        const classSelect = await utilities.buildClassificationList(classification_id)
        req.flash("notice", `${itemName} not updated.  Invalid Entry  <br>Please correct and resubmit`)
        res.status(501).redirect(`/inv/edit/${inv_id}`)
    }
}

//+ DELETE INVENTORY (from managmeent view)
/* ***************************
 *  DELETE inventory.  Builds 'delete inventory' view
 * ***************************/
invCont.buildDeleteInventory = async function(req,res,next){
    const nav = await utilities.getNav()
    const inventory_id = parseInt(req.params.inventory_id)
    let data = await invModel.getDetailByInventoryId(inventory_id)    //get inv details.  same as inventory detail view
    data = data[0]                                                      //had to do this to get 1st item in the array
    const inv_id = data.inv_id
    const inv_make = data.inv_make
    const inv_model = data.inv_model
    const inv_year = data.inv_year
    const inv_price = data.inv_price
    const itemName = `${data.inv_make} ${data.inv_model}`        //creating a name to pass back for title/h1
    
    res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName + "!", 
        nav,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_price,
    })
}
/* ***************************
 * DELETE INVENTORY DATA (copied from udpateInventory)
 * ***************************/
invCont.deleteInventory = async function (req,res,next){
    let nav = await utilities.getNav()       
    const inv_id = parseInt(req.body.inv_id)
    //console.log("inventory id = " + inv_id)
    const deleteResult = await invModel.deleteInvModel(inv_id)
    console.log("deleteResult to follow")
    console.table(deleteResult)
    
    const inv_make = req.body.inv_make
    const inv_model = req.body.inv_model
    const itemName = inv_make + " " + inv_model
    
    //determine if result was recieved
    if (deleteResult){
        req.flash(
            "notice",
            `${itemName} successfully deleted`
        )
        res.redirect("/inv/")
    }else{
        req.flash("notice", `${itemName} not deleted.  Please try again.`)
        //? NOT SURE ABOUT THIS...
        res.status(501).redirect(`/delete-confirm/${inv_id}`, {
            title: "Delete " + itemName + "!" ,
            nav, 
            errors: null,
        })
    }
}

//+ ADD NEW CLASSIFICATION VIEW & POST
/* ***************************
 *  Build Add Classification Form Page for /inv/add-classification
 * ***************************/
invCont.buildAddClassification = async function(req,res){
    const nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
        title: "Add New Classification", 
        nav, 
        errors: null
    })
}
/* ***************************
 *  Process & Post Add Classification Page for /inv/add-classification
 * ***************************/
invCont.addClassification = async function (req, res){
    let nav = await utilities.getNav()
    let {classification_name} = req.body
    classification_name = utilities.capitalize(classification_name)
    console.log(classification_name)
    const addClassResult = await invModel.addClassification(classification_name)
    
    //determine if result was recieved
    if (addClassResult){
        nav = await utilities.getNav() //rebuilding the nav bar to reflect the new classification
        const classSelect = await utilities.buildClassificationList()
        const links = await utilities.buildManagementDetail()
        
        req.flash(
            "notice",
            `The ${classification_name} Classification successfully added.`
        )
        res.status(201).render("inventory/management", {
            title: "Vehicle Management",
            nav,
            links,
            classification_name,
            classSelect,
            errors: null
        })
    }
    else {
        req.flash("notice", `${classification_name} is invalid <br>Please provide a correct classification name`)
        res.status(501).render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            classification_name,
            errors: null
        })
    }        
}

//+ ADD NEW INVENTORY VIEW & POST
/* ***************************
 *  Build add-inventory (add vehicle) form view for /inv/add-inventory
 * ***************************/
invCont.buildAddInventory = async function(req,res,next){
    const nav = await utilities.getNav()
    const classSelect = await utilities.buildClassificationList()
    
    res.render("./inventory/add-inventory", {
        title: "Add New Inventory", 
        nav, 
        classSelect,
        errors: null
    })
}
/* ***************************
 *  Process & Post add-inventory (add vehicle) form for /inv/add-inventory
 * ***************************/
invCont.addInventory = async function (req,res,next){
    const nav = await utilities.getNav()
    let classSelect = await utilities.buildClassificationList()
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
            title: "Vehicle Management",
            nav,
            links,
            classSelect,
            errors: null
        })
    }else{
        classSelect = await utilities.buildClassificationList(classification_id)
        req.flash("notice", `New Inventory not submitted.  Invalid Entry  <br>Please correct and resubmit`)
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