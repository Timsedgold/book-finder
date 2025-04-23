"use strict";

require("dotenv").config(); // Load environment variables from .env

const PORT = process.env.PORT || 3001; // Default to 3001 if not specified
const DATABASE_URL = process.env.DATABASE_URL || "postgresql:///books"; // Default DB

module.exports = { PORT, DATABASE_URL };
