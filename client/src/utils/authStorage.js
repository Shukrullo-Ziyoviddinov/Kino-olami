export const AUTH_TOKEN_KEY = 'violet_auth_token';
export const PROFILE_STORAGE_KEY = 'violet_profile';
const AUTH_SESSION_EVENT = 'auth-session-changed';
let inMemoryToken = '';

const notifyAuthSessionChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
  }
};

export const getAuthToken = () => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || inMemoryToken;
  } catch {
    return inMemoryToken;
  }
};

export const isAuthenticated = () => Boolean(getAuthToken());

export const saveAuthSession = ({ token, user }) => {
  if (token) {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      inMemoryToken = '';
    } catch {
      // The current page can use its session even when iframe storage is blocked.
      inMemoryToken = token;
    }
  }

  if (user) {
    const profilePayload = {
      name: user.firstName || '',
      surname: user.lastName || '',
      phone: user.phone || '',
      avatar: user.avatar ?? null,
    };
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profilePayload));
    } catch {
      // Profile caching is optional when browser storage is unavailable.
    }
  }

  notifyAuthSessionChanged();
};

export const clearAuthSession = () => {
  inMemoryToken = '';
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Storage may be blocked in a third-party iframe.
  }
  notifyAuthSessionChanged();
};

export const AUTH_SESSION_CHANGED_EVENT = AUTH_SESSION_EVENT;
