const pool = require("../database/")    //pulls in the index.js under /database folder.  this is what controls talking to the db


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"                                                //declares sql var and query to write the data to the database.  $1, $2, $3, $4 are placeholders pulling the 1st, 2nd, 3rd, 4th variable.  'Client' indicates the 'type' of account being registered.  'RETURNING *' indicates to PostgrSQL server to return values based on the record that was inserted (confirms insertion worked)
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])        //returns the results of the query.  await wiats till the promise has been replaced with data.  
    } catch (error) {                   //close try, open catch.  accepts error variable to stare any errors thrown from the 'try' block
        return error.message            //returns the error message
    }
}

module.exports = {registerAccount}      