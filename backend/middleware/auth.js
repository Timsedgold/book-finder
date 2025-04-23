// backend/middleware/auth.js
"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key-change-me"; // Ensure this matches login signing key

function authenticateJWT(req, res, next) {
  console.log(`------\nAuthJWT: Running for [${req.method}] ${req.originalUrl}`); // Log path
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      console.log("AuthJWT: Header found, Token:", token.slice(0, 15) + "..."); // Log truncated token
      try {
          // Make sure SECRET_KEY is correct!
          res.locals.user = jwt.verify(token, SECRET_KEY);
          console.log("AuthJWT: Token VERIFIED, res.locals.user set:", res.locals.user);
      } catch (jwtError) {
          // Log specific JWT errors (expired, invalid signature etc.)
          console.error("AuthJWT: Token VERIFICATION FAILED:", jwtError.name, jwtError.message);
          // Don't set user, proceed without authentication for this request
      }
    } else {
        console.log("AuthJWT: No Authorization header found.");
    }
    return next(); // Always call next() even if token invalid or missing
  } catch (err) {
     // Catch unexpected errors within the middleware itself
     console.error("AuthJWT: Unexpected middleware error", err);
    return next(); // Proceed even on unexpected error? Or next(err)? Usually just next().
  }
}

function ensureLoggedIn(req, res, next) {
  console.log(`EnsureLoggedIn: Checking user for [${req.method}] ${req.originalUrl}`);
  // Log the user object found (or not found) by authenticateJWT
  console.log("EnsureLoggedIn: res.locals.user =", res.locals.user);
  try {
    // Check for existence of user object AND a necessary field like userId
    if (!res.locals.user || !res.locals.user.userId) {
       console.error("EnsureLoggedIn: FAILED - No valid user found in res.locals");
       // Throw specific error to be caught by error handler
      throw new UnauthorizedError("Authentication required.");
    }
    // If user exists and has necessary fields, proceed
    console.log("EnsureLoggedIn: PASSED - User OK.");
    return next();
  } catch (err) {
     // Pass UnauthorizedError (or others) to the main error handler
    return next(err);
  }
}

module.exports = { authenticateJWT, ensureLoggedIn };