import { api } from './api';

async function authenticate(action, body) {
  const { token, user } = await api.request('/api/auth/' + action, {
    method: 'POST', body, authenticated: false, waitForWakeUp: true,
  });
  if (!token || !user) throw new Error('The server did not return a valid session.');
  api.setToken(token);
  return { success: true, user };
}

export const authService = {
  login: ({ email, password }) => authenticate('login', { email, password }),
  register: ({ name, email, password }) => authenticate('register', { name, email, password }),
  getCurrentUser: () => api.request('/api/auth/me'),
  updateAvatar: (avatar_url) => api.request('/api/auth/me/avatar', { method: 'PATCH', body: { avatar_url } }),
  logout: () => api.setToken(null),
};
