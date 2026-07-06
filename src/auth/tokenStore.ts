export const ACCESS_TOKEN_KEY = 'short_video_access_token';
export const AUTH_TOKEN_KEY = 'flashreel-admin-token';
export const AUTH_REFRESH_TOKEN_KEY = 'flashreel-admin-refresh-token';
export const AUTH_USER_KEY = 'flashreel-admin-user';
export const AUTH_SESSION_CHANGED_EVENT = 'flashreel-auth-session-changed';

let memoryToken: string | null = null;

function notifySessionChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
}

export const tokenStore = {
  getToken(): string | null {
    return memoryToken ||
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      sessionStorage.getItem(AUTH_TOKEN_KEY);
  },
  setToken(token: string | null) {
    memoryToken = token;
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }
    notifySessionChanged();
  },
  clear() {
    memoryToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    notifySessionChanged();
  }
};
