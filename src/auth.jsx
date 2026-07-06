import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authenticateOutbound, login as loginRequest, logout as logoutRequest } from './api/authApi';
import {
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_SESSION_CHANGED_EVENT,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  tokenStore
} from './auth/tokenStore';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const rawUser = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStore.getToken() || localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    function syncSession() {
      setToken(tokenStore.getToken());
      setUser(readStoredUser());
    }

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, syncSession);
    return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, syncSession);
  }, []);

  function persistAuthenticatedSession(auth, fallbackIdentifier = '') {
    const nextToken = auth.accessToken || auth.token;
    if (!nextToken) {
      throw new Error('Authentication response did not include an access token');
    }

    const nextUser = {
      id: auth.username || auth.email || fallbackIdentifier || 'google-user',
      email: auth.email || (fallbackIdentifier.includes('@') ? fallbackIdentifier : ''),
      displayName: auth.username || auth.email || fallbackIdentifier || 'Google user',
      role: 'ADMIN'
    };

    tokenStore.setToken(nextToken);
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    if (auth.refreshToken) {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, auth.refreshToken);
    }
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);

    return nextUser;
  }

  async function login(identifier, password) {
    const auth = await loginRequest(identifier, password);
    return persistAuthenticatedSession(auth, identifier);
  }

  async function loginWithGoogleCode(code, codeVerifier) {
    const auth = await authenticateOutbound(code, codeVerifier);
    return persistAuthenticatedSession(auth);
  }

  async function logout() {
    const currentToken = tokenStore.getToken();
    if (currentToken) {
      await logoutRequest(currentToken).catch(() => {});
    }
    tokenStore.clear();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({
    isAuthenticated: Boolean(token),
    login,
    loginWithGoogleCode,
    logout,
    token,
    user
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
