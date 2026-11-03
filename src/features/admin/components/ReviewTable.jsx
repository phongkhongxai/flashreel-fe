import { formatNumber } from "../../../utils/formatters";
import { getVideoTitle } from "../../../utils/reviewVideo";
import StatusBadge from "../../../components/StatusBadge";
import Thumbnail from "../../../components/Thumbnail";
import PropTypes from "prop-types";
import { useMemo } from "react";
import Avatar from "../../../components/Avatar";
import { adminGetVideos } from "../../../services/adminVideoApi";
import { statusToApi } from "../../../constants/reviewConfig";
function ReviewTable({
  error,
  isLoading,
  videos,
  onOpen,
  t,
  i18n,
  status,
  pageInfo,
}) {
  const refreshAvatar = useMemo(() => {
    let pending;
    return async (videoId) => {
      if (!pending) {
        pending = adminGetVideos({
          status: statusToApi[status],
          page: pageInfo.page,
          size: pageInfo.size,
        }).finally(() => {
          pending = null;
        });
      }
      const page = await pending;
      return page.content?.find((item) => item.id === videoId)?.authorAvatar;
    };
  }, [status, pageInfo.page, pageInfo.size]);
  return (
    <div className="tableWrap">
      {error && (
        <div className="formError tableError" role="alert">
          {error}
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>{t("table.video")}</th>
            <th>{t("table.author")}</th>
            <th>{t("table.uploadedAt")}</th>
            <th>{t("table.status")}</th>
            <th>{t("table.metrics")}</th>
            <th>{t("table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan="6" className="empty">
                {t("table.loading")}
              </td>
            </tr>
          )}
          {!isLoading &&
            videos.map((videoItem) => (
              <tr key={videoItem.id}>
                <td>
                  <div className="videoCell">
                    <Thumbnail
                      palette={videoItem.palette}
                      coverUrl={videoItem.coverUrl}
                    />
                    <div>
                      <strong>{getVideoTitle(videoItem, t)}</strong>
                      <br />
                      <small>{videoItem.file}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="user">
                    <Avatar
                      className="avatar"
                      name={videoItem.author}
                      src={videoItem.authorAvatar}
                      onRefresh={() => refreshAvatar(videoItem.id)}
                    />

                    <div>
                      {videoItem.author}
                      <br />
                      <small>{videoItem.email}</small>
                    </div>
                  </div>
                </td>
                <td>{videoItem.uploadedAt}</td>
                <td>
                  <StatusBadge status={videoItem.status} />
                </td>
                <td>
                  {t("table.views")}{" "}
                  {formatNumber(videoItem.views, i18n.language)} ·{" "}
                  {t("table.likes")}{" "}
                  {formatNumber(videoItem.likes, i18n.language)} ·{" "}
                  {t("table.comments")}{" "}
                  {formatNumber(videoItem.comments, i18n.language)}
                </td>
                <td>
                  <button
                    className={
                      videoItem.status === "REVIEWING" ||
                      videoItem.status === "UNDER_REVIEW"
                        ? "btn primary"
                        : "btn"
                    }
                    disabled={isLoading}
                    onClick={() => onOpen(videoItem.id, "review")}
                  >
                    {videoItem.status === "REVIEWING" ||
                    videoItem.status === "UNDER_REVIEW"
                      ? t("button.review")
                      : t("button.view")}
                  </button>
                  <button
                    className="btn"
                    disabled={isLoading}
                    onClick={() => onOpen(videoItem.id, "preview")}
                  >
                    {t("button.preview")}
                  </button>
                </td>
              </tr>
            ))}
          {!isLoading && videos.length === 0 && (
            <tr>
              <td colSpan="6" className="empty">
                {t("table.empty")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
ReviewTable.propTypes = {
  error: PropTypes.string,
  isLoading: PropTypes.bool,
  videos: PropTypes.array,
  onOpen: PropTypes.func,
  t: PropTypes.func,
  i18n: PropTypes.object,
  status: PropTypes.string,
  pageInfo: PropTypes.shape({ page: PropTypes.number, size: PropTypes.number })
    .isRequired,
};
export default ReviewTable;
