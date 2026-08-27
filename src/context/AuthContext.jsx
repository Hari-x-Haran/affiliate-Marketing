import React, { createContext, useState, useContext, useEffect } from 'react';
import { getStorage, setStorage, removeStorage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = getStorage('currentAffiliateUser', null);
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setLoading(false);
  }, []);

  /**
   * Registers a new user.
   * @param {string} userId 
   * @param {string} password 
   * @returns {{ success: boolean, message: string }}
   */
  const register = (userId, password) => {
    const trimmedId = userId.trim();
    if (!trimmedId) {
      return { success: false, message: 'User ID cannot be empty.' };
    }
    if (!password) {
      return { success: false, message: 'Password cannot be empty.' };
    }

    const users = getStorage('affiliateUsers', []);
    
    // Check if user ID is taken (case-insensitive checking is safer, or exact matching)
    const userExists = users.some(u => u.userId.toLowerCase() === trimmedId.toLowerCase());
    if (userExists) {
      return { success: false, message: 'User ID is already taken.' };
    }

    const newUser = { userId: trimmedId, password };
    users.push(newUser);
    
    if (setStorage('affiliateUsers', users)) {
      return { success: true, message: 'Registration successful!' };
    } else {
      return { success: false, message: 'Storage error. Registration failed.' };
    }
  };

  /**
   * Logs in a user.
   * @param {string} userId 
   * @param {string} password 
   * @returns {{ success: boolean, message: string }}
   */
  const login = (userId, password) => {
    const trimmedId = userId.trim();
    if (!trimmedId || !password) {
      return { success: false, message: 'Please enter both User ID and password.' };
    }

    const users = getStorage('affiliateUsers', []);
    const matchedUser = users.find(
      u => u.userId.toLowerCase() === trimmedId.toLowerCase() && u.password === password
    );

    if (!matchedUser) {
      return { success: false, message: 'Invalid User ID or Password.' };
    }

    // Save logged-in user (only store public profile info, e.g. userId, for safety)
    const sessionUser = { userId: matchedUser.userId };
    if (setStorage('currentAffiliateUser', sessionUser)) {
      setCurrentUser(sessionUser);
      return { success: true, message: 'Login successful!' };
    } else {
      return { success: false, message: 'Storage error. Login failed.' };
    }
  };

  /**
   * Logs out the current user.
   */
  const logout = () => {
    removeStorage('currentAffiliateUser');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    isAuthenticated: !!currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
