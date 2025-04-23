// src/pages/AuthorDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthorDashboardPage.module.css'; // Create this CSS Module

export default function AuthorDashboardPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { apiClient } = useAuth(); // Use the configured axios instance

  useEffect(() => {
    const fetchPosts = async () => {
      setError('');
      setLoading(true);
      try {
        // apiClient already has the token header set by AuthContext
        const response = await apiClient.get('/posts');
        setPosts(response.data.posts || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError('Failed to load your posts.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [apiClient]); // Re-run if apiClient changes (shouldn't often)

   const handleDelete = async (postId) => {
      // Add confirmation dialog here for safety
       if (!window.confirm("Are you sure you want to delete this post?")) {
           return;
       }
       try {
            await apiClient.delete(`/posts/${postId}`);
            // Remove the post from the local state
            setPosts(currentPosts => currentPosts.filter(p => p.id !== postId));
       } catch (err) {
           console.error("Error deleting post:", err);
           setError("Failed to delete post.");
       }
   }

  if (loading) return <div className={styles.message}>Loading posts...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.dashboardContainer}>
      <h2>Your Posts</h2>
      <Link to="/author/create" className={styles.createButton}>
        Create New Post
      </Link>

      {posts.length === 0 ? (
        <p className={styles.message}>You haven't written any posts yet.</p>
      ) : (
        <ul className={styles.postList}>
          {posts.map(post => (
            <li key={post.id} className={styles.postItem}>
              <span className={styles.postTitle}>{post.title}</span>
              <div className={styles.postActions}>
                <Link to={`/author/edit/${post.id}`} className={styles.editButton}>
                    Edit
                </Link>
                <button onClick={() => handleDelete(post.id)} className={styles.deleteButton}>
                    Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}