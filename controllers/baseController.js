const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
    const nav = await utilities.getNav()
    //adding this line for express msg
    //req.flash("notice", "This is a flash message.")
         //flash msg.  1st param = type. can be anything.  you can write css rules using these classes to style the msg.  2nd param = actual msg to be displayed in view.  Note it's displayed as an unordered list.  
    res.render("index", {title: "Home", nav, errors: null})
}

module.exports = baseController