//Needed Resources
const express = require("express")                                  //Bring express into scope
const router = new express.Router()                                 //Create new router object
const invController = require("../controllers/invController")       //imports the inventory controller into this scope
const utilities = require("../utilities/") 



//Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));       //get(route being watched for, function to fulfill the request sent by route)

//Route to build detail view based on inventory id
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));                 //triggers off /detail/{inventoryID} and sends inventoryId to invController buildByInventoryId function


module.exports = router;    //exports the router

