import useAuthenticatePage from "../features/admin/hooks/useAuthenticatePage.js";
import { Navigate } from "react-router-dom";
import { Play } from "lucide-react";
export default function AuthenticatePage() {
  const { location, isAuthenticated, status, error } = useAuthenticatePage();
  if (isAuthenticated && !location.search) {
    return <Navigate to="/admin" replace />;
  }
  return (
    <main className="authCallbackPage">
      <div className="brand">
        <div className="mark">
          <Play size={18} fill="currentColor" />
        </div>
        <span>FlashReel</span>
      </div>
      <section className="authCallbackPanel" aria-live="polite">
        <h1>{error ? "Sign-in could not be completed" : status}</h1>
        <p>{error || "You can close this tab after the redirect finishes."}</p>
      </section>
    </main>
  );
}
