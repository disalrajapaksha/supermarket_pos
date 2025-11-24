const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "supermarket_pos"
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("Database connected successfully!");
    }
});

// In-memory cart storage (for simplicity)
let cart = [];

app.get("/", (req, res) => {
    res.json({ message: "Supermarket POS Backend - Enhanced Version" });
});

// Get all products
app.get("/products", (req, res) => {
    db.query("SELECT * FROM products ORDER BY category, name", (err, result) => {
        if (err) return res.json({ error: err });
        res.json(result);
    });
});

// Get products by category
app.get("/products/category/:category", (req, res) => {
    const { category } = req.params;
    db.query("SELECT * FROM products WHERE category = ? ORDER BY name", [category], (err, result) => {
        if (err) return res.json({ error: err });
        res.json(result);
    });
});

// Search products
app.get("/products/search", (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.json({ error: "Search query is required" });
    }
    const searchTerm = `%${q}%`;
    db.query(
        "SELECT * FROM products WHERE name LIKE ? OR category LIKE ? ORDER BY name",
        [searchTerm, searchTerm],
        (err, result) => {
            if (err) return res.json({ error: err });
            res.json(result);
        }
    );
});

// Get all categories
app.get("/categories", (req, res) => {
    db.query("SELECT DISTINCT category FROM products ORDER BY category", (err, result) => {
        if (err) return res.json({ error: err });
        res.json(result.map(row => row.category));
    });
});

// Get current cart
app.get("/cart", (req, res) => {
    res.json({ cart });
});

// Add to cart
app.post("/add-to-cart", (req, res) => {
    const { productId, quantity } = req.body;

    db.query("SELECT * FROM products WHERE id = ?", [productId], (err, result) => {
        if (err) return res.json({ error: err });

        if (result.length > 0) {
            const product = result[0];
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    quantity: quantity
                });
            }

            res.json({ message: "Added to cart", cart });
        } else {
            res.json({ error: "Product not found" });
        }
    });
});

// Update cart item quantity
app.put("/cart/:productId", (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    const item = cart.find(item => item.id === parseInt(productId));
    if (item) {
        if (quantity <= 0) {
            cart = cart.filter(item => item.id !== parseInt(productId));
            res.json({ message: "Item removed from cart", cart });
        } else {
            item.quantity = quantity;
            res.json({ message: "Cart updated", cart });
        }
    } else {
        res.json({ error: "Item not found in cart" });
    }
});

// Remove from cart
app.delete("/cart/:productId", (req, res) => {
    const { productId } = req.params;
    cart = cart.filter(item => item.id !== parseInt(productId));
    res.json({ message: "Item removed from cart", cart });
});

// Generate bill
app.get("/generate-bill", (req, res) => {
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    res.json({ cart, total });
});

// Complete sale and save to database
app.post("/complete-sale", (req, res) => {
    const { customerName, paymentMethod, discount } = req.body;

    if (cart.length === 0) {
        return res.json({ error: "Cart is empty" });
    }

    let totalAmount = 0;
    cart.forEach(item => {
        totalAmount += item.price * item.quantity;
    });

    const discountAmount = discount || 0;
    const finalAmount = totalAmount - discountAmount;

    // Insert sale record
    const saleQuery = "INSERT INTO sales (customer_name, payment_method, total_amount, discount, final_amount) VALUES (?, ?, ?, ?, ?)";
    db.query(saleQuery, [customerName, paymentMethod, totalAmount, discountAmount, finalAmount], (err, result) => {
        if (err) return res.json({ error: err });

        const saleId = result.insertId;

        // Insert sale items
        const itemPromises = cart.map(item => {
            return new Promise((resolve, reject) => {
                const itemQuery = "INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?)";
                const subtotal = item.price * item.quantity;
                db.query(itemQuery, [saleId, item.id, item.name, item.quantity, item.price, subtotal], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });

        Promise.all(itemPromises)
            .then(() => {
                const saleData = {
                    saleId,
                    cart: [...cart],
                    totalAmount,
                    discount: discountAmount,
                    finalAmount,
                    customerName,
                    paymentMethod
                };

                // Clear cart after successful sale
                cart = [];

                res.json({ message: "Sale completed successfully", sale: saleData });
            })
            .catch(err => res.json({ error: err }));
    });
});

// Get sales history
app.get("/sales", (req, res) => {
    const query = `
        SELECT s.*, 
               GROUP_CONCAT(CONCAT(si.product_name, ' (', si.quantity, 'x)') SEPARATOR ', ') as items
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        GROUP BY s.id
        ORDER BY s.sale_date DESC
        LIMIT 50
    `;
    db.query(query, (err, result) => {
        if (err) return res.json({ error: err });
        res.json(result);
    });
});

// Get today's sales summary
app.get("/sales/today", (req, res) => {
    const query = `
        SELECT 
            COUNT(*) as total_sales,
            SUM(final_amount) as total_revenue,
            AVG(final_amount) as average_sale
        FROM sales
        WHERE DATE(sale_date) = CURDATE()
    `;
    db.query(query, (err, result) => {
        if (err) return res.json({ error: err });
        res.json(result[0]);
    });
});

// Clear cart
app.post("/clear-cart", (req, res) => {
    cart = [];
    res.json({ message: "Cart cleared", cart });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
