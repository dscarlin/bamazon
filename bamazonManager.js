const mysql = require('mysql');
const cTable = require('console.table')
const inquirer = require('inquirer');
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root', 
    password: 'a1zucena',
    database: 'bamazon'
});

const newLine = "\n"
const tab = "   "
const textGreen = "\u001b[32m"
const textRed = "\u001b[31m"
const textYellow = "\u001b[33m"
const textCyan = "\u001b[36m"
const textPlain = "\u001b[0m"


const choices = [
    'View Products for Sale',
    'View Low Inventory',
    'Adjust Item Inventory',
    'Add New Product',
    'Exit'
]

const actionQuestion =  [{
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: choices
}]
const addMoreQuestions =  [
    {
    type: 'input',
    name: 'selectedItem',
    message: 'For which item_id would you like to adjust the inventory level?',
    },
    {
    type: 'input',
    name: 'adjustedAmount',
    message: 'What is the updated inventory value?',
    }
]
const addNewItemQuestions = [
    {
    type: 'input',
    name: 'name',
    message: 'New product name?',
    },
    {
    type: 'input',
    name: 'department',
    message: 'Department?',
    },
    {
    type: 'input',
    name: 'price',
    message: 'Price?',
    },
    {
    type: 'input',
    name: 'quantity',
    message: 'Stock Quantity?',
    }
]

function askUser(question){
    inquirer.prompt( question ).then((res) => {
        res = (res.action) ? handleAction(res) : handleUpdate(res)
    })
}

function handleAction(res){
        switch (res.action) {
            case 'View Products for Sale':
                listAvialableItems();
                break;
            case 'View Low Inventory':
                listItemsWithCountBelowFive();
                break;
            case 'Adjust Item Inventory':
                adjustInventory();
                break;
            case 'Add New Product':
                addNewProduct();
                break;
            default:
                return connection.end();
                
        }   
};

function handleUpdate(res){
    console.log(5)
    
    if (res.selectedItem)
        adjustItem(res)
    else 
        addItem(res)   
        


};

function adjustItem(res){
    let params = [
        {
            stock_quantity : res.adjustedAmount
        },
        {
            item_id : res.selectedItem
        }
    ];
    let query = 'update products set ? where ?';
    updateDatabase(query, params)
}

function addItem(res){
    let query = 'insert into products (product_name, department_name, price, stock_quantity) values (?,?,?,?)'
    let vals = [res.name, res.department, res.quantity, res.price]
    updateDatabase(query, vals)
}

function listAvialableItems(){
    let query = 'select item_id, product_name, price, stock_quantity, FORMAT(price, 2) as price from products'
    displayResult(query);
}

function listItemsWithCountBelowFive(){
    let query = 'select item_id, product_name, price, stock_quantity, FORMAT(price, 2) as price from products ' +
                'where stock_quantity<5'
    displayResult(query)
}

function adjustInventory(){
    askUser(addMoreQuestions)
}

function addNewProduct(){
    askUser(addNewItemQuestions)
}

function displayResult(query){
    connection.query(
        query,
        (err, res) => {
            
            if (err) throw err;
            if (res.length < 1)
                console.log(newLine + 'There are no products with inventory below 5' + newLine)
            else 
                console.table(newLine + newLine+ 'Bamazon Products',res);
            return askUser(actionQuestion);
        }
    )
}

function updateDatabase(query, params){
   
    connection.query(
        query,
        params,
        (err, res) => {
            if (err) throw err
            console.log(newLine + res.affectedRows + " row(s) affected" + newLine + newLine)
            askUser(actionQuestion) 
        }
    )
}

function beginSession(){
    console.log(
        newLine + newLine + textCyan + 
        'Welcome to the Bamazon Inventory Management System' + 
        newLine + newLine + textPlain);
    askUser(actionQuestion);
}

beginSession();


