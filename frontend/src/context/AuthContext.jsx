// src/context/AuthContext.jsx

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";

const apiClient = axios.create({
  // Use Vite's env variable system. Fallback to localhost for local dev.
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
});
// Create the context
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
  // Initialize token state *synchronously* from localStorage
  // Use a function within useState to run this logic only once on initial component mount
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("authToken");
    // If a token exists in storage when the app loads/refreshes,
    // configure the apiClient instance's default headers immediately.
    if (savedToken) {
      console.log(
        "AuthContext: Found token in storage on initial load, setting header."
      );
      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${savedToken}`;
    } else {
      console.log("AuthContext: No token found in storage on initial load.");
    }
    return savedToken || null; // Return the found token or null
  });

  // Define logout function using useCallback to keep its reference stable
  // This function just updates the token state, triggering other effects.
  const logout = useCallback(() => {
    console.log("AuthContext: logout() called, setting token state to null.");
    setToken(null);
    // The useEffect below will handle cleanup (localStorage, axios header)
  }, []); // No dependencies, function doesn't change

  // Effect 1: Set up Axios response interceptor to handle 401s
  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      // Function to run on successful responses (just pass it through)
      (response) => response,

      // Function to run on failed responses
      (error) => {
        console.log(
          "Axios Interceptor: Caught error status:",
          error.response?.status
        );
        // Check if the error response exists and has a status of 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
          console.log("Interceptor: Detected 401, triggering logout.");
          // If 401, call the logout function to clear the token state
          logout();
          // Optionally return a more user-friendly error message or let original propagate
          // return Promise.reject(new Error("Session expired or invalid. Please log in again."));
        }
        // For any other errors, just reject the promise so component catch blocks can handle them
        return Promise.reject(error);
      }
    );

    // Cleanup function: Eject the interceptor when the component unmounts
    // or when the logout function reference changes (it shouldn't with useCallback)
    return () => {
      console.log("AuthContext: Ejecting Axios interceptor.");
      apiClient.interceptors.response.eject(interceptor);
    };
  }, [logout]); // Dependency array includes logout

  // Effect 2: Synchronize token state with localStorage and apiClient default headers
  // This runs whenever the 'token' state variable changes.
  useEffect(() => {
    if (token) {
      // If token exists (user logged in or token set)
      console.log(
        "AuthContext: Token state changed [SET], updating storage/header."
      );
      localStorage.setItem("authToken", token);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      // If token is null (user logged out)
      console.log(
        "AuthContext: Token state changed [NULL], removing storage/header."
      );
      localStorage.removeItem("authToken");
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }, [token]); // Dependency array includes token

  // Login function: makes API call, sets token on success
  // Inside AuthContext.jsx
  const login = async (username, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        username,
        password,
      });
      setToken(response.data.token);
      return { success: true };
    } catch (error) {
      // --- Start Revised Catch Block ---
      console.error("Login failed in AuthContext (Raw Error):", error);
      console.error(
        "Login failed in AuthContext (Response Data):",
        error.response?.data
      );

      const errorData = error.response?.data;
      let message = "Login failed. Please check credentials or server status."; // More informative default

      // Check for the nested error structure from your backend error handler
      if (
        errorData &&
        typeof errorData.error === "object" &&
        typeof errorData.error.message === "string"
      ) {
        message = errorData.error.message; // <--- CORRECT EXTRACTION
      }
      // Add other checks if your backend might return errors differently
      else if (typeof errorData?.message === "string") {
        message = errorData.message;
      } else if (typeof errorData === "string") {
        message = errorData;
      } else if (error?.message) {
        // Fallback to Axios/network error message
        message = error.message;
      }

      console.log("AuthContext Login Catch: Returning message:", message);
      // Ensure message is always a string before returning
      return { success: false, message: String(message) };
      // --- End Revised Catch Block ---
    }
  };
  // Signup function: makes API call, then calls login on success
  const signup = async (userData) => {
    try {
      await apiClient.post("/auth/register", userData);
      // Automatically log user in after successful signup
      return await login(userData.username, userData.password);
    } catch (error) {
      console.error(
        "Signup failed in AuthContext:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Signup failed",
      };
    }
  };

  // Value provided by the context
  const value = {
    token,
    login,
    signup,
    logout,
    apiClient, // Expose the configured apiClient instance
  };

  // Return the Provider component
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily consume the context in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
