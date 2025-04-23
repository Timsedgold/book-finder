import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps routes that require authentication
export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation(); // Get current location

  if (!token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to in the state. This allows us to send them back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token exists, render the child component (the actual page)
  return children;
}