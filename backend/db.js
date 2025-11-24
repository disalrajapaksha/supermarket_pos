const mysql = require("mysql");

// Database connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // ඔයාගේ MySQL password
  database: "supermarket_db"
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Database connected!");
  }
});

module.exports = db;
