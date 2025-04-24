// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthForm.module.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(''); // This state needs a STRING
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(data => ({ ...data, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (!formData.username || !formData.password) {
      setError("Username and password are required.");
      return;
    }

    // Call the login function from context
    const result = await login(formData.username, formData.password);

    if (result.success) {
      // Login succeeded
      const redirectTo = fromPath === '/search' ? '/' : fromPath; // Handle redirect
      navigate(redirectTo, { replace: true });
    } else {
      // --- FIX START ---
      // Login failed, set error state ONLY with the message string
      setError(result.message || "Invalid username or password."); // Use result.message
      // --- FIX END ---
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2>Login</h2>
        {/* This will now correctly render the string error message */}
        {error && <p className={styles.error}>{error}</p>}
        {/* ... rest of the form inputs/button ... */}
         <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>
        <button type="submit" className={styles.submitButton}>Login</button>
         <p className={styles.switchForm}>
            Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}