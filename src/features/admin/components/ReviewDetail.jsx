import ReviewReasonForm from "./ReviewReasonForm";
import ReviewVideoInfo from "./ReviewVideoInfo.jsx";
import useReviewDetail from "../hooks/useReviewDetail.js";
import { Check } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { Play } from "lucide-react";
import { Trash2 } from "lucide-react";
import { X } from "lucide-react";
import { getVideoTitle } from "../../../utils/reviewVideo";
import StatusBadge from "../../../components/StatusBadge";
import PropTypes from "prop-types";
function ReviewDetail({
  video,
  selectedReason,
  onReason,
  customReason,
  onCustomReason,
  onBack,
  onApprove,
  onReject,
  onTakeDown,
  canShowActions,
}) {
  const {
    t,
    actionError,
    submittingAction,
    isSubmitting,
    rejectionReason,
    showReviewActions,
    showTakeDownAction,
    runAction,
  } = useReviewDetail({
    video,
    selectedReason,
    onReason,
    customReason,
    onCustomReason,
    onBack,
    onApprove,
    onReject,
    onTakeDown,
    canShowActions,
  });
  return (
    <section>
      <header className="detailTop">
        <button className="back" disabled={isSubmitting} onClick={onBack}>
          <ChevronLeft size={18} /> {t("button.backToList")}
        </button>
        <StatusBadge status={video.status} />
      </header>
      <div className="layout">
        <div className={`preview ${video.palette}`}>
          {video.videoPreviewUrl ? (
            <video
              className="previewVideo"
              autoPlay
              controls
              muted
              playsInline
              poster={video.coverUrl || undefined}
              preload="metadata"
              src={video.videoPreviewUrl}
            />
          ) : (
            <Play className="play" size={58} fill="currentColor" />
          )}
          <div className="caption">
            <h2>{getVideoTitle(video, t)}</h2>
            <p>
              @{video.author} · {t("detail.firstFrameCover")} · {video.duration}
            </p>
          </div>
        </div>
        <div>
          <ReviewVideoInfo
            video={video}
            t={t}
            rejectionReason={rejectionReason}
          />

          {showReviewActions && (
            <ReviewReasonForm
              t={t}
              selectedReason={selectedReason}
              isSubmitting={isSubmitting}
              onReason={onReason}
              customReason={customReason}
              onCustomReason={onCustomReason}
            />
          )}

          {(showReviewActions || showTakeDownAction) && (
            <section className="card">
              <h2>
                {showReviewActions
                  ? t("detail.reviewActions")
                  : t("detail.platformActions")}
              </h2>
              {actionError && (
                <div className="formError" role="alert">
                  {actionError}
                </div>
              )}
              <div className="actions">
                {showReviewActions && (
                  <>
                    <button
                      className="btn pass"
                      disabled={isSubmitting}
                      onClick={() => runAction(onApprove, "approve")}
                    >
                      <Check size={18} />{" "}
                      {submittingAction === "approve"
                        ? t("button.approving")
                        : t("button.approve")}
                    </button>
                    <button
                      className="btn reject"
                      disabled={isSubmitting}
                      onClick={() => runAction(onReject, "reject")}
                    >
                      <X size={18} />{" "}
                      {submittingAction === "reject"
                        ? t("button.rejecting")
                        : t("button.reject")}
                    </button>
                    <button className="btn" disabled={isSubmitting}>
                      {t("button.saveNote")}
                    </button>
                  </>
                )}
                {showTakeDownAction && (
                  <button
                    className="btn reject"
                    disabled={isSubmitting}
                    onClick={() => runAction(onTakeDown, "takeDown")}
                  >
                    <Trash2 size={18} />{" "}
                    {submittingAction === "takeDown"
                      ? t("button.takingDown")
                      : t("button.takeDown")}
                  </button>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
ReviewDetail.propTypes = {
  video: PropTypes.object,
  selectedReason: PropTypes.string,
  onReason: PropTypes.func,
  customReason: PropTypes.string,
  onCustomReason: PropTypes.func,
  onBack: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onTakeDown: PropTypes.func,
  canShowActions: PropTypes.bool,
};
export default ReviewDetail;
