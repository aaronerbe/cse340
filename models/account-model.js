const pool = require("../database/")    //pulls in the index.js under /database folder.  this is what controls talking to the db


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
        //declares sql var and query to write the data to the database.  $1, $2, $3, $4 are placeholders pulling the 1st, 2nd, 3rd, 4th variable.  'Client' indicates the 'type' of account being registered.  'RETURNING *' indicates to PostgrSQL server to return values based on the record that was inserted (confirms insertion worked)
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])        //returns the results of the query.  await wiats till the promise has been replaced with data.  
    } catch (error) {                   //close try, open catch.  accepts error variable to stare any errors thrown from the 'try' block
        return error.message            //returns the error message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
//checks if the email is already present in the db by returning email.rowCount
//to be added in account-validation.js utility
async function checkExistingEmail(account_email){
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
    try {
    //create the query to be used, passing in the account_email
    const result = await pool.query(
        'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
        [account_email])
    return result.rows[0]       //sends the first record, from the result set returned by the query, back to where this function is called
    } catch (error) {           
    return new Error("No matching email found")     //error if it fails
    }
}


module.exports = {registerAccount, checkExistingEmail, getAccountByEmail}      