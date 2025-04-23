// routes/posts.js
"use strict";

const express = require("express");
const Post = require("../models/post");
const { ensureLoggedIn } = require("../middleware/auth"); // Import ensureLoggedIn
const { BadRequestError } = require("../expressError");
const multer = require('multer'); // Require multer
const path = require('path'); // Require path

// --- Multer Configuration (Place this block here!) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Ensure 'uploads/' directory exists in your backend root
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const fileFilter = (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
          cb(null, true);
      } else {
          // Use new Error() for multer file filter rejections
          cb(new Error('Only image files are allowed!'), false);
      }
  };
  
  // This line defines the 'upload' variable
  const upload = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
  
const router = new express.Router();

/** POST /posts - Create new post
 * Requires login. Handles file upload for thumbnail.
 * Expects multipart/form-data: { title, content, thumbnailImage (file) }
 * Returns: { post: { id, title, content, authorId, thumbnailUrl, ... } }
 */
// Apply multer middleware BEFORE ensureLoggedIn and the main handler
// 'thumbnailImage' must match the key used in the frontend FormData
router.post("/", upload.single('thumbnailImage'), ensureLoggedIn, async function (req, res, next) {
    try {
      const { title, content } = req.body;
      const authorId = res.locals.user.userId;
  
      // --- Get Thumbnail URL ---
      let thumbnailUrl = null;
      if (req.file) {
        // Construct the URL path relative to how you serve static files
        // If app.use('/uploads', ...) serves from 'uploads/', the path is '/uploads/filename'
        thumbnailUrl = `/uploads/${req.file.filename}`;
         console.log("Uploaded file:", req.file);
         console.log("Thumbnail URL:", thumbnailUrl);
      } else {
          console.log("No thumbnail image uploaded.");
      }
      // ------------------------
  
  
      if (!title || !content) {
        throw new BadRequestError("Title and content are required.");
      }
  
      // Pass thumbnailUrl to the create method
      const post = await Post.create({ title, content, authorId, thumbnailUrl });
      return res.status(201).json({ post });
  
    } catch (err) {
      // Handle potential errors from multer (like file size limit) or model
      return next(err);
    }
  });

/** POST /posts - Create new post
 * Requires login.
 * Expects: { title, content }
 * Returns: { post: { id, title, content, authorId, createdAt, updatedAt } }
 */
router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const { title, content } = req.body;
    const authorId = res.locals.user.userId; // Get user ID from token payload via middleware

    if (!title || !content) {
        throw new BadRequestError("Title and content are required.");
    }

    const post = await Post.create({ title, content, authorId });
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