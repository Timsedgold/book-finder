// src/pages/CreatePostPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './PostForm.module.css';

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null); // State for the image file
  const [imagePreview, setImagePreview] = useState(null); // State for image preview URL
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { apiClient } = useAuth();
  const navigate = useNavigate();

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // Example: 5MB size limit check on frontend
            setError("File is too large. Maximum size is 5MB.");
            setImageFile(null);
            setImagePreview(null);
            e.target.value = null; // Clear the input
            return;
        }
        if (!file.type.startsWith('image/')) {
             setError("Invalid file type. Please upload an image.");
             setImageFile(null);
             setImagePreview(null);
             e.target.value = null; // Clear the input
             return;
        }

      setImageFile(file);
      // Create a temporary URL for preview
      setImagePreview(URL.createObjectURL(file));
      setError(''); // Clear errors on valid file selection
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Clean up object URL when component unmounts or file changes
  React.useEffect(() => {
      return () => {
          if(imagePreview) {
              URL.revokeObjectURL(imagePreview);
          }
      }
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }
    setLoading(true);

    // --- Use FormData for file uploads ---
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (imageFile) {
      // Use the key 'thumbnailImage' matching multer config on backend
      formData.append('thumbnailImage', imageFile);
    }
    // ------------------------------------

    try {
      // Send FormData - Axios might set Content-Type automatically,
      // but sometimes removing it helps it set the boundary correctly.
      // Don't manually set 'multipart/form-data' here if using Axios with FormData.
      await apiClient.post('/posts', formData);
      navigate('/author');
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to create post.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Create New Post</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}
        {/* Title Input */}
        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.formInput}
            disabled={loading}
          />
        </div>

        {/* Content Textarea */}
        <div className={styles.formGroup}>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="10"
            className={styles.formTextarea}
            disabled={loading}
          />
        </div>

        {/* Thumbnail File Input */}
        <div className={styles.formGroup}>
          <label htmlFor="thumbnailImage">Thumbnail Image (Optional, Max 5MB)</label>
          <input
            type="file"
            id="thumbnailImage"
            name="thumbnailImage" // Name attribute can be useful
            accept="image/png, image/jpeg, image/gif, image/webp" // Specify accepted types
            onChange={handleFileChange}
            className={styles.formInput} // You might want a different style for file inputs
            disabled={loading}
          />
          {/* Image Preview */}
          {imagePreview && (
            <div className={styles.imagePreviewContainer}> {/* Style this container */}
               <img src={imagePreview} alt="Thumbnail preview" className={styles.imagePreview}/>
            </div>
           )}
        </div>

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Saving...' : 'Save Post'}
        </button>
      </form>
    </div>
  );
}