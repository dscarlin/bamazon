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
const textCyan = "\u001b[36m"
const textPlain = "\u001b[0m"

const choices = [
    'View Product Sales by Department',
    'Create New Department',
    'Exit'
]

const actionQuestion =  [{
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: choices
}]

const addNewDeptQuestions = [
    {
    type: 'input',
    name: 'name',
    message: 'New department name?',
    },
    {
    type: 'input',
    name: 'overhead',
    message: 'Overhead costs?',
    }
]

function beginSession(){
    console.log(
        newLine + newLine + textCyan + 
        'Welcome to the Bamazon Inventory Management System' + 
        newLine + newLine + textPlain);
    askUser(actionQuestion);
}

function askUser(question){
    inquirer.prompt( question ).then((res) => handleAction(res))
}

function handleAction(res){
    if(res.hasOwnProperty('action')){
        switch (res.action) {
            case 'View Product Sales by Department':
                viewSalesByDept();
                break;
            case 'Create New Department':
                createDept();
                break;
            default:
                return connection.end();      
        }   
    }
    else
        handleUpdate(res)
};

function viewSalesByDept(){
                    //select fields to display
    let query = 'select departments.department_id department_id, products.department_name department_name, ' +
                    //aggregate any columns not in the group by statement
                'format(departments.over_head_costs, 2) over_head_costs, format(sum(products.product_sales), 2) product_sales, ' + 
                    //create field calculated on the fly (not existing in either table) from values in each table
                'format(sum(products.product_sales) - departments.over_head_costs, 2) total_profit ' +
                    //join tables using common department name column 
                ' from products inner join departments using (department_name) ' +
                    //group  items from products table by departments
                'group by departments.department_name, department_id, over_head_costs order by department_id'
    displayResult(query);
}

function createDept(){
    askUser(addNewDeptQuestions)
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

function handleUpdate(info){
    let query = 'insert into departments (department_name, over_head_costs) values (?,?)'
    let vals = [info.name, info.overhead] 
    updateDatabase(query, vals)
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

beginSession();
