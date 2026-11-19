// Centralized API Client & Real Backend Integration Layer
// Handles HTTP communication with the backend Express / Neon PostgreSQL server
// Provides multipart/form-data support for profile picture and original complaint attachments

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : (import.meta.env.PROD ? '' : 'http://localhost:5000');

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.backendHealthy = false;
    this.lastHealthCheck = null;
  }

  getToken() {
    return localStorage.getItem('campusconnect_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('campusconnect_token', token);
    } else {
      localStorage.removeItem('campusconnect_token');
    }
  }

  // Check backend server & Neon PostgreSQL health
  async checkBackendHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const url = `${this.baseUrl}/health`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        this.backendHealthy = data.status === 'ok';
        this.lastHealthCheck = data;
        return { isConnected: true, data };
      }
    } catch {
      this.backendHealthy = false;
    }
    return { isConnected: false, data: null };
  }

  // Core HTTP Request dispatcher with authentication headers, multipart detection, and timeout
  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    const token = this.getToken();

    const headers = { ...options.headers };

    // Set JSON content-type only if body is NOT FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (!headers['Accept']) {
      headers['Accept'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutMs = options.timeout || 15000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.setToken(null);
        window.dispatchEvent(new CustomEvent('campusconnect_unauthorized'));
        const err = new Error('Session expired or unauthorized. Please log in again.');
        err.status = 401;
        throw err;
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        const err = new Error('Access denied. You do not have permission for this resource.');
        err.status = 403;
        throw err;
      }

      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const message = data?.message || data?.error || `Request failed with status ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        const timeoutErr = new Error('Request timed out. The backend server took too long to respond.');
        timeoutErr.status = 408;
        throw timeoutErr;
      }
      throw err;
    }
  }

  // Upload multipart form data (e.g. for image files)
  async upload(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      ...options,
    });
  }
}

export const api = new ApiClient();
