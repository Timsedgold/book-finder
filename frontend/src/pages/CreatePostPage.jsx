// src/pages/CreatePostPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './PostForm.module.css';

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState(''); // State for URL input
  // const [imageFile, setImageFile] = useState(null); // --- REMOVE ---
  // const [imagePreview, setImagePreview] = useState(null); // --- REMOVE ---
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { apiClient } = useAuth();
  const navigate = useNavigate();

  // --- REMOVE handleFileChange function ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }
    setLoading(true);

    // --- Create regular JSON object ---
    const postData = {
        title,
        content,
        thumbnailUrl: thumbnailUrl.trim() || null // Send trimmed URL or null
    };
    // -----------------------------------

    try {
      // --- Send JSON data ---
      // Make sure headers are application/json (Axios default for objects)
      await apiClient.post('/posts', postData);
      // ---------------------
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

        {/* Thumbnail URL Input */}
        <div className={styles.formGroup}>
          <label htmlFor="thumbnailUrl">Thumbnail Image URL (Optional)</label>
          <input
            type="url" // Use type="url" for better semantics/validation
            id="thumbnailUrl"
            placeholder="https://example.com/image.jpg"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className={styles.formInput} // Reuse input style
            disabled={loading}
          />
           {/* Optional simple preview if URL is entered */}
           {thumbnailUrl && (
               <div className={styles.imagePreviewContainer}>
                   <img src={thumbnailUrl} alt="Thumbnail preview" className={styles.imagePreview} onError={(e) => e.target.style.display='none'}/>
               </div>
           )}
        </div>

        {/* --- REMOVE file input and preview logic --- */}

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Saving...' : 'Save Post'}
        </button>
      </form>
    </div>
  );
}