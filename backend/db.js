// Example db.js
const { Client } = require("pg");
require("dotenv").config(); 

let db;

if (process.env.NODE_ENV === "production") {
  console.log("Connecting to production DB...");
  db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false 
    }
  });
} else {
  // Your local development connection (ensure you have one)
  console.log("Connecting to local DB...");
  db = new Client({
    // Example for local DB named 'books'
    database: "books",
    // user: ..., password: ..., host: ..., port: ...
  });
}

db.connect()
  .then(() => console.log("DB connection successful."))
  .catch(err => console.error("DB connection error:", err.stack));

module.exports = db;