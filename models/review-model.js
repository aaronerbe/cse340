const pool = require("../database/")


/* ***************************
 *  Add New Review
 * ***************************/
async function addReview(inv_id, account_id, review_text){
    try{
      const sql = "INSERT INTO review (inv_id, account_id, review_text) VALUES ($1, $2, $3) RETURNING *"
    return await pool.query(sql, [inv_id, account_id, review_text])
    } catch (error){
        return error.message
    }
}

/* ***************************
 *  Get reviews by inventory_id
 * ***************************/
async function getReviewsByInventoryId(inventory_id){  
    try{
        //const data = await pool.query(
        //    `SELECT * FROM review AS r
        //    WHERE r.inv_id = $1`,[inventory_id]
        const data = await pool.query(
            `SELECT * FROM review AS r
                WHERE r.inv_id = $1
                ORDER BY r.review_date DESC`, [inventory_id]
    )

    return data.rows
    }catch (error){
    console.error("get reviews by Id Error" + error)
    }
}


/* ***************************
 *  Get reviews by account_id
 * ***************************/
async function getReviewsByAccountId(account_id){  
    try{
    const data = await pool.query(
        `SELECT * FROM review AS r
        WHERE r.account_id = $1
        ORDER BY r.review_date DESC`,[account_id]
    )
    return data.rows
    }catch (error){
    console.error("get reviews by Account Error " + error)
    }
}

/* ***************************
 *  Get reviews by review_id
 * ***************************/
async function getReviewByReviewId(review_id){  
    try{
    const data = await pool.query(
        `SELECT * FROM review AS r
        WHERE r.review_id = $1`,[review_id]
    )
    return data.rows[0]
    }catch (error){
    console.error("get review by Id Error" + error)
    }
}

/* *****************************
* Update review data
* ***************************** */
async function updateReview (
    review_text,
    review_id,
    account_id,
) {
    try {
    const sql = 
        "UPDATE public.review SET review_text = $1 WHERE review_id = $2 AND account_id = $3 RETURNING *"
    const data = await pool.query(sql, [
        review_text,
        review_id,
        account_id,
    ])
    return data.rows[0]
    } catch (error) {
        console.error("model error: " + error)
        return new Error("Can not update review")
    }
}

/* *****************************
* Delete review data
* ***************************** */
async function deleteReview(review_id, account_id) {
    console.log("in model")
    console.log("review_id: " + review_id)
    console.log("account_id: " + account_id)

    review_id = parseInt(review_id)
    account_id = parseInt(account_id)

    console.log("review_id: " + review_id)
    console.log("account_id: " + account_id)
    try {
        const sql = 'DELETE FROM review WHERE review_id = $1 AND account_id = $2 RETURNING *';
        const data = await pool.query(sql, [
            review_id,
            account_id,
        ]);
        return data.rows[0];
    } catch (error) {
        console.error("model error: " + error);
        throw new Error("Can not delete review. Check permissions");
    }
}


module.exports = {getReviewsByInventoryId, addReview, getReviewsByAccountId, getReviewByReviewId, updateReview, deleteReview}   