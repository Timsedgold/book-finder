import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './NavBar.module.css'; // Create NavBar.module.css for styling

export default function NavBar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home after logout
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>📚 BookFinder</Link>
      <div className={styles.navLinks}>
        {token ? (
          <>
          <Link to="/author" className={styles.navLink}>Author Dashboard</Link> 
          {/* <Link to="/favorites" className={styles.navLink}>My Favorites</Link>
            {/* Optional: Link to a user profile or favorites page */}
            {/* <Link to="/favorites" className={styles.navLink}>My Favorites</Link> */}
            <button onClick={handleLogout} className={styles.navButton}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.navLink}>Login</Link>
            <Link to="/signup" className={styles.navLink}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}