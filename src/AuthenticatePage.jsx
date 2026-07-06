import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useAuth } from './auth';

const ANDROID_DEEP_LINK = 'com.flashreel.app:/oauth2redirect';
const PKCE_VERIFIER_KEY = 'pkce_verifier';
const MOBILE_CLIENT_VALUES = new Set(['android', 'mobile']);

function appendDeepLinkParams(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  return `${ANDROID_DEEP_LINK}?${query.toString()}`;
}

function readMobileHint(searchParams, pathname) {
  if (pathname === '/mobile/oauth/callback') return true;

  const client = searchParams.get('client') || searchParams.get('platform');
  if (client && MOBILE_CLIENT_VALUES.has(client.toLowerCase())) return true;
  if (searchParams.get('mobile') === 'true') return true;

  return stateRequestsMobile(searchParams.get('state'));
}

function stateRequestsMobile(state) {
  if (!state) return false;
  const normalized = state.trim();
  const candidates = [normalized];

  try {
    candidates.push(atob(normalized.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    // OAuth state is often opaque; only inspect it when it is readable.
  }

  return candidates.some((candidate) => {
    const lowerCandidate = candidate.toLowerCase();
    if (lowerCandidate === 'android' || lowerCandidate === 'mobile') return true;
    if (lowerCandidate.includes('client=android') || lowerCandidate.includes('platform=android')) return true;
    if (lowerCandidate.includes('"client":"android"') || lowerCandidate.includes('"platform":"android"')) return true;

    try {
      const parsed = JSON.parse(candidate);
      return MOBILE_CLIENT_VALUES.has(String(parsed.client || parsed.platform || '').toLowerCase()) || parsed.mobile === true;
    } catch {
      return false;
    }
  });
}

function redirectToAndroid(params) {
  window.location.replace(appendDeepLinkParams(params));
}

export default function AuthenticatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loginWithGoogleCode } = useAuth();
  const [status, setStatus] = useState('Completing Google sign-in...');
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error_description') || searchParams.get('error');
    const isMobileCallback = readMobileHint(searchParams, location.pathname);

    async function complete() {
      if (oauthError) {
        if (isMobileCallback) {
          redirectToAndroid({ error: oauthError });
          return;
        }
        setError(oauthError);
        setStatus('Google sign-in failed');
        return;
      }

      if (!code) {
        const message = 'Missing Google authorization code';
        if (isMobileCallback) {
          redirectToAndroid({ error: message });
          return;
        }
        setError(message);
        setStatus('Google sign-in failed');
        return;
      }

      if (isMobileCallback) {
        redirectToAndroid({ code });
        return;
      }

      const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
      if (!codeVerifier) {
        setError('Missing PKCE verifier. Please start Google sign-in again.');
        setStatus('Google sign-in failed');
        return;
      }

      try {
        await loginWithGoogleCode(code, codeVerifier);
        sessionStorage.removeItem(PKCE_VERIFIER_KEY);
        if (!ignore) navigate('/', { replace: true });
      } catch (requestError) {
        if (!ignore) {
          setError(requestError?.message || 'Google sign-in failed');
          setStatus('Google sign-in failed');
        }
      }
    }

    complete();
    return () => {
      ignore = true;
    };
  }, [location.pathname, location.search, loginWithGoogleCode, navigate]);

  if (isAuthenticated && !location.search) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="authCallbackPage">
      <div className="brand">
        <div className="mark"><Play size={18} fill="currentColor" /></div>
        <span>FlashReel</span>
      </div>
      <section className="authCallbackPanel" aria-live="polite">
        <h1>{error ? 'Sign-in could not be completed' : status}</h1>
        <p>{error || 'You can close this tab after the redirect finishes.'}</p>
      </section>
    </main>
  );
}
