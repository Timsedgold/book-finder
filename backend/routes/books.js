// routes/books.js
"use strict";

const express = require("express");
const Book = require("../models/books");
// Import ensureLoggedIn (ensure this path is correct)
const { ensureLoggedIn } = require("../middleware/auth");
const router = new express.Router();

/** GET /books?query=searchTerm
 * => { books: [ {id, title, author, ...}, {id, title, author, isLocal..}, ... ] }
 * Requires login. Searches Google Books and local posts.
 */
// ADD ensureLoggedIn middleware here
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const query = req.query.query;
    if (!query) {
      // Maybe return empty array instead of error? Consistent with no results.
      return res.json({ books: [] });
      // return res.status(400).json({ error: "Query parameter is required" });
    }
    const userId = res.locals.user.userId; // Get logged-in user ID from middleware
    // Call the updated searchBooks method (passing userId is optional for now)
    const books = await Book.searchBooks(query, userId);
    // The result from searchBooks is already the combined array
    return res.json({ books }); // Return combined results under 'books' key
  } catch (err) {
    return next(err);
  }
});


/** POST /books => Add book to database */
// Keep this route if you are using it to save specific Google Books to your DB
router.post("/", ensureLoggedIn, async function (req, res, next) { // Also protect this?
  try {
    // Consider if you still need this route or if it conflicts with 'posts'
    const { id, title, author, description, thumbnail, previewLink } = req.body;
    const book = await Book.addBook({ id, title, author, description, thumbnail, previewLink });
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** GET /books/saved => Get saved books from the database */
// Keep this route if needed
router.get("/saved", ensureLoggedIn, async function (req, res, next) { // Also protect this?
  try {
    const books = await Book.getSavedBooks();
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;