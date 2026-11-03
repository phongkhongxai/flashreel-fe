import useHeader from "../features/admin/hooks/useHeader.js";
import PropTypes from "prop-types";
import { Languages, LogOut, Search } from "lucide-react";
export default function Header({ search, onSearch }) {
  const { t, i18n, user, isLoggingOut, changeLanguage, handleLogout } =
    useHeader({
      search,
      onSearch,
    });
  return (
    <header className="top">
      <div>
        <h1>{t("app.title")}</h1>
        <div className="lang">
          {user
            ? t("auth.signedInAs", {
                name: user.displayName || user.email,
              })
            : t("app.subtitle")}
        </div>
      </div>
      <div className="tools">
        <label className="searchBox">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={t("search.placeholder")}
            disabled={isLoggingOut}
          />
        </label>
        <label className="selectBox" aria-label={t("language.label")}>
          <Languages size={17} />
          <select
            value={i18n.resolvedLanguage || i18n.language}
            onChange={changeLanguage}
            disabled={isLoggingOut}
          >
            <option value="en">{t("language.english")}</option>
            <option value="vi">{t("language.vietnamese")}</option>
            <option value="zh">{t("language.chinese")}</option>
          </select>
        </label>
        <button
          className="iconBtn"
          title={isLoggingOut ? t("button.loggingOut") : t("button.logout")}
          aria-label={
            isLoggingOut ? t("button.loggingOut") : t("button.logout")
          }
          disabled={isLoggingOut}
          onClick={handleLogout}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
Header.propTypes = {
  search: PropTypes.string,
  onSearch: PropTypes.func,
};
