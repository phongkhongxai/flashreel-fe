import useLoginPage from "../features/admin/hooks/useLoginPage.js";
import { Navigate } from "react-router-dom";
import { Languages, LogIn, Play, ShieldCheck } from "lucide-react";
export default function LoginPage() {
  const {
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
  } = useLoginPage();
  if (isAuthenticated) {
    return <Navigate to={returnTo} replace />;
  }
  return (
    <main className="loginPage">
      <section className="loginHero" aria-hidden="true">
        <div className="brand loginBrand">
          <div className="mark">
            <Play size={18} fill="currentColor" />
          </div>
          <span>{t("app.brand")}</span>
        </div>
        <div className="loginPreview">
          <ShieldCheck size={42} />
          <h1>{t("app.title")}</h1>
          <p>{t("app.subtitle")}</p>
        </div>
      </section>

      <section className="loginPanel" aria-labelledby="login-title">
        <div className="loginTools">
          <label className="selectBox" aria-label={t("language.label")}>
            <Languages size={17} />
            <select
              value={i18n.resolvedLanguage || i18n.language}
              disabled={isSubmitting}
              onChange={changeLanguage}
            >
              <option value="en">{t("language.english")}</option>
              <option value="vi">{t("language.vietnamese")}</option>
              <option value="zh">{t("language.chinese")}</option>
            </select>
          </label>
        </div>

        <form className="loginForm" onSubmit={submit} noValidate>
          <div>
            <h1 id="login-title">{t("auth.loginTitle")}</h1>
            <p>{t("auth.loginSubtitle")}</p>
          </div>

          <label className="field">
            <span>{t("auth.usernameEmail")}</span>
            <input
              autoComplete="username"
              autoFocus
              disabled={isSubmitting}
              inputMode="email"
              onBlur={() => setError(validate(identifier, password))}
              onChange={(event) => {
                setIdentifier(event.target.value);
                if (error) setError("");
              }}
              placeholder={t("auth.usernameEmailPlaceholder")}
              value={identifier}
            />
          </label>

          <label className="field">
            <span>{t("auth.password")}</span>
            <input
              autoComplete="current-password"
              disabled={isSubmitting}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError("");
              }}
              placeholder={t("auth.passwordPlaceholder")}
              type="password"
              value={password}
            />
          </label>

          {error && (
            <div className="formError" role="alert">
              {error}
            </div>
          )}
          <p className="note">{t("auth.loginHint")}</p>

          <button
            className="btn primary loginButton"
            disabled={isSubmitting}
            type="submit"
          >
            <LogIn size={18} />
            {isSubmitting ? t("button.loggingIn") : t("button.login")}
          </button>
        </form>
      </section>
    </main>
  );
}
