import PropTypes from "prop-types";
import { reasonCodes } from "../../../constants/reviewConfig";
export default function ReviewReasonForm({
  t,
  selectedReason,
  isSubmitting,
  onReason,
  customReason,
  onCustomReason,
}) {
  return (
    <section className="card">
      <h2>{t("detail.rejectReason")}</h2>
      <div className="reasons">
        {reasonCodes.map((code) => (
          <button
            key={code}
            className={selectedReason === code ? "reason on" : "reason"}
            disabled={isSubmitting}
            onClick={() => onReason(code)}
          >
            {t(`reason.${code}`)}
          </button>
        ))}
      </div>
      <textarea
        className="textarea"
        value={customReason}
        disabled={isSubmitting}
        onChange={(event) => onCustomReason(event.target.value)}
      />
      <p className="note">{t("detail.rejectNote")}</p>
    </section>
  );
}
ReviewReasonForm.propTypes = {
  t: PropTypes.func,
  selectedReason: PropTypes.string,
  isSubmitting: PropTypes.bool,
  onReason: PropTypes.func,
  customReason: PropTypes.string,
  onCustomReason: PropTypes.func,
};
