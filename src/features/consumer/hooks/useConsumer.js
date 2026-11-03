import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth";
function useConsumer() {
  const nav = useNavigate(),
    loc = useLocation(),
    auth = useAuth();
  const [version, setVersion] = useState(0),
    [language, setLanguage] = useState("vi");
  const refresh = () => setVersion((v) => v + 1);
  const requireUser = (path) => {
    if (auth.user) {
      nav(path);
      return true;
    }
    nav("/login", { state: { from: path } });
    return false;
  };
  const login = async (username, password) => {
    await auth.login(username, password);
    nav(loc.state?.from || "/", { replace: true });
    refresh();
  };
  const user = auth.user
    ? {
        ...auth.user,
        name: auth.user.nickname || auth.user.displayName || auth.user.username,
        avatar: auth.user.avatarUrl,
      }
    : null;
  const common = {
    user,
    refresh,
    version,
    requireUser,
    login,
    setUser: auth.updateUser,
    language,
    setLanguage,
    logout: auth.logout,
  };
  return { loc, refresh, requireUser, common };
}
export default useConsumer;
