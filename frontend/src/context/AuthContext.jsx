// Authentication & Role Management Context
// Manages real user session, backend health checks, and profile updates

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { api } from '../services/api';
import { getStoredCurrentUser, saveStoredCurrentUser } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState({ isConnected: false, checking: true });

  useEffect(() => {
    // Check if user has an active stored session from previous real login
    const stored = authService.getCurrentUser();
    if (stored) {
      setCurrentUser(stored);
    }

    // Check backend health
    checkHealth();
    setLoading(false);

    // Listen for 401 Unauthorized events from api.js
    const handleUnauthorized = () => {
      setCurrentUser(null);
    };
    window.addEventListener('campusconnect_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('campusconnect_unauthorized', handleUnauthorized);
    };
  }, []);

  const checkHealth = async () => {
    setBackendStatus((prev) => ({ ...prev, checking: true }));
    const result = await api.checkBackendHealth();
    setBackendStatus({ isConnected: result.isConnected, checking: false, data: result.data });
  };

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const register = async (regData) => {
    const res = await authService.register(regData);
    if (res.success) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  // Update user state throughout the application (e.g. after profile picture update)
  const updateUser = (updatedUser) => {
    saveStoredCurrentUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        login,
        register,
        logout,
        updateUser,
        backendStatus,
        checkHealth,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
