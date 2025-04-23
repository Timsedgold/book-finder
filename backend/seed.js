"use strict";
const axios = require("axios");
require("dotenv").config();
const db = require("./db");
const Book = require("./models/books"); // Import the model

const API_KEY = process.env.API_KEY;

async function fetchBooks(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10&key=${API_KEY}`;
  try {
    const response = await axios.get(url);
    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

async function insertBooks(books) {
  for (let book of books) {
    const { volumeInfo } = book;
    const { title, authors, description, imageLinks, previewLink } = volumeInfo;
    const thumbnail = imageLinks ? imageLinks.thumbnail : null;

    try {
      const insertedBook = await Book.add({
        title,
        author: authors ? authors.join(", ") : "Unknown",
        description: description || "No description",
        thumbnail,
        previewLink,
      });

      if (insertedBook) {
        console.log("Inserted book:", insertedBook.title);
      }
    } catch (error) {
      console.error("Error inserting book:", error);
    }
  }
}

async function seedDatabase() {
  try {
    const books = await fetchBooks("harry potter");
    if (books.length > 0) {
      await insertBooks(books);
    } else {
      console.log("No books found to insert.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await db.end();
    console.log("Database connection closed.");
  }
}

seedDatabase();
