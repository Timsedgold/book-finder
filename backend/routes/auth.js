// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken"); 
const User = require("../models/user");
const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key-change-me";
const router = new express.Router();

// POST /auth/register
router.post("/register", async function (req, res, next) {
  try {
    const user = await User.register(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
});

/** POST /auth/login - Authenticate user & return token
 * Expects { username, password }
 * Returns { token } 
 */
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);

    // Create JWT payload (include non-sensitive identifiers)
    const payload = {
        username: user.username,
        userId: user.id 
    };

    // Sign the token
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' }); // Expires in 1 hour

    return res.json({ token }); // Return the token
  } catch (err) {
    // Errors (like UnauthorizedError from User.authenticate) will be caught here
    return next(err);
  }
});

module.exports = router;