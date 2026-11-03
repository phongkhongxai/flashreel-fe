import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth";
import AppRoutes from "./features/admin/components/AppRoutes";
import Consumer from "./features/consumer/components/Consumer";
import "./i18n";
function Root() {
  const { pathname } = useLocation();
  return pathname.startsWith("/admin") ||
    pathname === "/authenticate" ||
    pathname === "/mobile/oauth/callback" ? (
    <AppRoutes />
  ) : (
    <Consumer />
  );
}
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </BrowserRouter>,
);
