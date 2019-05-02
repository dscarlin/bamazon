use bamazon;

create table departments(
    department_id integer not null auto_increment,
    department_name varchar(100) not null,
    over_head_costs float not null,
    primary key (department_id)
);

alter table products
add product_sales float not null;

insert into departments(department_name, over_head_costs)
values('Cookware', 2000);
insert into departments(department_name, over_head_costs)
values('Electronics', 1400);
insert into departments(department_name, over_head_costs)
values('Garden and Outdoor', 1100);
insert into departments(department_name, over_head_costs)
values('Appliances', 1850);
insert into departments(department_name, over_head_costs)
values('Lighting', 1000);
insert into departments(department_name, over_head_costs)
values('Food', 1900);
insert into departments(department_name, over_head_costs)
values('Sporting Goods', 1200);
insert into departments(department_name, over_head_costs)
values('Clothing', 900);