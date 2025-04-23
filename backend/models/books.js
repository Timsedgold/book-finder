// models/books.js
"use strict";

const axios = require("axios");
const db = require("../db"); // Ensure you have your db connection setup imported
require("dotenv").config(); // To load environment variables like API keys

// Ensure your API key is loaded correctly from your .env file or config
// Use the specific variable name you have defined (e.g., API_KEY or GOOGLE_BOOKS_API_KEY)
const API_KEY = process.env.API_KEY || process.env.GOOGLE_BOOKS_API_KEY;
if (!API_KEY) {
    console.error("FATAL ERROR: Google Books API Key not found. Check .env file and variable name (API_KEY or GOOGLE_BOOKS_API_KEY).");
    // process.exit(1); // Optional: exit if key is crucial and missing
}

const BASE_GOOGLE_API_URL = "https://www.googleapis.com/books/v1/volumes";
// Define the path to your default thumbnail image (relative to the frontend's public folder)
const DEFAULT_THUMBNAIL = '/images/default-post-thumbnail.png';

class Book {

  /**
   * Search books using Google Books API AND local 'posts' table.
   * Formats results from both sources into a consistent structure.
   *
   * @param {string} query - The search term.
   * @param {number} loggedInUserId - The ID of the currently logged-in user (optional, for future use).
   * @returns {Promise<Array>} A promise that resolves to an array of combined results.
   */
  static async searchBooks(query, loggedInUserId) {
    if (!query) return []; // Return empty array if query is empty

    console.log(`Searching for query: "${query}"`); // Log the search term

    // --- Fetch Google Books (using Promise) ---
    const googleUrl = `${BASE_GOOGLE_API_URL}?q=${encodeURIComponent(query)}&maxResults=10&key=${API_KEY}`; // Limit to 10 results for now
    console.log("Fetching from Google Books:", googleUrl);
    const googleBooksPromise = axios.get(googleUrl).catch(err => {
      // Log Google API errors but don't let them stop the entire search
      console.error(
        "Google Books API Error:",
        err.response?.status,
        err.response?.data?.error?.message || err.message
      );
      // Return an empty structure matching a successful empty response
      return { data: { items: [] } };
    });

    // --- Fetch Local Posts from DB (using Promise) ---
    const sqlQuery = `
        SELECT
            p.id,
            p.title,
            p.content,
            p.created_at AS "createdAt", -- Alias for consistency
            u.username AS author       -- Get username from users table
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.title ILIKE $1 OR p.content ILIKE $1 -- Case-insensitive search on title OR content
        ORDER BY p.updated_at DESC -- Order by most recently updated
        LIMIT 10; -- Limit local results as well
    `;
    const searchTerm = `%${query}%`; // Prepare search term for ILIKE
    console.log("Searching local posts with term:", searchTerm);
    const localPostsPromise = db.query(sqlQuery, [searchTerm]).catch(err => {
      // Log DB errors but don't let them stop the entire search
      console.error("Database Search Error:", err);
      // Return an empty structure matching a successful empty query
      return { rows: [] };
    });

    // --- Wait for both searches to complete ---
    // Use Promise.allSettled if you want to know the status of each promise,
    // or Promise.all if you are handling errors within the .catch blocks above.
    let googleResults, localResults;
    try {
        [googleResults, localResults] = await Promise.all([
            googleBooksPromise,
            localPostsPromise
        ]);
        console.log(`Found ${googleResults?.data?.items?.length ?? 0} Google Books, ${localResults?.rows?.length ?? 0} local posts.`);
    } catch(err) {
        // This catch block might be less likely to hit if individual promises have .catch
        console.error("Error executing parallel searches:", err);
        return []; // Return empty array if Promise.all fails unexpectedly
    }


    // --- Format Google Books Results ---
    const formattedGoogleBooks = (googleResults?.data?.items || []).map((item) => ({
      id: item.id,
      title: item.volumeInfo?.title || "No title available",
      author: item.volumeInfo?.authors ? item.volumeInfo.authors.join(", ") : "Unknown Author",
      description: item.volumeInfo?.description || "No description available.",
      thumbnail: item.volumeInfo?.imageLinks?.thumbnail || item.volumeInfo?.imageLinks?.smallThumbnail || DEFAULT_THUMBNAIL, // Default if missing
      preview_link: item.volumeInfo?.previewLink || null,
      isLocal: false // Flag as NOT local
    }));

    // --- Format Local Posts Results ---
    const formattedLocalPosts = (localResults?.rows || []).map(p => ({
      id: `local-${p.id}`,
      title: p.title,
      author: p.author,
      description: p.content,
      // Use the stored URL if available, otherwise use default
      thumbnail: p.thumbnail_url || DEFAULT_THUMBNAIL, // <-- UPDATED
      preview_link: null,
      isLocal: true,
      createdAt: p.createdAt // Ensure column name is correct if aliased
    }));

    // --- Combine Results (Local posts listed first) ---
    const combinedResults = [...formattedLocalPosts, ...formattedGoogleBooks];

    console.log(`Returning ${combinedResults.length} combined results.`);
    return combinedResults; // Return the single combined array
  }

  // --- Include your other static methods for Book if they exist ---
  // static async addBook({ id, title, author, description, thumbnail, previewLink }) {
  //    // Your logic to add a Google book reference to your DB
  //    console.log("Adding book:", title);
  //    // Example (Ensure your 'books' table exists and matches this structure):
       // const result = await db.query(
       //    `INSERT INTO books (id, title, author, description, thumbnail, preview_link)
       //     VALUES ($1, $2, $3, $4, $5, $6)
       //     ON CONFLICT (id) DO NOTHING -- Avoid duplicates if book already saved
       //     RETURNING id, title`,
       //    [id, title, author, description, thumbnail, previewLink]
       // );
       // return result.rows[0];
  // }

  // static async getSavedBooks() {
  //    // Your logic to get books saved in your 'books' table
  //    console.log("Fetching saved books");
       // Example:
       // const results = await db.query(`SELECT id, title, author, thumbnail FROM books ORDER BY title`);
       // return results.rows;
  // }

}

module.exports = Book;