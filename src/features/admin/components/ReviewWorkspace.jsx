import ReviewTable from "./ReviewTable.jsx";
import { useTranslation } from "react-i18next";
import { ListFilter } from "lucide-react";
import { statusCodes } from "../../../constants/reviewConfig";
import Metric from "../../../components/Metric";
import PropTypes from "prop-types";
function ReviewWorkspace({
  metrics,
  status,
  onStatus,
  videos,
  onOpen,
  isLoading,
  error,
  pageInfo,
  onPage,
}) {
  const { t, i18n } = useTranslation();
  const canGoPrevious = pageInfo.page > 0;
  const canGoNext = !pageInfo.last && pageInfo.page + 1 < pageInfo.totalPages;
  return (
    <>
      <p className="note">
        Số lượng dựa trên các video đang hiển thị ở trang này.
      </p>
      <section className="grid">
        <Metric label={t("metric.pending")} value={metrics.pending} />
        <Metric label={t("status.APPROVED")} value={metrics.approved} />
        <Metric label={t("status.REJECTED")} value={metrics.rejected} />
        <Metric label={t("metric.averageHandlingTime")} value="—" />
      </section>

      <section className="panel" aria-busy={isLoading}>
        <div className="panelHead">
          <strong>
            <ListFilter size={17} /> {t("table.reviewList")}
          </strong>
          <div className="filters">
            {statusCodes.map((key) => (
              <button
                key={key}
                className={status === key ? "chip on" : "chip"}
                disabled={isLoading}
                onClick={() => onStatus(key)}
              >
                {t(`status.${key}`)}
              </button>
            ))}
          </div>
        </div>
        <ReviewTable
          error={error}
          isLoading={isLoading}
          videos={videos}
          onOpen={onOpen}
          t={t}
          i18n={i18n}
          status={status}
          pageInfo={pageInfo}
        />
        <footer className="pagination">
          <span>
            {t("table.pageInfo", {
              page: pageInfo.page + 1,
              totalPages: pageInfo.totalPages,
              totalElements: pageInfo.totalElements,
            })}
          </span>
          <div>
            <button
              className="btn"
              disabled={isLoading || !canGoPrevious}
              onClick={() => onPage(pageInfo.page - 1)}
            >
              {t("button.previous")}
            </button>
            <button
              className="btn"
              disabled={isLoading || !canGoNext}
              onClick={() => onPage(pageInfo.page + 1)}
            >
              {t("button.next")}
            </button>
          </div>
        </footer>
      </section>
    </>
  );
}
ReviewWorkspace.propTypes = {
  metrics: PropTypes.shape({
    pending: PropTypes.number,
    approved: PropTypes.number,
    rejected: PropTypes.number,
  }),
  status: PropTypes.string,
  onStatus: PropTypes.func,
  videos: PropTypes.array,
  onOpen: PropTypes.func,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  pageInfo: PropTypes.shape({
    page: PropTypes.number,
    totalPages: PropTypes.number,
    totalElements: PropTypes.number,
    last: PropTypes.bool,
  }),
  onPage: PropTypes.func,
};
export default ReviewWorkspace;
