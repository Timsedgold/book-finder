const express = require("express");
const User = require("../models/user");
const router = new express.Router();

// Add a book to favorites
router.post("/:username/favorites/:bookId", async function (req, res, next) {
  try {
    const { username, bookId } = req.params;
    await User.addFavorite(username, bookId);
    return res.status(201).json({
      added: {
        username,
        bookId: Number(bookId),
      },
    });
  } catch (err) {
    return next(err);
  }
});

// Remove a book from favorites
router.delete("/:username/favorites/:bookId", async function (req, res, next) {
  try {
    const { username, bookId } = req.params;
    await User.removeFavorite(username, bookId);
    return res.json({ message: "Removed from favorites" });
  } catch (err) {
    return next(err);
  }
});

// Get all favorited books by a user
router.get("/:username/favorites", async function (req, res, next) {
  try {
    const { username } = req.params;
    const favorites = await User.getFavorites(username);
    return res.json({ favorites });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
