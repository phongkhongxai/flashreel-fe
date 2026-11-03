import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
function useVerify() {
  const nav = useNavigate(),
    loc = useLocation(),
    [code, setCode] = useState(""),
    [error, setError] = useState("");
  return {
    nav,
    loc,
    code,
    setCode,
    error,
    setError,
  };
}
export default useVerify;
