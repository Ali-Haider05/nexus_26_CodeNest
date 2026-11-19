// Authentication Service
// Communicates with backend authentication and profile endpoints
// No hardcoded credentials, fake users, or mock fallbacks

import { api } from './api';
import { getStoredCurrentUser, saveStoredCurrentUser, clearSession } from './storage';

export const authService = {
  // Login with email and password
  async login(credentials) {
    const { email, password } = credentials;

    const response = await api.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (!response || !response.user) {
      throw new Error('Invalid response structure received from authentication server.');
    }

    if (response.token) {
      api.setToken(response.token);
    }
    saveStoredCurrentUser(response.user);

    return {
      success: true,
      user: response.user,
      token: response.token,
    };
  },

  // Student registration
  async register(registrationData) {
    const response = await api.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });

    if (!response || !response.user) {
      throw new Error('Registration completed but no user record returned from server.');
    }

    if (response.token) {
      api.setToken(response.token);
    }
    saveStoredCurrentUser(response.user);

    return {
      success: true,
      user: response.user,
      token: response.token,
    };
  },

  // Update Profile Picture using backend-supported multipart upload
  async updateProfilePicture(file) {
    if (!file) throw new Error('No image file selected.');

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('profilePicture', file); // accommodate both common parameter conventions

    const response = await api.upload('/api/users/profile-picture', formData);

    const currentUser = getStoredCurrentUser();
    const updatedAvatarUrl = response.avatarUrl || response.profilePicture || response.user?.avatar || response.url;

    if (!updatedAvatarUrl) {
      throw new Error('Server did not return a valid profile image URL.');
    }

    const updatedUser = {
      ...currentUser,
      avatar: updatedAvatarUrl,
      profilePicture: updatedAvatarUrl,
    };

    saveStoredCurrentUser(updatedUser);
    return updatedUser;
  },

  // Logout session
  async logout() {
    try {
      await api.request('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {
      // ignore
    }
    clearSession();
    api.setToken(null);
  },

  // Get current session user from local storage
  getCurrentUser() {
    return getStoredCurrentUser();
  },
};
