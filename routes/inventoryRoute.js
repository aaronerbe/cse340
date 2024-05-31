//Needed Resources
const express = require("express")                                  //Bring express into scope
const router = new express.Router()                                 //Create new router object
const invController = require("../controllers/invController")       //imports the inventory controller into this scope
const utilities = require("../utilities/") 
const invValidate = require('../utilities/inventory-validation')
const reviewValidate = require('../utilities/review-validation')

//+ CLASSIFICATION VIEW
//inventory by classification id
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

//+ INVENTORY VIEW WITH ADD REVIEW FORM
//inventory detail by inventory id
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));
router.post("/submit-review/:inventoryId", 
    reviewValidate.reviewRules(),
    utilities.handleErrors(reviewValidate.checkNewReviewTextData),  
    utilities.handleErrors(invController.postNewReview));

//+ MANAGE INVENTORY VIEW
//Manage Inventory View.  
router.get("/", 
    utilities.handleErrors(utilities.checkLogin), 
    utilities.handleErrors(utilities.checkAuthN), 
    utilities.handleErrors(invController.buildManagement)
)
//* DISPLAY (LIST) INVENTORY BASED ON CATEGORY (inventory.js)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

//+ EDIT INVENTORY VIEW
//* "MODIFY" INVENTORY FROM MANAGEMENT TABLE
router.get("/edit/:inventory_id", 
    utilities.handleErrors(utilities.checkLogin), 
    utilities.handleErrors(utilities.checkAuthN), 
    utilities.handleErrors(invController.buildEditInventory)
)
//* POST UPDATE TO INVENTORY
router.post("/update/", 
    utilities.handleErrors(utilities.checkLogin), 
    utilities.handleErrors(utilities.checkAuthN), 
    invValidate.inventoryRules(),
    utilities.handleErrors(invValidate.checkInventoryUpdateData),
    utilities.handleErrors(invController.updateInventory)
)

//+ DELETE INVENTORY 
router.get('/delete/:inventory_id', utilities.handleErrors(invController.buildDeleteInventory))
router.post("/deleted/", 
    utilities.handleErrors(utilities.checkLogin), 
    utilities.handleErrors(utilities.checkAuthN), 
    utilities.handleErrors(invController.deleteInventory)
)

//+ ADD CLASSIFICATION VIEW
//Add-classification view
router.get("/add-classification", 
    utilities.handleErrors(utilities.checkLogin), 
    utilities.handleErrors(utilities.checkAuthN), 
    utilities.handleErrors(invController.buildAddClassification)
)
//post new classifcation
router.post("/add-classification",
    utilities.handleErrors(utilities.checkLogin), 
    utilities.handleErrors(utilities.checkAuthN), 
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)    
)
//+ ADD INVENTORY VIEW
//Add new inventory
router.get("/add-inventory",
    utilities.handleErrors(utilities.checkLogin), 
    utilities.handleErrors(utilities.checkAuthN), 
    utilities.handleErrors(invController.buildAddInventory)
)
//Post new vehicle to inventory
router.post("/add-inventory", 
    utilities.handleErrors(utilities.checkLogin), 
    utilities.handleErrors(utilities.checkAuthN), 
    invValidate.inventoryRules(),
    utilities.handleErrors(invValidate.checkInventoryData),
    utilities.handleErrors(invController.addInventory)
)




module.exports = router;    //exports the router

