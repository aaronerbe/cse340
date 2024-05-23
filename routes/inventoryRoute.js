//Needed Resources
const express = require("express")                                  //Bring express into scope
const router = new express.Router()                                 //Create new router object
const invController = require("../controllers/invController")       //imports the inventory controller into this scope
const utilities = require("../utilities/") 
const invValidate = require('../utilities/inventory-validation')

//! CLASSIFICATION VIEW
//inventory by classification id
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

//! INVENTORY VIEW
//inventory detail by inventory id
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

//! MANAGE INVENTORY VIEW
//Manage Inventory View.  
router.get("/", utilities.handleErrors(invController.buildManagement));
//* DISPLAY (LIST) INVENTORY BASED ON CATEGORY (inventory.js)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

//! EDIT INVENTORY VIEW
//* "MODIFY" INVENTORY FROM MANAGEMENT TABLE
router.get("/edit/:inventory_id", utilities.handleErrors(invController.buildEditInventory))
//* POST UPDATE TO INVENTORY
router.post("/update/", utilities.handleErrors(invController.updateInventory))

//TODO TEAM ASSIGNMENT STEP 1 - step2 goto delete-confirm.ejs
//! DELETE INVENTORY 
router.get('/delete/:inventory_id', utilities.handleErrors(invController.buildDeleteInventory))
router.post("/deleted/", utilities.handleErrors(invController.deleteInventory))

//! ADD CLASSIFICATION VIEW
//Add-classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
//post new classifcation
router.post("/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)    
)
//! ADD INVENTORY VIEW
//Add new inventory
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
//Post new vehicle to inventory
router.post(
    "/add-inventory", 
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)




module.exports = router;    //exports the router

