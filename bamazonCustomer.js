/**
 * 
 *      bamazonCustomer.js
 * 
 */


var mysql = require("mysql");
var inquirer = require("inquirer");

// setup the connection to the database
var connection = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "root",
        database: "bamazon",
        port: "8889"
    }
);

// connect to the database
connection.connect(function (_err) {
    
    if (_err) throw _err;

    //
    console.log("You have successfully connected!");

    // run the program
    //runStore();
    //decrementItemCount(3, 1);
    askUserWhatToBuy();
    
});

function runStore() {
   
    // display all items listed for sale
    displayItemsForSale();

    // ask user for input
    askUserWhatToBuy();

}

function displayItemsForSale(){

}

function askUserWhatToBuy() {

    var itemID = 0;
    var userQ = [
        // The first should ask them the ID of the product they would like to buy.
        {
            type: "input",
            message: "Please enter in the ID of the item you wish to purchase",
            name: "itemID"
        },
          // The second message should ask how many units of the product they would like to buy.
        {
            type: "input",
            message: "How many units of that item would you like to purchase",
            name: "quantity"
        }
    ];

    inquirer.prompt(userQ).then(function (_inquirerRes) {
        
       
        updateItem(_inquirerRes.itemID, _inquirerRes.quantity);

    });

}

function updateItem(_id, _amount) {
    
     // create sql query string
    var q = "SELECT * FROM products WHERE item_id=?";
   
     // query the database
    connection.query(q, [_id], function (_err, _res) {
        
        if (_err) {
            console.log("there was an error in checkIfItemExists");
            throw _err;
        }

        // if the item exists and the there is enough of the item
        if (_res.length > 0) {
            
            console.log("product found!!");
            decrementItemCount(_id, _amount);
            return 1;
        }
        else {
            //  product wasn't found    
            console.log("product not found");
            return 0;
            
        }
    });
}

function removeItem(_id) {

    // create sql query string
    var deleteQ = "DELETE FROM products WHERE item_id=?";
   
     // query the database
    connection.query(deleteQ, [_id], function (_err, _res) {
        
        // if there is an error report it and leave the program
        if (_err) {
            console.log("there was an error in checkIfItemExists");
            throw _err;
        }

        console.log(`item ${_id} removed!`);
    });
}

function decrementItemCount(_id, _amount) {

       // update the the items count
    // create sql query strings
    var quantityQS = "SELECT stock_quantity, price FROM products WHERE item_id=?"; 
    var updateQS = "UPDATE products SET stock_quantity=? WHERE item_id=?";
    var itemCount = 0;
    var price = 0.0;

    // query the database
    connection.query(quantityQS, _id, function (_err, _res) {
        
        // if there is an error report it and leave the program
        if (_err) throw _err;

       // get the number of items in stock
        itemCount = _res[0].stock_quantity;
        price = _res[0].price;
        // make sure they can buy that much
        if (_amount > itemCount) {
            console.log("Not enough of that item!");

            // re ask the user the questions
            runStore();
            return;
        }


        connection.query(updateQS, [itemCount - _amount, _id], function (_err, _res) {
            
            // if there is an error report it and leave the program
            if (_err) throw _err;

            console.log("update successful");
            console.log("The total cost was: " + price * _amount);

            // if they bought all of the items
            if (itemCount - _amount == 0) {
                
                // remove the item
                removeItem(_id);
            }
        });


    });
         
}

