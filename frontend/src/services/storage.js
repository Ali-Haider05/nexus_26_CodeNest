// Session Storage Engine
// Manages authenticated user session and token storage without dummy or hardcoded records

const STORAGE_KEYS = {
  CURRENT_USER: 'campusconnect_current_user',
  TOKEN: 'campusconnect_token',
};

export function getStoredCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}
