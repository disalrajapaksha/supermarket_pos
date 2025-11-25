-- Supermarket POS Database Setup - Enhanced Version
-- This script sets up the complete database schema with categories, images, and sales tracking

CREATE DATABASE IF NOT EXISTS supermarket_pos;
USE supermarket_pos;

-- Schema changes skipped to preserve Foreign Keys. Assuming schema exists.


-- Create sales table to track transactions
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    payment_method VARCHAR(50) DEFAULT 'Cash',
    total_amount DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    final_amount DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sale_items table to track individual items in each sale
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Clear existing products to avoid duplicates
DELETE FROM products;

-- Insert enhanced sample products with categories
INSERT INTO products (name, price, category, image_url) VALUES 
-- Grocery Items
('Basmati Rice 5kg', 1500.00, 'Grocery', 'rice.jpg'),
('White Sugar 1kg', 190.00, 'Grocery', 'sugar.jpg'),
('Red Rice 1kg', 220.00, 'Grocery', 'red_rice.jpg'),
('Wheat Flour 1kg', 180.00, 'Grocery', 'flour.jpg'),
('Dhal 500g', 200.00, 'Grocery', 'dhal.jpg'),

-- Dairy Products
('Fresh Milk 1L', 500.00, 'Dairy', 'milk.jpg'),
('Curd 400g', 400.00, 'Dairy', 'curd.jpg'),
('Butter 250g', 200.00, 'Dairy', 'butter.jpg'),
('Cheese Slices 200g', 600.00, 'Dairy', 'cheese.jpg'),
('Yogurt 400g', 350.00, 'Dairy', 'yogurt.jpg'),
('Eggs (10pcs)', 300.00, 'Dairy', 'eggs.jpg'),

-- Beverages
('Black Tea 100g', 200.00, 'Beverages', 'tea.jpg'),
('Coffee Powder 100g', 120.00, 'Beverages', 'coffee.jpg'),
('Soft Drink 1.5L', 320.00, 'Beverages', 'soda.jpg'),
('Mineral Water 1L', 100.00, 'Beverages', 'water.jpg'),
('Orange Juice 1L', 400.00, 'Beverages', 'juice.jpg'),

-- Bakery
('White Bread', 150.00, 'Bakery', 'bread.jpg'),
('Wheat Bread', 180.00, 'Bakery', 'wheat_bread.jpg'),
('Butter Cake', 1200.00, 'Bakery', 'cake.jpg'),

-- Snacks
('Biscuits Pack', 150.00, 'Snacks', 'biscuits.jpg'),
('Chocolate Bar', 300.00, 'Snacks', 'chocolate.jpg'),
('Potato Chips', 200.00, 'Snacks', 'chips.jpg'),
('Cookies Pack', 250.00, 'Snacks', 'cookies.jpg'),

-- Meat & Seafood
('Chicken 1kg', 1100.00, 'Meat', 'chicken.jpg'),
('Fish 1kg', 950.00, 'Seafood', 'fish.jpg'),
('Prawns 500g', 1200.00, 'Seafood', 'prawns.jpg'),

-- Vegetables
('Tomato 1kg', 300.00, 'Vegetables', 'tomato.jpg'),
('Potato 1kg', 250.00, 'Vegetables', 'potato.jpg'),
('Onion 1kg', 200.00, 'Vegetables', 'onion.jpg'),
('Carrot 1kg', 350.00, 'Vegetables', 'carrot.jpg'),
('Cabbage 1kg', 200.00, 'Vegetables', 'cabbage.jpg'),
('Beans 500g', 240.00, 'Vegetables', 'beans.jpg'),

-- Fruits
('Apple 1kg', 450.00, 'Fruits', 'apple.jpg'),
('Banana 1kg', 180.00, 'Fruits', 'banana.jpg'),
('Orange 1kg', 400.00, 'Fruits', 'orange.jpg'),
('Grapes 500g', 450.00, 'Fruits', 'grapes.jpg');

SELECT name, price FROM products WHERE name LIKE 'Basmati%';

