// src/pages/SearchResultsPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext'; // Use context for API calls
import Modal from '../pages/Modal'; // Import the Modal component
import styles from './SearchResultsPage.module.css'; // Your existing styles

export default function SearchResultsPage() {
  const { apiClient } = useAuth(); // Get configured client with auth token
  const [books, setBooks] = useState([]); // Will hold combined results
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBooks, setExpandedBooks] = useState(new Set()); // For description expansion
  const { search } = useLocation();

  // --- Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  // --------------------

  const query = new URLSearchParams(search).get("query");

  // Fetch combined books and posts
  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setBooks([]);
        setLoading(false);
        return;
      }
      setError('');
      setLoading(true);
      try {
        // GET /books now returns combined results from backend
        const res = await apiClient.get(`/books?query=${encodeURIComponent(query)}`);
        setBooks(res.data.books || []);
      } catch (err) {
        console.error("Error fetching search results (raw error):", err); // Log raw error
        console.error("Error response data:", err.response?.data);     // Log response data
    
        // --- START REPLACE ---
        let message = 'Failed to fetch results.'; // Default message
        const errorData = err.response?.data;
    
        if (typeof errorData === 'string' && errorData.length > 0) { // Check if errorData itself is a non-empty string
            message = errorData;
        } else if (typeof errorData?.message === 'string') { // Check for object with message property
            message = errorData.message;
        } else if (typeof errorData?.error === 'string') { // Check for object with error property
            message = errorData.error;
        } else if (err?.message) { // Fallback to Axios or generic error message
            message = err.message;
        }
        console.log("Setting error state string to:", message); // Log the message being set
        setError(message); // Ensure 'message' is definitely a string
        setBooks([]); // Clear results on error
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [query, apiClient]); // Re-fetch if query or apiClient changes


  // --- Toggle Description Expansion ---
  const toggleExpand = (id) => {
    const newSet = new Set(expandedBooks);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedBooks(newSet);
  };

  // --- Modal Control Functions ---
  const openModal = (book) => {
    setModalContent({
      title: book.title,
      content: book.description // For local posts, this holds the full content
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent({ title: '', content: '' });
  };
  // -----------------------------

  // --- Description Snippet Logic (Truncate if needed, don't truncate modal content) ---
  const getDescriptionSnippet = (book) => {
    const description = book.description || "";
    const isExpanded = expandedBooks.has(book.id);

    // Always show full content in modal preview, truncate in list view if long
    if (isExpanded || description.length <= 150) {
      return description;
    }
    return `${description.slice(0, 150)}...`;
  };

   const showReadMore = (book) => {
     const description = book.description || "";
     return description.length > 150;
  }
  // --------------------------------

  // --- Render Logic ---
  if (loading) {
    return <div className={styles.message}>Loading results...</div>; // Use a shared message style?
  }
   if (error) {
    return <div className={styles.error}>{error}</div>; // Use a shared error style
  }

  return (
    <> {/* Render Modal outside the main container flow */}
      <div className={styles.resultsContainer}>
        <h2 className={styles.resultsTitle}>
          Search results for: <span className={styles.queryHighlight}>{query}</span>
        </h2>

        {books.length === 0 ? (
          <p className={styles.textMuted}>No books or posts found matching your query.</p>
        ) : (
          <div className={styles.booksGrid}>
            {/* Map over combined books and posts */}
            {books.map((item) => (
              item && <div key={item.id} className={styles.bookCard}>
                {/* Use item thumbnail (will be default for local posts) */}
                <img
                  // Use default if thumbnail is null/empty, or if explicitly local?
                  // Backend should provide the default path in item.thumbnail for local posts
                  src={item.thumbnail || '/images/default-post-thumbnail.png'}
                  alt={item.title || 'Cover'}
                  className={styles.bookThumbnail}
                  // Add error handling for broken image links if needed
                  onError={(e) => { e.target.onerror = null; e.target.src='/images/default-post-thumbnail.png' }}
                />

                <div className={styles.bookInfo}>
                  <h3 className={styles.bookTitle}>
                    {item.title || 'No Title'}
                  </h3>
                  {/* Author: Google Book authors or local post username */}
                  {item.author && (
                    <p className={styles.bookAuthor}>
                      by {item.author}
                    </p>
                  )}

                  {/* Description/Content Snippet */}
                  <p className={styles.bookDescription}>
                     {getDescriptionSnippet(item)}
                     {showReadMore(item) && (
                        <span
                          onClick={() => toggleExpand(item.id)}
                          className={styles.readMoreLink}
                        >
                          {expandedBooks.has(item.id) ? " Show less" : " Read more"}
                        </span>
                      )}
                  </p>

                  {/* Action Buttons */}
                  <div className={styles.bookActions}>
                     {/* Add Favorite functionality here if needed */}
                     {/* <button className={styles.favoriteButton}>❤️ Favorite</button> */}

                     {/* Conditional Preview Button/Link */}
                    {item.isLocal ? (
                      // Local post: Button opens modal
                      <button onClick={() => openModal(item)} className={styles.previewButton}>
                         📖 Read Post
                      </button>
                    ) : item.preview_link ? (
                      // Google Book: Link opens in new tab
                      <a
                        href={item.preview_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.previewLink}
                      >
                        📖 Preview
                      </a>
                    ) : (
                      // No preview available for this Google Book
                      <span className={styles.noPreview}>Preview not available</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Definition */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={modalContent.title}>
         {/* Render post content from state.
             WARNING: Only use dangerouslySetInnerHTML if you are CERTAIN the HTML
             coming from modalContent.content (your 'posts' table) is properly
             SANITIZED on the backend before saving/sending. Otherwise, prefer
             rendering as plain text to prevent XSS attacks. */}
         <div className={styles.modalBody} dangerouslySetInnerHTML={{ __html: modalContent.content }}></div>
         {/* --- OR --- Render as plain text (safer if not sanitized HTML):
         <div className={styles.modalBody} style={{ whiteSpace: 'pre-wrap' }}>
             {modalContent.content}
         </div>
         */}
      </Modal>
    </>
  );
}