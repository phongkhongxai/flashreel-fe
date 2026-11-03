import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LANGUAGE_STORAGE_KEY } from "../../../i18n";
import { useAuth } from "../../../auth";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function useLoginPage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const returnTo = location.state?.from?.pathname || "/admin";
  function changeLanguage(event) {
    const nextLanguage = event.target.value;
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }
  function validate(nextIdentifier, nextPassword) {
    const trimmedIdentifier = nextIdentifier.trim();
    if (!trimmedIdentifier) {
      return t("auth.usernameRequired");
    }
    if (
      trimmedIdentifier.includes("@") &&
      !emailPattern.test(trimmedIdentifier)
    ) {
      return t("auth.emailInvalid");
    }
    if (!nextPassword) {
      return t("auth.passwordRequired");
    }
    return "";
  }
  async function submit(event) {
    event.preventDefault();
    const validationError = validate(identifier, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await login(identifier.trim(), password);
      navigate(returnTo, {
        replace: true,
      });
    } catch (requestError) {
      setError(requestError?.message || t("auth.loginFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }
  return {
    t,
    i18n,
    isAuthenticated,
    identifier,
    setIdentifier,
    password,
    setPassword,
    error,
    setError,
    isSubmitting,
    returnTo,
    changeLanguage,
    validate,
    submit,
  };
}
export default useLoginPage;
