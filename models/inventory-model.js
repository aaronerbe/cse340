const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {      //async function
  try {                                                                 //try catch block
    const data = await pool.query(                                      //sql query to read inventory and classifcation info using inner join.  $1 = placeholder (replaced by value in the brackets "[]").  Queried using database pool.  
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows                                                    //sends as array of all rows (back to controller)
  } catch (error) {
    console.error("getclassificationsbyid error " + error)              //output error (if any) to console. 
  }
}



module.exports = {getClassifications, getInventoryByClassificationId}   //exports these to be used. 



