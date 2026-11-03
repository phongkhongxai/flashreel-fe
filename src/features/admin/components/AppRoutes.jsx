import styles from "./Admin.module.css";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import LoginPage from "../../../pages/LoginPage.jsx";
import AuthenticatePage from "../../../pages/AuthenticatePage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
function AppRoutes() {
  return (
    <div className={styles.scope}>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/authenticate" element={<AuthenticatePage />} />
        <Route path="/mobile/oauth/callback" element={<AuthenticatePage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <div>
              Không tìm thấy trang. <a href="/admin">Về admin</a>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
export default AppRoutes;
