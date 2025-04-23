"use strict";

/** Express app for books. */

const express = require("express");
const path = require("path"); // Import path module
const cors = require("cors");
const dotenv = require("dotenv");
const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");
const bookRoutes = require("./routes/books");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");

const app = express();
app.use(
  cors({ origin: [process.env.FRONTEND_URL || "http://localhost:5173"] })
);
app.use(express.json());
app.use(authenticateJWT);

app.get("/", (req, res) => {
  // Simple response to confirm the API is running
  res.send("BookFinder Backend API is alive!");
});

app.use("/books", bookRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
