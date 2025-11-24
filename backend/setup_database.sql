-- Supermarket POS Database Setup - Enhanced Version
-- This script sets up the complete database schema with categories, images, and sales tracking

USE supermarket_pos;

-- First, let's modify the products table to add new columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'General',
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) DEFAULT 'placeholder.jpg';

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
('Basmati Rice 5kg', 750.00, 'Grocery', 'rice.jpg'),
('White Sugar 1kg', 120.00, 'Grocery', 'sugar.jpg'),
('Red Rice 1kg', 180.00, 'Grocery', 'red_rice.jpg'),
('Wheat Flour 1kg', 140.00, 'Grocery', 'flour.jpg'),
('Dhal 500g', 200.00, 'Grocery', 'dhal.jpg'),

-- Dairy Products
('Fresh Milk 1L', 200.00, 'Dairy', 'milk.jpg'),
('Curd 400g', 180.00, 'Dairy', 'curd.jpg'),
('Butter 250g', 380.00, 'Dairy', 'butter.jpg'),
('Cheese Slices 200g', 520.00, 'Dairy', 'cheese.jpg'),
('Yogurt 400g', 180.00, 'Dairy', 'yogurt.jpg'),
('Eggs (10pcs)', 350.00, 'Dairy', 'eggs.jpg'),

-- Beverages
('Black Tea 100g', 250.00, 'Beverages', 'tea.jpg'),
('Coffee Powder 100g', 450.00, 'Beverages', 'coffee.jpg'),
('Soft Drink 1.5L', 180.00, 'Beverages', 'soda.jpg'),
('Mineral Water 1L', 50.00, 'Beverages', 'water.jpg'),
('Orange Juice 1L', 280.00, 'Beverages', 'juice.jpg'),

-- Bakery
('White Bread', 80.00, 'Bakery', 'bread.jpg'),
('Wheat Bread', 100.00, 'Bakery', 'wheat_bread.jpg'),
('Butter Cake', 450.00, 'Bakery', 'cake.jpg'),

-- Snacks
('Biscuits Pack', 150.00, 'Snacks', 'biscuits.jpg'),
('Chocolate Bar', 200.00, 'Snacks', 'chocolate.jpg'),
('Potato Chips', 180.00, 'Snacks', 'chips.jpg'),
('Cookies Pack', 220.00, 'Snacks', 'cookies.jpg'),

-- Meat & Seafood
('Chicken 1kg', 850.00, 'Meat', 'chicken.jpg'),
('Fish 1kg', 950.00, 'Seafood', 'fish.jpg'),
('Prawns 500g', 1200.00, 'Seafood', 'prawns.jpg'),

-- Vegetables
('Tomato 1kg', 120.00, 'Vegetables', 'tomato.jpg'),
('Potato 1kg', 100.00, 'Vegetables', 'potato.jpg'),
('Onion 1kg', 110.00, 'Vegetables', 'onion.jpg'),
('Carrot 1kg', 130.00, 'Vegetables', 'carrot.jpg'),
('Cabbage 1kg', 90.00, 'Vegetables', 'cabbage.jpg'),
('Beans 500g', 150.00, 'Vegetables', 'beans.jpg'),

-- Fruits
('Apple 1kg', 450.00, 'Fruits', 'apple.jpg'),
('Banana 1kg', 180.00, 'Fruits', 'banana.jpg'),
('Orange 1kg', 280.00, 'Fruits', 'orange.jpg'),
('Grapes 500g', 350.00, 'Fruits', 'grapes.jpg');

SELECT 'Database setup completed successfully!' AS message;
SELECT COUNT(*) AS total_products FROM products;
SELECT DISTINCT category FROM products ORDER BY category;
