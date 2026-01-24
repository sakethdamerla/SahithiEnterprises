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

  // Invalidate old sessions and check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Version Check
      const AUTH_VERSION = 'v2';
      const storedVersion = localStorage.getItem('auth_version');
      if (storedVersion !== AUTH_VERSION) {
        if (isAdmin) {
          console.log("Invalidating old session version");
          setIsAdmin(false);
          setAdminUser(null);
        }
        localStorage.setItem('auth_version', AUTH_VERSION);
        return;
      }

      // 2. Token Validity Check & Permission Refresh
      if (isAdmin && adminUser?.token) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${adminUser.token}`
            }
          });

          if (res.ok) {
            const freshUserData = await res.json();
            // Preserve the token, update everything else (permissions, role, etc)
            setAdminUser(prev => ({
              ...prev,
              ...freshUserData,
              // Ensure token isn't overwritten if backend doesn't send it (it usually doesn't for /me)
              token: prev.token
            }));
          } else {
            // Token invalid or user deleted
            console.warn("Session invalid, logging out");
            logout();
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          // Optional: decide if you want to logout on connection error or keep offline session
        }
      }
    };

    checkAuth();
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
