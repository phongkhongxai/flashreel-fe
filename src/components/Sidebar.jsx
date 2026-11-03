import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Eye, FileText, Play, Video } from "lucide-react";
export default function Sidebar({ view, onView }) {
  const { t } = useTranslation();
  const items = [
    ["review", Video, t("nav.review")],
    ["detail", Eye, t("nav.detail")],
    ["policies", FileText, t("nav.policies")],
  ];
  return (
    <aside className="side">
      <div className="brand">
        <div className="mark">
          <Play size={18} fill="currentColor" />
        </div>
        <span>{t("app.brand")}</span>
      </div>
      <nav className="nav">
        {items.map(([key, Icon, label]) => (
          <button
            key={key}
            className={view === key ? "on" : ""}
            onClick={() => onView(key)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

Sidebar.propTypes = { view: PropTypes.string, onView: PropTypes.func };
