import PropTypes from "prop-types";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  authenticateOutbound,
  login as loginRequest,
  logout as logoutRequest,
} from "./services/authApi";
import { getMyInfo } from "./services/userApi";
import {
  AUTH_SESSION_CHANGED_EVENT,
  AUTH_USER_KEY,
  tokenStore,
} from "./auth/tokenStore";
const AuthContext = createContext(null);
function readUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
  } catch {
    return null;
  }
}
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStore.getToken());
  const [user, setUser] = useState(readUser);
  useEffect(() => {
    const sync = () => {
      setToken(tokenStore.getToken());
      setUser(readUser());
    };
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, sync);
    return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, sync);
  }, []);
  async function persist(pair, expectedGeneration) {
    if (tokenStore.getGeneration() !== expectedGeneration)
      throw Error("Session changed");
    if (!pair.accessToken || !pair.refreshToken)
      throw Error("Authentication response did not include both tokens");
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    tokenStore.setTokens(pair.accessToken, pair.refreshToken);
    const generation = tokenStore.getGeneration();
    try {
      const profile = await getMyInfo();
      if (generation !== tokenStore.getGeneration())
        throw Error("Session changed");
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
      setUser(profile);
      return profile;
    } catch (error) {
      if (generation === tokenStore.getGeneration()) tokenStore.clear();
      throw error;
    }
  }
  const login = useCallback(async (username, password) => {
    const generation = tokenStore.getGeneration();
    return persist(await loginRequest(username, password), generation);
  }, []);
  const loginWithGoogleCode = useCallback(async (code, verifier) => {
    const generation = tokenStore.getGeneration();
    return persist(await authenticateOutbound(code, verifier), generation);
  }, []);
  async function logout() {
    const accessToken = tokenStore.getToken(),
      refreshToken = tokenStore.getRefreshToken();
    tokenStore.clear();
    setUser(null);
    if (refreshToken) await logoutRequest(undefined, refreshToken);
    else if (accessToken) await logoutRequest(accessToken, undefined);
  }
  function updateUser(profile) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
    setUser(profile);
  }
  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      login,
      loginWithGoogleCode,
      logout,
      token,
      user,
      updateUser,
    }),
    [token, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
AuthProvider.propTypes = { children: PropTypes.node };
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within AuthProvider");
  return context;
}
