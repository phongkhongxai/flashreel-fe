import { useState } from "react";
import { useTranslation } from "react-i18next";
function useReviewDetail({
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
  const { t } = useTranslation();
  const [actionError, setActionError] = useState("");
  const [submittingAction, setSubmittingAction] = useState("");
  const isSubmitting = Boolean(submittingAction);
  const rejectionReason = video.rejectionReasonKey
    ? t(video.rejectionReasonKey)
    : video.rejectionReason;
  const isReviewing =
    video.status === "REVIEWING" || video.status === "UNDER_REVIEW";
  const isTakenDown =
    video.status === "TAKEN_DOWN" || video.status === "DELETED";
  const showReviewActions = canShowActions && isReviewing;
  const showTakeDownAction = canShowActions && !isReviewing && !isTakenDown;
  async function runAction(action, actionKey) {
    setSubmittingAction(actionKey);
    setActionError("");
    try {
      await action();
    } catch (error) {
      setActionError(error?.message || t("messages.reviewActionFailed"));
    } finally {
      setSubmittingAction("");
    }
  }
  return {
    t,
    actionError,
    submittingAction,
    isSubmitting,
    rejectionReason,
    showReviewActions,
    showTakeDownAction,
    runAction,
  };
}
export default useReviewDetail;
