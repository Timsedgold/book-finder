// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./pages/NavBar";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./context/ProtectedRoute";
import AuthorDashboardPage from "./pages/AuthorDashboardPage";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={ <ProtectedRoute> <SearchResultsPage /> </ProtectedRoute> } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Author Routes */}
          <Route path="/author" element={ <ProtectedRoute> <AuthorDashboardPage /> </ProtectedRoute> } />
          <Route path="/author/create" element={ <ProtectedRoute> <CreatePostPage /> </ProtectedRoute> } />
          <Route path="/author/edit/:id" element={ <ProtectedRoute> <EditPostPage /> </ProtectedRoute> } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}