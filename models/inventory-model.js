const pool = require("../database/")


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
//build addClassification model
/* ***************************
 *  Add New Classification to db
 * ***************************/
async function addClassification(classification_name){
  try{
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error){
      return error.message
  }
}

/* ***************************
 *  Add New Inventory to db
 * ************************** */
async function addInventory(classification_id, inv_year, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color){
  try{
    const sql = "INSERT INTO inventory (classification_id, inv_year, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    return await pool.query(sql, [classification_id, inv_year, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color])
  } catch (error){
      return error.message
  }
}

/* **********************
 *   Check for existing Class
 * ********************* */
//checks if the email is already present in the db by returning email.rowCount
//to be added in account-validation.js utility
async function checkExistingClass(classification_name){
  try {
      const sql = "SELECT * FROM classification WHERE classification_name = $1"
      const classification = await pool.query(sql, [classification_name])
      return classification.rowCount
  } catch (error) {
      return error.message
  }
}

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 * Update Inventory to db
 * ************************** */
async function updateInventory(  
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
){
  try{
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getDetailByInventoryId, addClassification, checkExistingClass, addInventory, updateInventory}   //exports these to be used. 



