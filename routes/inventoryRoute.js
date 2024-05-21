//Needed Resources
const express = require("express")                                  //Bring express into scope
const router = new express.Router()                                 //Create new router object
const invController = require("../controllers/invController")       //imports the inventory controller into this scope
const utilities = require("../utilities/") 
const invValidate = require('../utilities/inventory-validation')


//Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));       //get(route being watched for, function to fulfill the request sent by route)

//Route to build detail view based on inventory id
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));                 //triggers off /detail/{inventoryID} and sends inventoryId to invController buildByInventoryId function

//Route to Management View.  
router.get("/", utilities.handleErrors(invController.buildManagement));

//Route to add-classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
//Route to post new classifcation
router.post(
    "/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)    
)


//Route to create add inventory form view (for adding vehicle)
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
//TODO
//Route to post new vehicle from the add-inventory form
router.post(
    "/add-inventory", 
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory))


//route that workds with the URL in the inventory.js.
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))


module.exports = router;    //exports the router

