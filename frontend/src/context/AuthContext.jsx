// Authentication & Role Management Context
// Manages the signed-in user session

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    let active = true;
    if (api.getToken()) {
      authService.getCurrentUser()
        .then((user) => { if (active) setCurrentUser(user); })
        .catch((error) => { if (active) setSessionError(error.message); })
        .finally(() => { if (active) setLoading(false); });
    } else {
      setLoading(false);
    }

    // Listen for 401 Unauthorized events from api.js
    const handleUnauthorized = () => {
      setCurrentUser(null);
      setSessionError("Your session expired. Please sign in again.");
    };
    window.addEventListener('campusconnect_unauthorized', handleUnauthorized);
    return () => {
      active = false;
      window.removeEventListener('campusconnect_unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success) {
      setSessionError('');
      setCurrentUser(res.user);
    }
    return res;
  };

  const register = async (regData) => {
    const res = await authService.register(regData);
    if (res.success) {
      setSessionError('');
      setCurrentUser(res.user);
    }
    return res;
  };

  const updateAvatar = async (avatarUrl) => {
    const token = api.getToken();
    const user = await authService.updateAvatar(avatarUrl);
    if (api.getToken() === token) setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        login,
        register,
        logout,
        updateAvatar,
        sessionError,
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
