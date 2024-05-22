'use strict' 

// Get a list to show items in inventory based on given classification_id 
let classificationList = document.querySelector("#classification_id")  //finds classification List
classificationList.addEventListener("change", function () {         //attaches evenlistener for any change
    let classification_id = classificationList.value        //capture new value when selected
    console.log(`classification_id is: ${classification_id}`) 
    let classIdURL = "/inv/getInventory/"+classification_id     //url passed to request inventory data from controller.  
    fetch(classIdURL)   //modern ajax request
        .then(function (response) {     //waits for data from fetch, 'then' runs this
            if (response.ok) {          //if successful return
                return response.json();     //convert to js object, then pass on in next
            } 
            throw Error("Network response was not OK");     //err
        }) 
        .then(function (data) {         //grabs response.json() object from above, passes it as parameter into anonymous function
            console.log(data);      
            buildInventoryList(data);      //sends the js object to new function that will parse data into HTML table elements and inject them into the inventory management view
        }) 
        .catch(function (error) {   //error catch
            console.log('There was a problem: ', error.message) 
        }) 
})

// Build inventory items into HTML table components and inject into DOM 
function buildInventoryList(data) { 
    let inventoryDisplay = document.getElementById("inventoryDisplay"); 
    // Set up the table labels 
    let dataTable = '<thead>'; 
    dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
    dataTable += '</thead>'; 
    // Set up the table body 
    dataTable += '<tbody>'; 
    // Iterate over all vehicles in the array and put each in a row 
    data.forEach(function (element) { 
        console.log(element.inv_id + ", " + element.inv_model); 
        dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`; 
        dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`; 
        dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`; 
    }) 
    dataTable += '</tbody>'; 
    // Display the contents in the Inventory Management view 
    inventoryDisplay.innerHTML = dataTable; 
}