import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthForm.module.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the 'from' path, default to homepage '/'
  const fromPath = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(data => ({ ...data, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password) {
      setError("Username and password are required.");
      return;
    }
    const result = await login(formData.username, formData.password);
    if (result.success) {
      // --- MODIFICATION START ---
      // Decide where to redirect: If 'from' was '/search', go to '/' instead.
      const redirectTo = fromPath === '/search' ? '/' : fromPath;
      navigate(redirectTo, { replace: true });
      // --- MODIFICATION END ---
    } else {
      setError(result.message || "Invalid username or password.");
    }
  };

  return (
    // ... rest of the JSX remains the same ...
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2>Login</h2>
        {error && <p className={styles.error}>{error}</p>}
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