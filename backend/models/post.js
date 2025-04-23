// models/post.js
"use strict";

const db = require("../db");
const { NotFoundError, UnauthorizedError } = require("../expressError");

class Post {
  /** Create a post (from data), update db, return new post data. */
  static async create({ title, content, authorId }) {
    const result = await db.query(
          `INSERT INTO posts (title, content, author_id)
           VALUES ($1, $2, $3)
           RETURNING id, title, content, author_id AS "authorId", created_at AS "createdAt", updated_at AS "updatedAt"`,
        [title, content, authorId, thumbnailUrl],
    );
    const post = result.rows[0];
    return post;
  }

  /** Find all posts by a specific author. */
  static async findAllByUser(authorId) {
    const result = await db.query(
          `SELECT id, title, author_id AS "authorId", created_at AS "createdAt", updated_at AS "updatedAt"
           FROM posts
           WHERE author_id = $1
           ORDER BY updated_at DESC`,
        [authorId]);
    return result.rows;
  }

  /** Given a post id, return data about post. */
  static async get(id) {
    const result = await db.query(
          `SELECT id, title, content, author_id AS "authorId", created_at AS "createdAt", updated_at AS "updatedAt"
           FROM posts
           WHERE id = $1`,
        [id]);
    const post = result.rows[0];

    if (!post) throw new NotFoundError(`No post: ${id}`);

    return post;
  }

   /** Update post data with `data`. */
  static async update(id, { title, content }) {
       const result = await db.query(
          `UPDATE posts
           SET title=$1, content=$2
           WHERE id = $3
           RETURNING id, title, content, author_id AS "authorId", created_at AS "createdAt", updated_at AS "updatedAt"`,
        [title, content, id]);
      const post = result.rows[0];

      if (!post) throw new NotFoundError(`No post: ${id}`);

      return post;
  }

  /** Delete given post from database; returns undefined. */
  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM posts
           WHERE id = $1
           RETURNING id`,
        [id]);
    const post = result.rows[0];

    if (!post) throw new NotFoundError(`No post: ${id}`);
  }

  /** Check if user is the author of the post */
  static async checkAuthorship(postId, userId) {
      const result = await db.query(
            `SELECT author_id
             FROM posts
             WHERE id = $1`,
          [postId]);
      const post = result.rows[0];

      if (!post) throw new NotFoundError(`No post: ${postId}`);
      if (post.author_id !== userId) {
          throw new UnauthorizedError("User is not the author of this post.");
      }
      return true; // User is the author
  }
}

module.exports = Post;