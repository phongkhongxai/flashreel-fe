import { useTranslation } from "react-i18next";
function PolicyCenter() {
  const { t } = useTranslation();
  return (
    <section className="policy">
      <aside className="panel policyList">
        <div className="policyItem on">
          <h2>{t("policy.privacyTitle")}</h2>
          <p>
            {t("policy.published")} · {t("policy.chinese")} · 2026-06-20
          </p>
        </div>
        <div className="policyItem">
          <h2>{t("policy.termsTitle")}</h2>
          <p>
            {t("policy.published")} · {t("policy.chinese")} · 2026-06-20
          </p>
        </div>
        <div className="policyItem">
          <h2>Chính sách quyền riêng tư</h2>
          <p>{t("policy.published")} · Tiếng Việt · 2026-06-20</p>
        </div>
        <div className="policyItem">
          <h2>Privacy Policy</h2>
          <p>{t("policy.published")} · English · 2026-06-20</p>
        </div>
      </aside>
      <main className="card policyEditor">
        <div className="filters">
          <button className="chip on">{t("language.chinese")}</button>
          <button className="chip">{t("language.vietnamese")}</button>
          <button className="chip">{t("language.english")}</button>
        </div>
        <div className="editorGrid">
          <label>
            {t("policy.type")}
            <select>
              <option>{t("policy.privacyOption")}</option>
              <option>{t("policy.termsOption")}</option>
            </select>
          </label>
          <label>
            {t("policy.version")}
            <input value="v1.2" readOnly />
          </label>
        </div>
        <label>
          {t("policy.title")}
          <input value={t("policy.editorTitle")} readOnly />
        </label>
        <label>
          {t("policy.content")}
          <textarea value={t("policy.editorContent")} readOnly />
        </label>
        <div className="publishRow">
          <span className="statusPill">{t("policy.current")}</span>
          <button className="btn primary">
            {t("button.publishNewVersion")}
          </button>
        </div>
      </main>
    </section>
  );
}
export default PolicyCenter;
