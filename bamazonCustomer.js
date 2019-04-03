/**
 * 
 *      bamazonCustomer.js
 * 
 */


var mysql = require("mysql");
var inquirer = require("inquirer");
var messages = [];
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
    runStore();

});

function runStore() {
    // display items
    var dispItemsQS = "SELECT * FROM products";

    connection.query(dispItemsQS, function (_err, _res) {

        if (_err) throw _err;

        // display all the items the user can purchase
        console.log("\n-----------------------------------------------");
        for (var i = 0; i < _res.length; ++i) {

            console.log("item ID:\t\t" + _res[i].item_id);
            console.log("product name:\t\t" + _res[i].product_name);
            console.log("department name:\t" + _res[i].department_name);
            console.log("product price:\t\t$" + _res[i].price);
            console.log("product quantity:\t" + _res[i].stock_quantity);
            console.log("-----------------------------------------------");
        }

        // display any messages from previous inputs
        displayMessages();

        // ask user for input
        askUserWhatToBuy();
    });
}

function askUserWhatToBuy() {

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

        // update the database based on user input
        updateItem(_inquirerRes.itemID, _inquirerRes.quantity);

    });

}

function updateItem(_id, _amount) {

    // create sql query string
    var checkIfItemExistsQS = "SELECT * FROM products WHERE item_id=?";

    // query the database
    connection.query(checkIfItemExistsQS, [_id], function (_err, _res) {

        if (_err) {
            console.log("there was an error in checkIfItemExists");
            throw _err;
        }

        // if the item exists and the there is enough of the item
        if (_res.length > 0) {

            //console.log("product found!!");
            //addMessage("We have that !!");
            decrementItemCount(_id, _amount);
            return 1;
        }
        else {
            //  product wasn't found    
            //console.log("product not found");
            addMessage("product not found");
            return 0;

        }
    });
}

function addMessage(_str) {
    messages.push(_str);
}
function displayMessages() {
    for (var i = 0; i < messages.length; ++i){
        console.log(messages[i]);
    }
    while (messages.length != 0) {
        messages.pop();
    }
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

        //console.log(`item ${_id} removed!`);
        addMessage(`item ${_id} is out of stock, it has been removed!`);
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
            //console.log("Not enough of that item!");
            addMessage("Not enough of that item!");
            // re ask the user the questions
            runStore();
            return;
        }


        connection.query(updateQS, [itemCount - _amount, _id], function (_err, _res) {

            // if there is an error report it and leave the program
            if (_err) throw _err;

            addMessage("Your purchase was successful.");
            addMessage("The total cost was: $ " + price * _amount);
            // if they bought all of the items
            if (itemCount - _amount == 0) {

                // remove the item
                removeItem(_id);
                runStore();
                return;
            }
            runStore();
        });


    });

}

