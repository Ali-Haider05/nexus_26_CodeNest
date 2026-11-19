const API_URL = (import.meta.env.VITE_API_URL || 'https://nexus-26-codenest.onrender.com').replace(/\/+$/, '');
const tokenKey = 'campusconnect_token';

export const api = {
  getToken: () => localStorage.getItem(tokenKey),
  setToken(token) {
    if (token) localStorage.setItem(tokenKey, token);
    else localStorage.removeItem(tokenKey);
  },
  async request(path, { method = 'GET', body, authenticated = true, waitForWakeUp = false, credentialCheck = false, responseType = "json" } = {}) {
    const token = authenticated && this.getToken();
    const headers = { Accept: responseType === 'csv' ? 'text/csv' : 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const startedAt = Date.now();
    let response;
    try {
      response = await fetch(API_URL + path, {
        method, headers, body: JSON.stringify(body), signal: AbortSignal.timeout(waitForWakeUp ? 60000 : 20000),
      });
    } catch (error) {
      if (waitForWakeUp) {
        const remaining = 60000 - (Date.now() - startedAt);
        if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      throw new Error(error.name === 'TimeoutError' ? 'The server took too long to respond.' : 'Could not reach the server.');
    }
    if (response.ok && responseType === 'csv') {
      if (!response.headers.get('Content-Type')?.toLowerCase().startsWith('text/csv')) {
        throw new Error('The server did not return a CSV report.');
      }
      const disposition = response.headers.get('Content-Disposition');
      const filename = disposition?.match(/filename="(complaints-report-\d{4}-\d{2}-\d{2}\.csv)"/i)?.[1];
      return { blob: await response.blob(), filename: filename || 'complaints-report.csv' };
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const wrongPassword = credentialCheck && data?.message === 'Current password is incorrect';
      if (response.status === 401 && !wrongPassword && token && this.getToken() === token) {
        this.setToken(null);
        window.dispatchEvent(new CustomEvent('campusconnect_unauthorized'));
      }
      const message = {
        400: data?.message || 'Check the submitted fields and try again.',
        401: wrongPassword ? data.message : authenticated ? 'Your session expired. Please sign in again.' : 'Invalid email or password.',
        403: 'Access denied. Your role cannot perform this action.',
        ...(responseType === 'csv' && { 404: 'CSV download is unavailable. Please try again later.' }),
      }[response.status] || data?.message || 'Request failed (HTTP ' + response.status + ').';
      throw Object.assign(new Error(message), { status: response.status });
    }
    return data;
  },
};
