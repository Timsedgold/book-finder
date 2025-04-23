// routes/posts.js
"use strict";

const express = require("express");
const Post = require("../models/post");
const { ensureLoggedIn } = require("../middleware/auth"); // Import ensureLoggedIn
const { BadRequestError } = require("../expressError");
const router = new express.Router();

/** POST /posts - Create new post
 * Requires login.
 * Expects JSON: { title, content, thumbnailUrl? (optional URL string) }
 * Returns: { post: { id, title, content, authorId, thumbnailUrl, ... } }
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    // Get data from JSON body now, including optional thumbnailUrl
    const { title, content, thumbnailUrl } = req.body; // <--- Get thumbnailUrl from body
    const authorId = res.locals.user.userId;

    // ThumbnailUrl is now optional on the backend, can be null or empty string
    const finalThumbnailUrl = thumbnailUrl?.trim() ? thumbnailUrl.trim() : null; // Basic trim or nullify if empty

    if (!title || !content) {
      throw new BadRequestError("Title and content are required.");
    }

    // Pass the received (or null) thumbnailUrl to the create method
    const post = await Post.create({
        title,
        content,
        authorId,
        thumbnailUrl: finalThumbnailUrl // Pass the URL string
    });
    return res.status(201).json({ post });

  } catch (err) {
    return next(err);
  }
});

/** GET /posts - Get list of posts for logged-in user
 * Requires login.
 * Returns: { posts: [ { id, title, authorId, createdAt, updatedAt }, ... ] }
 */
router.get("/", ensureLoggedIn, async function (req, res, next) {
    try {
        const authorId = res.locals.user.userId;
        const posts = await Post.findAllByUser(authorId);
        return res.json({ posts });
    } catch (err) {
        return next(err);
    }
});


/** GET /posts/:id - Get specific post by ID
 * Requires login. (Doesn't strictly need author check for reading, but could add)
 * Returns: { post: { id, title, content, authorId, createdAt, updatedAt } }
 */
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
        const post = await Post.get(req.params.id);
        // Optional: Check if user is author before allowing read?
        // if (post.authorId !== res.locals.user.userId) {
        //     throw new UnauthorizedError("Cannot view this post");
        // }
        return res.json({ post });
    } catch (err) {
        return next(err);
    }
});

/** PUT /posts/:id - Update specific post by ID
 * Requires login and user must be the author.
 * Expects: { title, content }
 * Returns: { post: { id, title, content, authorId, createdAt, updatedAt } }
 */
router.put("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
        const postId = req.params.id;
        const userId = res.locals.user.userId;
        const { title, content } = req.body;

        if (title === undefined || content === undefined) {
             throw new BadRequestError("Title and content are required.");
        }

        // Verify authorship before updating
        await Post.checkAuthorship(postId, userId);

        const post = await Post.update(postId, { title, content });
        return res.json({ post });
    } catch (err) {
        return next(err);
    }
});


/** DELETE /posts/:id - Delete specific post by ID
 * Requires login and user must be the author.
 * Returns: { deleted: postId }
 */
router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
        const postId = req.params.id;
        const userId = res.locals.user.userId;

         // Verify authorship before deleting
        await Post.checkAuthorship(postId, userId);

        await Post.remove(postId);
        return res.json({ deleted: postId });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;