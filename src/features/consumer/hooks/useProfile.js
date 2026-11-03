import { useState } from "react";
import { useNavigate } from "react-router-dom";
function useProfile({ user, setUser, refresh, language, setLanguage }) {
  const nav = useNavigate(),
    [name, setName] = useState(user?.name || ""),
    [avatar, setAvatar] = useState(null),
    [edit, setEdit] = useState(false);
  return {
    nav,
    name,
    setName,
    avatar,
    setAvatar,
    edit,
    setEdit,
  };
}
export default useProfile;
