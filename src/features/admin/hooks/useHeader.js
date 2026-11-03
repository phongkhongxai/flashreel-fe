import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LANGUAGE_STORAGE_KEY } from "../../../i18n";
import { useAuth } from "../../../auth";
function useHeader({ search, onSearch }) {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  function changeLanguage(event) {
    const nextLanguage = event.target.value;
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }
  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout().catch(() =>
        window.alert(
          "Không thể xác nhận đăng xuất trên máy chủ. Phiên trên thiết bị đã được xóa.",
        ),
      );
      navigate("/admin/login", {
        replace: true,
      });
    } finally {
      setIsLoggingOut(false);
    }
  }
  return {
    t,
    i18n,
    user,
    isLoggingOut,
    changeLanguage,
    handleLogout,
  };
}
export default useHeader;
