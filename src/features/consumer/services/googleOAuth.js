import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from "../../../config/env";
const encode = (bytes) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
export async function startGoogleLogin(returnTo = "/") {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI)
    throw Error("Cần cấu hình Google OAuth client ID và redirect URI.");
  const verifier = encode(crypto.getRandomValues(new Uint8Array(32))),
    state = encode(crypto.getRandomValues(new Uint8Array(24)));
  const challenge = encode(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)),
    ),
  );
  sessionStorage.setItem("pkce_verifier", verifier);
  sessionStorage.setItem("flashreel_oauth_state", state);
  sessionStorage.setItem(
    "flashreel_oauth_return",
    returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/",
  );
  const q = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
  });
  window.location.assign("https://accounts.google.com/o/oauth2/v2/auth?" + q);
}
