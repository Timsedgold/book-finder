// src/pages/HomePage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { useAuth } from '../context/AuthContext'; // Import useAuth
import styles from './HomePage.module.css';

export default function HomePage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { token } = useAuth(); // Get authentication status

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📚 BookFinder</h1>

      {token ? ( // Check if user is logged in
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search for books..."
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>
      ) : (
        // Show login prompt if not logged in
        <p className={styles.loginPrompt}> {/* Add styling for this */}
          Please <Link to="/login" className={styles.promptLink}>Login</Link> or{' '}
          <Link to="/signup" className={styles.promptLink}>Sign Up</Link> to search for books.
        </p>
      )}
    </div>
  );
}