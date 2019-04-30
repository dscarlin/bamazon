drop database if exists bamazon;
create database bamazon;

use bamazon;
create table products(
    item_id integer auto_increment not null,
    product_name varchar(100) not null,
    department_name varchar(60) not null,
    price float not null,
    stock_quantity integer not null,
    primary key(item_id)
);


 insert into products(product_name, department_name, price, stock_quantity)
 values('Napoli Pizza Oven','Cookware',249.99,1149);
 insert into products(product_name, department_name, price, stock_quantity)
 values('Kitchen Aid Stand Mixer 500 Series','Cookware',349.50,683);
 insert into products(product_name, department_name, price, stock_quantity)
 values('Amazon Echo','Electronics',299.99,3877);
 insert into products(product_name, department_name, price, stock_quantity)
 values('Sony Bluetooth Headphones','Electronics',49.50,604);
 insert into products(product_name, department_name, price, stock_quantity)
 values('Fireboss Outdoor Fire Pit','Garden and Outdoor',38.50,293);
 insert into products(product_name, department_name, price, stock_quantity)
 values('Whirlpool Dishwasher CleanMaster Deluxe','Appliances',699.99,480);
 insert into products(product_name, department_name, price, stock_quantity)
 values('SunLight CFL Circline Bulb 40W','Lighting',17.49,287);
 insert into products(product_name, department_name, price, stock_quantity)
 values('Albutti Stone Pressed Arbequina Olive Oil','Food',28.49,966);
 insert into products(product_name, department_name, price, stock_quantity)
 values('Yeti SubZero Cooler 2cu ft','Sporting Goods',199.95,2430);
 insert into products(product_name, department_name, price, stock_quantity)
 values('Patagonia Womens Spring Fleece','Clothing',187.53,4182);

 select  * from products;