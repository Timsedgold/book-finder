import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthForm.module.css'; // Reuse the shared form style

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  });
  const [error, setError] = useState('');
  const { signup } = useAuth(); // Use signup function from context
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(data => ({ ...data, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Basic validation
    if (!formData.username || !formData.password || !formData.email || !formData.firstName || !formData.lastName) {
       setError("All fields are required.");
       return;
    }
     if (formData.password.length < 5) { // Example: Enforce minimum password length
        setError("Password must be at least 5 characters long.");
        return;
    }

    const result = await signup({
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
    });

    if (result.success) {
      navigate('/'); // Redirect to home on successful signup/login
    } else {
      setError(result.message || "Signup failed. Username or email may already be taken.");
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2>Sign Up</h2>
        {error && <p className={styles.error}>{error}</p>}
        {/* Add inputs for firstName, lastName, email similar to username/password */}
        <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required className={styles.formInput}/>
        </div>
         <div className={styles.formGroup}>
            <label htmlFor="password">Password (min 5 chars)</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required className={styles.formInput}/>
        </div>
         <div className={styles.formGroup}>
            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className={styles.formInput}/>
        </div>
         <div className={styles.formGroup}>
            <label htmlFor="lastName">Last Name</label>
            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className={styles.formInput}/>
        </div>
        <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={styles.formInput}/>
        </div>

        <button type="submit" className={styles.submitButton}>Sign Up</button>
        <p className={styles.switchForm}>
            Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}