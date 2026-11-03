export const ACCESS_TOKEN_KEY = "short_video_access_token";
export const AUTH_TOKEN_KEY = "flashreel-admin-token";
export const AUTH_REFRESH_TOKEN_KEY = "flashreel-admin-refresh-token";
export const AUTH_USER_KEY = "flashreel-admin-user";
export const AUTH_SESSION_CHANGED_EVENT = "flashreel-auth-session-changed";
let generation = 0;
const notify = () =>
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
export const tokenStore = {
  getToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null =>
    localStorage.getItem(AUTH_REFRESH_TOKEN_KEY),
  getGeneration: (): number => generation,
  setTokens(accessToken: string, refreshToken: string) {
    if (!accessToken || !refreshToken)
      throw new Error("Missing access or refresh token");
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
    generation++;
    notify();
  },
  rotateTokens(
    accessToken: string,
    refreshToken: string,
    expectedGeneration: number,
  ) {
    if (generation !== expectedGeneration) throw new Error("Session changed");
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
    notify();
  },
  setToken(token: string | null) {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    generation++;
    notify();
  },
  clear() {
    generation++;
    for (const storage of [localStorage, sessionStorage])
      for (const key of [
        ACCESS_TOKEN_KEY,
        AUTH_TOKEN_KEY,
        AUTH_REFRESH_TOKEN_KEY,
        AUTH_USER_KEY,
      ])
        storage.removeItem(key);
    notify();
  },
};
