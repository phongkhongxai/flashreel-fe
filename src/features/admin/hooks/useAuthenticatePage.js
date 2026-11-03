import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth";
import {
  PKCE_VERIFIER_KEY,
  appendDeepLinkParams,
  readMobileHint,
} from "../../../utils/oauth";
function redirectToAndroid(params) {
  window.location.replace(appendDeepLinkParams(params));
}
function useAuthenticatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loginWithGoogleCode } = useAuth();
  const [status, setStatus] = useState("Completing Google sign-in...");
  const [error, setError] = useState("");
  useEffect(() => {
    let ignore = false;
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const oauthError =
      searchParams.get("error_description") || searchParams.get("error");
    const isMobileCallback = readMobileHint(searchParams, location.pathname);
    async function complete() {
      if (oauthError) {
        if (isMobileCallback) {
          redirectToAndroid({
            error: oauthError,
          });
          return;
        }
        setError(oauthError);
        setStatus("Google sign-in failed");
        return;
      }
      if (!code) {
        const message = "Missing Google authorization code";
        if (isMobileCallback) {
          redirectToAndroid({
            error: message,
          });
          return;
        }
        setError(message);
        setStatus("Google sign-in failed");
        return;
      }
      if (isMobileCallback) {
        redirectToAndroid({
          code,
        });
        return;
      }
      const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
      if (!codeVerifier) {
        setError("Missing PKCE verifier. Please start Google sign-in again.");
        setStatus("Google sign-in failed");
        return;
      }
      const expectedState = sessionStorage.getItem("flashreel_oauth_state");
      if (!expectedState || searchParams.get("state") !== expectedState) {
        setError("Google sign-in state không hợp lệ.");
        setStatus("Google sign-in failed");
        return;
      }
      try {
        await loginWithGoogleCode(code, codeVerifier);
        sessionStorage.removeItem(PKCE_VERIFIER_KEY);
        sessionStorage.removeItem("flashreel_oauth_state");
        const returnTo =
          sessionStorage.getItem("flashreel_oauth_return") || "/admin";
        sessionStorage.removeItem("flashreel_oauth_return");
        if (!ignore)
          navigate(returnTo, {
            replace: true,
          });
      } catch (requestError) {
        if (!ignore) {
          setError(requestError?.message || "Google sign-in failed");
          setStatus("Google sign-in failed");
        }
      }
    }
    complete();
    return () => {
      ignore = true;
    };
  }, [location.pathname, location.search, loginWithGoogleCode, navigate]);
  return {
    location,
    isAuthenticated,
    status,
    error,
  };
}
export default useAuthenticatePage;
