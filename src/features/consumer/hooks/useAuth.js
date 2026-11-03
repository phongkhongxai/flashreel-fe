import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
function useAuth({ login, register }) {
  const nav = useNavigate(),
    loc = useLocation();
  const [error, setError] = useState("");
  return {
    nav,
    loc,
    error,
    setError,
  };
}
export default useAuth;
