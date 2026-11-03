import { getVideoTitle } from "../../../utils/reviewVideo";
import PropTypes from "prop-types";
function ReviewVideoInfo({ video, t, rejectionReason }) {
  return (
    <section className="card">
      <h2>{t("detail.videoInfo")}</h2>
      <div className="kv">
        <span>{t("detail.title")}</span>
        <strong>{getVideoTitle(video, t)}</strong>
        <span>{t("detail.author")}</span>
        <strong>
          {video.author} · {video.email}
        </strong>
        <span>{t("detail.file")}</span>
        <strong>{video.file}</strong>
        <span>{t("detail.uploadedAt")}</span>
        <strong>{video.uploadedAt}</strong>
        <span>{t("detail.publicStatus")}</span>
        <strong>
          {video.status === "APPROVED"
            ? t("detail.published")
            : t("detail.pendingRanking")}
        </strong>
        {rejectionReason && (
          <>
            <span>{t("detail.rejectReason")}</span>
            <strong>{rejectionReason}</strong>
          </>
        )}
      </div>
    </section>
  );
}
ReviewVideoInfo.propTypes = {
  video: PropTypes.object,
  t: PropTypes.func,
  rejectionReason: PropTypes.string,
};
export default ReviewVideoInfo;
