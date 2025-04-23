const { Client } = require("pg");
const { DATABASE_URL } = require("./config"); // Import database URL
require("dotenv").config();

// PostgreSQL client setup
const db = new Client({
  connectionString: DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

db.connect();

module.exports = db;
