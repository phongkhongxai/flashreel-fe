const ANDROID_DEEP_LINK = "com.flashreel.app:/oauth2redirect";
export const PKCE_VERIFIER_KEY = "pkce_verifier";
const MOBILE_CLIENT_VALUES = new Set(["android", "mobile"]);
export function appendDeepLinkParams(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  return `${ANDROID_DEEP_LINK}?${query.toString()}`;
}
export function readMobileHint(searchParams, pathname) {
  if (pathname === "/mobile/oauth/callback") return true;
  const client = searchParams.get("client") || searchParams.get("platform");
  if (client && MOBILE_CLIENT_VALUES.has(client.toLowerCase())) return true;
  if (searchParams.get("mobile") === "true") return true;
  return stateRequestsMobile(searchParams.get("state"));
}
function stateRequestsMobile(state) {
  if (!state) return false;
  const normalized = state.trim();
  const candidates = [normalized];
  try {
    candidates.push(atob(normalized.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    // OAuth state is often opaque; only inspect it when it is readable.
  }
  return candidates.some((candidate) => {
    const lowerCandidate = candidate.toLowerCase();
    if (lowerCandidate === "android" || lowerCandidate === "mobile")
      return true;
    if (
      lowerCandidate.includes("client=android") ||
      lowerCandidate.includes("platform=android")
    )
      return true;
    if (
      lowerCandidate.includes('"client":"android"') ||
      lowerCandidate.includes('"platform":"android"')
    )
      return true;
    try {
      const parsed = JSON.parse(candidate);
      return (
        MOBILE_CLIENT_VALUES.has(
          String(parsed.client || parsed.platform || "").toLowerCase(),
        ) || parsed.mobile === true
      );
    } catch {
      return false;
    }
  });
}
