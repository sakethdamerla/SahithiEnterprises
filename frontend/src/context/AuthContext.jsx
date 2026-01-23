import { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Create Auth Context
const AuthContext = createContext(undefined);

/**
 * AuthProvider component that wraps the app and provides authentication state
 * Uses localStorage to persist admin login state across page refreshes
 */
export function AuthProvider({ children }) {
  // Store admin authentication state in localStorage
  const [isAdmin, setIsAdmin] = useLocalStorage('isAdmin', false);
  const [adminUser, setAdminUser] = useLocalStorage('adminUser', null);

  // Invalidate old sessions
  useEffect(() => {
    const AUTH_VERSION = 'v2'; // Increment this to force logout
    const storedVersion = localStorage.getItem('auth_version');

    if (storedVersion !== AUTH_VERSION) {
      if (isAdmin) {
        console.log("Invalidating old session");
        setIsAdmin(false);
        setAdminUser(null);
      }
      localStorage.setItem('auth_version', AUTH_VERSION);
    }
  }, []);

  /**
   * Login function - validates credentials via backend API
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Object} - Result object with success status and message
   */
  const login = async (username, password) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAdmin(true);
        setAdminUser({
          username: data.username,
          role: data.role,
          permissions: data.permissions,
          token: data.token,
          loginTime: new Date().toISOString()
        });
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login Error:', error);
      return { success: false, message: 'Server error or connection failed' };
    }
  };

  /**
   * Logout function - clears admin state
   */
  const logout = () => {
    setIsAdmin(false);
    setAdminUser(null);
  };

  const value = {
    isAdmin,
    adminUser,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use the auth context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
