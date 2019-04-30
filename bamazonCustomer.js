const mysql = require('mysql');
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



const itemIdPrompt = {
    type: 'input',
    name: 'customerOrder',
    message: newLine + 'What is the item_id of the product you would like to buy?'
}  
const confirmItemPrompt = {
    type: 'confirm',
    name: 'checkOrder',
    message: newLine + 'Is that correct?'
}  
const itemQuantityPrompt = {
    type: 'input',
    name: 'desiredQuantity',
    message: newLine + 'Great, how many would you like?'
}


 
const orderOrChangeOrder = (stockQuantity) => {
    return {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'order ' + stockQuantity,
            'order a different amount',
            'search for another product',
            'exit'
            
        ]
    }
} 

const orderAnotherItem = {
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
        'search for another product',
        'exit'
    ]
}


showProductsTable();
function showProductsTable() {
    connection.query(
        'select item_id, product_name, price, FORMAT(price, 2) as price from products',
        (err, res) => {
            if (err) throw err;
            console.table(res);
            idArray = []
            res.forEach(entry => idArray.push(entry.item_id));
            // connection.end();
            askCustomer(itemIdPrompt, idArray,  '', res)
        }
        );
};
    


function askCustomer(question, item_ids, orderItem, itemList){
    inquirer
        .prompt([question])
        .then((res) => {

            for(let prop in res){
                if (res[prop].toString().toUpperCase() == 'EXIT')
                    return connection.end();
            };

            if(res.customerOrder){
                let customerOrder = parseInt(res.customerOrder)

                if (item_ids.indexOf(customerOrder) != -1){
                    stateProductName(customerOrder, itemList)
                    askCustomer(confirmItemPrompt, item_ids, res.customerOrder, itemList)
                }

                else{
                    console.log(newLine + textRed + 
                        'Item Id not found' + textCyan + newLine + newLine +
                        'Select from these available products.' + textPlain);
                    showProductsTable();
                }
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
                        // let quantity = res.action.match(/[0-9]/g).join().replace(/,/g,"")
                        placeOrder(orderItem, 0)   
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
                    'select stock_quantity from products where ?',
                    {
                        item_id: orderItem
                    },
                    (err,resDB) => {
                        let stockQuantity = resDB[0].stock_quantity
                        if (err) throw err;

                        if (res.desiredQuantity <= stockQuantity){
                            updatedStockQuantity = stockQuantity - res.desiredQuantity;
                            let itemId = parseInt(orderItem);
                            console.log(updatedStockQuantity);
                            placeOrder(itemId, updatedStockQuantity)
                            
                        }
                        else {
                            if (stockQuantity > 0 ){

                                console.log(
                                    newLine + textYellow +
                                    'Sorry we only have ' + stockQuantity +
                                    ' left in stock.' + newLine + newLine + textPlain
                                );
                                askCustomer(orderOrChangeOrder(stockQuantity),"",orderItem,"");
                            }
                            else{
                                console.log(
                                    newLine + textRed +
                                    'Sorry we are all out of that item' +
                                    textPlain + newLine
                                );
                                askCustomer(orderAnotherItem);
                            }

                        }
                        
                    });
               
                }    
            
            
    })
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



function placeOrder(item, quantity){
    connection.query(
        'update products set ? where ?',
        [
            {
                stock_quantity: quantity
            },
            {
                item_id: item
            }
        ],
        (err,res) => {
            if (err) throw err;
            let productOrProducts = (res.affectedRows > 1) ? "products" : "product"
            console.log(res.affectedRows + " "+ productOrProducts + " updated" + newLine)
            
            console.log(
                newLine + 
                'Your Order has been placed' + 
                newLine
            );
            askCustomer(orderAnotherItem)
        }

    )
}
