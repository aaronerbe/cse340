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

/* ***************************
 *  Get all inventory items and classification_name by inventory_id
 * ***************************/
async function getDetailByInventoryId(inventory_id){  
  try{
    const data = await pool.query(                                      //sql query to get all rows that match the inventory_id (should only be 1)
      `SELECT * FROM public.inventory AS i
      WHERE i.inv_id = $1`,
      [inventory_id]
    )

    return data.rows
  }catch (error){
    console.error("get details by Id Error" + error)
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getDetailByInventoryId}   //exports these to be used. 



