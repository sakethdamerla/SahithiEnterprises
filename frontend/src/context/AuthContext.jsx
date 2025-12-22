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

  /**
   * Login function - validates credentials and sets admin state
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {boolean} - True if login successful, false otherwise
   */
  const login = (username, password) => {
    // Hard-coded credentials for client-side demo
    // TODO: Replace with real backend authentication (JWT/sessions)
    const validUsername = 'admin';
    const validPassword = 'admin123';

    if (username === validUsername && password === validPassword) {
      setIsAdmin(true);
      setAdminUser({ username, loginTime: new Date().toISOString() });
      return true;
    }
    return false;
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
