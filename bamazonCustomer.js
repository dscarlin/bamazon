const mysql = require('mysql');
const inquirer = require('inquirer');
const ctable = require('console.table')
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root', 
    password: 'a1zucena',
    database: 'bamazon'
});

//------------------------------------------//
//             text  formatting             //
//------------------------------------------//
const newLine = "\n"
const tab = "   "
const textGreen = "\u001b[32m"
const textRed = "\u001b[31m"
const textBrightBlue =  "\u001b[34;1m"
const textYellow = "\u001b[33m"
const textCyan = "\u001b[36m"
const textPlain = "\u001b[0m"



//------------------------------------------//
//               prompts                    //
//------------------------------------------//
const itemIdPrompt = {
    type: 'input',
    name: 'customerOrder',
    message: newLine + textBrightBlue + 'What is the item_id of the product you would like to buy?' + textPlain
}  
const confirmItemPrompt = {
    type: 'confirm',
    name: 'checkOrder',
    message: newLine + textBrightBlue +'Is that correct?' + textPlain
}  
const itemQuantityPrompt = {
    type: 'input',
    name: 'desiredQuantity',
    message: newLine + textBrightBlue +'Great, how many would you like?' + textPlain
}
const action = (choices) => {
    return {
        type: 'list',
        name: 'action',
        message: textBrightBlue +'What would you like to do?' + textPlain,
        choices: choices
    }
} 

//------------------------------------------//
//      choices for action prompt           //
//------------------------------------------//

const orderOrChangeOrder = (stockQuantity) => {
    return [
        'order ' + stockQuantity,
        'order a different amount',
        'search for another product',
        'exit'
    ]
}
const orderAnotherItem = [
    'search for another product',
    'exit'
]


//-----------------------------------------//
//        display products available       //
//-----------------------------------------//
beginSession()
function beginSession(){
    console.log(newLine + newLine + textBrightBlue + "Welcome to Bamazon!" + textPlain)
    showProductsTable();
}
function showProductsTable() {
    connection.query(
        'select item_id, product_name, price, FORMAT(price, 2) as price from products',
        (err, res) => {
            if (err) throw err;
            console.table(newLine + newLine+ 'Bamazon Products', res);
            idArray = []
            res.forEach(entry => idArray.push(entry.item_id));
            // connection.end();
            askCustomer(itemIdPrompt, idArray,  '', res)
        }
        );
};
    


function askCustomer(question, item_ids, orderItem, itemList, price, productSales){
    inquirer
        .prompt([question])
        .then((res) => {
            //   exit at any open-ended prompt
            if(customerWishesToExit(res))
                return connection.end()
            //   customer has selected an item by ID
            if(res.customerOrder || res.customerOrder == ""){
                if (res.customerOrder.trim() == ""){
                    console.log(newLine + textRed + 'No item selected' + newLine + textPlain)
                    return askCustomer(question,item_ids,"",itemList)
                }
                else
                    handleCustomerSelection(res.customerOrder,item_ids,itemList)
               
            }
            
            else if (res.action){
                switch (res.action) {
                    case 'order a different amount':
                        askCustomer(itemQuantityPrompt, '', orderItem, '');
                        break;
                    case 'search for another product':
                        showProductsTable();
                        break;
                    case 'exit':
                        return connection.end();
                    default:
                        let quantity = res.action.match(/[0-9]/g).join().replace(/,/g,"")
                        placeOrder(orderItem, 0, quantity, price, productSales)   
                }
            }
            //boolean response requires extra validation of has own property
            else if(res.hasOwnProperty('checkOrder')){
                if(res.checkOrder)
                    askCustomer(itemQuantityPrompt, '', orderItem, '');
                else    
                    showProductsTable();

            } 

            else{
                connection.query(
                    'select stock_quantity, price, product_sales from products where ?',
                    {
                        item_id: orderItem
                    },  
                    (err,resDB) => {
                        let price = resDB[0].price
                        let stockQuantity = resDB[0].stock_quantity
                        let productSales = resDB[0].product_sales
                        if (err) throw err;

                        if (res.desiredQuantity <= stockQuantity){
                            updatedStockQuantity = stockQuantity - res.desiredQuantity;
                            let itemId = parseInt(orderItem);
                            // console.log(updatedStockQuantity);
                            placeOrder(itemId, updatedStockQuantity, res.desiredQuantity, price, productSales)
                            
                        }
                        else {
                            if (stockQuantity > 0 ){

                                console.log(
                                    newLine + textYellow +
                                    'Sorry we only have ' + stockQuantity +
                                    ' left in stock.' + newLine + newLine + textPlain
                                );
                                askCustomer(action(orderOrChangeOrder(stockQuantity)),"", orderItem,"", price, productSales);
                            }
                            else{
                                console.log(
                                    newLine + textRed +
                                    'Sorry we are all out of that item' +
                                    textPlain + newLine
                                );
                                askCustomer(action(orderAnotherItem));
                            }

                        }
                        
                    });
               
                }    
            
            
    })
}

function customerWishesToExit(res){
    for(let prop in res){
        let response = res[prop].toString().toUpperCase()
        if ( response == 'EXIT' || response == 'QUIT' || response == "ESC"){
            console.log(newLine + textBrightBlue + "Thanks for shopping at Bamazon!" + newLine + newLine + textPlain)
            return true
        }
    };
}

function handleCustomerSelection(order,itemIdList,productsInfo){

    let customerOrder = parseInt(order)

    //  check that the ID selction is valid
    if (itemIdList.indexOf(customerOrder) != -1){
        stateProductName(customerOrder, productsInfo)
        // ask customer to confirm selection
        askCustomer(confirmItemPrompt, itemIdList, order, productsInfo)
    }
    else{
        console.log(newLine + textRed + 
            'Item Id not found' + textBrightBlue + newLine + newLine +
            'Select from these available products.' + textPlain);
        showProductsTable();
    }
}

function stateProductName(id, list){
    
    list.forEach(item => {
        if (id == item.item_id){
            return console.log(
                newLine +
                'You selected:' + newLine +
                newLine + tab + textCyan + 
                item.product_name +
                tab + textGreen +
                '$' + item.price + 
                textPlain);
        }    
    })
}



function placeOrder(item, newStockQuantity, orderQuantity, price, productSales){
    let purchase = orderQuantity * price
    let updatedProductSales = purchase + productSales
    connection.query(
        'update products set ?,? where ?',
        [
            {
                stock_quantity: newStockQuantity
            },
            {
                product_sales: updatedProductSales
            },
            {
                item_id: item
            }
        ],
        (err,res) => {
            if (err) throw err;
            // console.log(res.affectedRows + " product updated" + newLine)
            
            console.log(
                newLine + textGreen +
                'Your Order has been placed' + 
                newLine + textPlain
            );
            askCustomer(action(orderAnotherItem));
        }
    )
}
