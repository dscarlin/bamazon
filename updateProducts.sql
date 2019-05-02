use bamazon;
update products set product_sales = 3472.86 where item_id = 1;
update products set product_sales = 3856.47 where item_id = 9;
update products set product_sales = 2997.40 where item_id = 10;
update products set product_sales = 4863.55 where item_id = 11;
SELECT product_sales
FROM bamazon.products;
