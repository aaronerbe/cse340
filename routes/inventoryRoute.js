//Needed Resources
const express = require("express")                                  //Bring express into scope
const router = new express.Router()                                 //Create new router object
const invController = require("../controllers/invController")       //imports the inventory controller into this scope

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);       //get(route being watched for, function to fulfill the request sent by route)

module.exports = router;    //exports the router

