// src/pages/SearchResultsPage.jsx

import React, { useEffect, useState } from "react"; // Import React
import { useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext'; // Use context for API calls & apiClient
import Modal from '../pages/Modal'; // Import the Modal component
import styles from './SearchResultsPage.module.css'; // Your existing styles for this page

export default function SearchResultsPage() {
  const { apiClient } = useAuth(); // Get configured client with auth token
  const [books, setBooks] = useState([]); // Will hold combined results
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // State to hold STRING error messages
  const [expandedBooks, setExpandedBooks] = useState(new Set());
  const { search } = useLocation();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  const query = new URLSearchParams(search).get("query");

  // Fetch combined books and posts when query changes
  useEffect(() => {
    async function fetchResults() {
      // If there's no query, don't fetch, show nothing found (or handle differently)
      if (!query) {
        setBooks([]);
        setLoading(false);
        setError("Please enter a search term on the homepage."); // Set informative message
        return;
      }

      setError(''); // Clear previous errors before fetching
      setLoading(true);
      setBooks([]); // Clear previous results

      try {
        console.log(`SearchResultsPage: Fetching results for query "${query}"`);
        // Use apiClient which should have auth headers set by AuthContext
        // The backend GET /books should now require login
        const res = await apiClient.get(`/books?query=${encodeURIComponent(query)}`);
        console.log("SearchResultsPage: API Response OK", res.data);
        setBooks(res.data.books || []); // Assuming backend returns { books: [...] }

      } catch (err) {
        // --- Robust Error Handling ---
        console.error("SearchResultsPage: Error fetching search results (raw error):", err);
        console.error("SearchResultsPage: Error response data:", err.response?.data);

        const errorData = err.response?.data;
        let message = 'Failed to fetch results.'; // Default error message

        // Try to extract a more specific message from the error response
        if (typeof errorData === 'string' && errorData.length > 0) {
            message = errorData;
        } else if (typeof errorData?.message === 'string') { // Check for object with message
            message = errorData.message;
        } else if (typeof errorData?.error === 'string') { // Check for object with error
            message = errorData.error;
        } else if (err?.message) { // Fallback to Axios/generic error message
            // Customize common network/Axios errors if desired
            if (err.message.includes('Network Error')) {
                message = 'Network Error: Could not connect to the server.';
            } else if (err.response?.status === 401) {
                // This might be set here OR handled entirely by the interceptor/logout
                message = 'Authentication error. You might need to log in again.';
            } else {
                 message = err.message; // Default Axios message
            }
        }
        console.log("SearchResultsPage: Setting error state string to:", message);
        setError(message); // Set the state ONLY with the string message
        // --- End Robust Error Handling ---

        setBooks([]); // Clear results on error
      } finally {
        setLoading(false); // Ensure loading is set to false
      }
    }

    fetchResults();
  }, [query, apiClient]); // Dependencies for the effect


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

  // --- Description Snippet Logic ---
  const getDescriptionSnippet = (book) => {
    const description = book.description || "";
    const isExpanded = expandedBooks.has(book.id);
    // Show full content in modal, but truncate in list view if long & not expanded
    if (isExpanded || description.length <= 150) {
      return description;
    }
    return `${description.slice(0, 150)}...`;
  };

   const showReadMore = (book) => {
     const description = book.description || "";
     return description.length > 150;
  }

  // --- Render Logic ---
  // Initial loading state
  if (loading) {
    return <div className={styles.message}>Loading results for "{query}"...</div>;
  }
  // Error display - now guaranteed to be a string
   if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // Main content render
  return (
    <> {/* Fragment allows Modal rendering outside main container */}
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
                <img
                  src={item.thumbnail || '/images/default-post-thumbnail.png'}
                  alt={item.title || 'Cover'}
                  className={styles.bookThumbnail}
                  onError={(e) => { e.target.onerror = null; e.target.src='/images/default-post-thumbnail.png' }}
                />

                <div className={styles.bookInfo}>
                  <h3 className={styles.bookTitle}>
                    {item.title || 'No Title'}
                  </h3>
                  {item.author && (
                    <p className={styles.bookAuthor}>
                      by {item.author}
                    </p>
                  )}

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

                  <div className={styles.bookActions}>
                     {/* Favorite Button Placeholder */}
                     {/* <button className={styles.favoriteButton}>❤️ Favorite</button> */}

                     {/* Conditional Preview Button/Link */}
                    {item.isLocal ? (
                      <button onClick={() => openModal(item)} className={styles.previewButton}>
                         📖 Read Post
                      </button>
                    ) : item.preview_link ? (
                      <a
                        href={item.preview_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.previewLink}
                      >
                        📖 Preview
                      </a>
                    ) : (
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
         {/* WARNING: Sanitize HTML content on backend before using dangerouslySetInnerHTML */}
         <div className={styles.modalBody} dangerouslySetInnerHTML={{ __html: modalContent.content }}></div>
         {/* --- OR --- Render as plain text:
         <div className={styles.modalBody} style={{ whiteSpace: 'pre-wrap' }}>
             {modalContent.content}
         </div>
         */}
      </Modal>
    </>
  );
}