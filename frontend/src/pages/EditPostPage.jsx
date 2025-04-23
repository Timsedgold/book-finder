// src/pages/EditPostPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useParams to get ID from URL
import { useAuth } from '../context/AuthContext'; // Context for API calls
import styles from './PostForm.module.css'; // Reuse shared styles

export default function EditPostPage() {
  // State for form inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // For the textarea

  // State for handling loading and errors
  // Separate loading state for initial fetch vs. form submission
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // True initially while fetching
  const [isSubmitting, setIsSubmitting] = useState(false); // For submission state

  // Get the configured API client and navigation hook
  const { apiClient } = useAuth();
  const navigate = useNavigate();
  const { id: postId } = useParams(); // Get the post 'id' from the route parameters (e.g., /author/edit/123)

  // useEffect hook to fetch the post data when the component mounts or postId changes
  useEffect(() => {
    const fetchPost = async () => {
      // Don't attempt fetch if postId isn't available yet (though usually it is)
      if (!postId) {
          setLoading(false);
          setError("Post ID is missing.");
          return;
      };

      setError(''); // Clear previous errors
      setLoading(true);
      try {
        // Make GET request to fetch the specific post
        const response = await apiClient.get(`/posts/${postId}`);
        // Populate the form state with the fetched data
        setTitle(response.data.post.title);
        setContent(response.data.post.content);
      } catch (err) {
        // Handle errors (e.g., post not found, not authorized)
        console.error("Error fetching post:", err);
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to load post for editing.");
        // Optional: Redirect back to dashboard if post isn't found or user isn't authorized
        if (err.response?.status === 404 || err.response?.status === 401) {
          setTimeout(() => navigate('/author'), 2000); // Give user time to see error
        }
      } finally {
        setLoading(false); // Done loading initial data
      }
    };

    fetchPost();
  }, [apiClient, postId, navigate]); // Dependency array

  // Handle form submission for updating the post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }

    setIsSubmitting(true); // Indicate submission is in progress

    try {
      // Make PUT request to update the post
      await apiClient.put(`/posts/${postId}`, { title, content });

      // On success, navigate back to the author dashboard
      navigate('/author');

    } catch (err) {
      // Handle update errors
      console.error("Error updating post:", err);
      setError(err.response?.data?.error || "Failed to update post. Please try again.");
      setIsSubmitting(false); // Turn off submitting state only on error
    }
    // Don't set isSubmitting false on success because we navigate away
  };

  // Show loading state only during the initial fetch
  if (loading) {
      return <div className={styles.message}>Loading post...</div>;
  }

  return (
    <div className={styles.formContainer}>
      <h2>Edit Post</h2>
      <form onSubmit={handleSubmit}>
        {/* Display API errors */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Title Input */}
        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title} // Bind value to state
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.formInput}
            disabled={isSubmitting} // Disable while submitting
          />
        </div>

        {/* Content Textarea */}
        <div className={styles.formGroup}>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content} // Bind value to state
            onChange={(e) => setContent(e.target.value)}
            required
            rows="15" // Adjust height as needed
            className={styles.formTextarea}
            disabled={isSubmitting} // Disable while submitting
          />
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? 'Saving...' : 'Update Post'}
        </button>
      </form>
    </div>
  );
}