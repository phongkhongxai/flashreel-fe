// Vite exposes VITE_* values to the browser. Never put secrets here.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "";

// Public settings for the Google authorization-code flow.
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";
export const GOOGLE_REDIRECT_URI =
  import.meta.env.VITE_GOOGLE_REDIRECT_URI?.trim() || "";

export function getApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is missing. Set it in your .env file.");
  }
  return API_BASE_URL;
}
