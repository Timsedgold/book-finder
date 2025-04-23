"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { UnauthorizedError, BadRequestError } = require("../expressError");

const BCRYPT_WORK_FACTOR = 12; // Increase for stronger hashing
const SECRET_KEY = process.env.SECRET_KEY; // Load secret key from .env

class User {
  /** Authenticate user with username & password. */
  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT id, username, password, first_name, last_name, email 
       FROM users WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        delete user.password;
        return user;
      }
    }
    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register new user and return user data with JWT token. */
  static async register({ username, password, firstName, lastName, email }) {
    const duplicateCheck = await db.query(
      `SELECT username FROM users WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Username already taken: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, first_name, last_name, email`,
      [username, hashedPassword, firstName, lastName, email]
    );

    return result.rows[0];
  }

  /** Add a book to user's favorites */
  static async addFavorite(username, bookId) {
    const userRes = await db.query(`SELECT id FROM users WHERE username = $1`, [
      username,
    ]);
    const user = userRes.rows[0];

    if (!user) {
      throw new NotFoundError(`No user: ${username}`);
    }

    const result = await db.query(
      `INSERT INTO favorites (user_id, book_id)
       VALUES ($1, $2)
       RETURNING id`,
      [user.id, bookId]
    );

    return result.rows[0];
  }

  /** Remove a book from user's favorites */
  static async removeFavorite(username, bookId) {
    const userRes = await db.query(`SELECT id FROM users WHERE username = $1`, [
      username,
    ]);
    const user = userRes.rows[0];

    if (!user) {
      throw new NotFoundError(`No user: ${username}`);
    }

    await db.query(
      `DELETE FROM favorites
       WHERE user_id = $1 AND book_id = $2`,
      [user.id, bookId]
    );
  }

  /** Get all favorited books for a user */
  static async getFavorites(username) {
    const userRes = await db.query(`SELECT id FROM users WHERE username = $1`, [
      username,
    ]);
    const user = userRes.rows[0];

    if (!user) {
      throw new NotFoundError(`No user: ${username}`);
    }

    const result = await db.query(
      `SELECT b.id, b.title, b.author, b.thumbnail, b.preview_link
       FROM books AS b
       JOIN favorites AS f ON f.book_id = b.id
       WHERE f.user_id = $1`,
      [user.id]
    );

    return result.rows;
  }
}

module.exports = User;
