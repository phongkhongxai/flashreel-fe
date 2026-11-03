import React from "react";
import { useMemo } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { adminApproveVideo } from "../../../services/adminVideoApi";
import { adminGetVideos } from "../../../services/adminVideoApi";
import { adminRejectVideo } from "../../../services/adminVideoApi";
import { adminTakeDownVideo } from "../../../services/adminVideoApi";
import { statusToApi } from "../../../constants/reviewConfig";
import { createEmptyVideo } from "../../../utils/reviewVideo";
import { getVideoTitle } from "../../../utils/reviewVideo";
import { mapReviewVideo } from "../../../utils/reviewVideo";
function useAdminDashboard() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [revision, setRevision] = useState(0);
  const [view, setView] = useState("review");
  const [status, setStatus] = useState("REVIEWING");
  const [selectedId, setSelectedId] = useState("");
  const [selectedReason, setSelectedReason] = useState("SPAM");
  const [customReason, setCustomReason] = useState(
    t("detail.defaultCustomReason"),
  );
  const [detailMode, setDetailMode] = useState("review");
  const [search, setSearch] = useState("");
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 1,
    last: true,
  });
  const selectedVideo =
    videos.find((videoItem) => videoItem.id === selectedId) ||
    videos[0] ||
    createEmptyVideo(t);
  const filteredVideos = useMemo(() => {
    const text = search.trim().toLowerCase();
    return videos.filter((videoItem) => {
      const title = getVideoTitle(videoItem, t);
      const matchesStatus = videoItem.status === status;
      const matchesSearch =
        !text ||
        `${title} ${videoItem.email} ${videoItem.author}`
          .toLowerCase()
          .includes(text);
      return matchesStatus && matchesSearch;
    });
  }, [videos, search, status, t]);
  const metrics = useMemo(
    () => ({
      pending: videos.filter(
        (item) => item.status === "REVIEWING" || item.status === "UNDER_REVIEW",
      ).length,
      approved: videos.filter((item) => item.status === "APPROVED").length,
      rejected: videos.filter((item) => item.status === "REJECTED").length,
    }),
    [videos],
  );
  React.useEffect(() => {
    let ignore = false;
    async function loadVideos() {
      setIsLoadingVideos(true);
      setVideoError("");
      try {
        const page = await adminGetVideos({
          status: statusToApi[status],
          page: currentPage,
          size: pageInfo.size,
        });
        if (ignore) return;
        const nextVideos = (page.content || []).map(mapReviewVideo);
        setVideos(nextVideos);
        setPageInfo({
          page: page.page ?? currentPage,
          size: page.size ?? pageInfo.size,
          totalElements: page.totalElements ?? nextVideos.length,
          totalPages: page.totalPages || 1,
          last: page.last ?? true,
        });
        setSelectedId((currentId) =>
          nextVideos.some((item) => item.id === currentId)
            ? currentId
            : nextVideos[0]?.id || "",
        );
      } catch (error) {
        if (!ignore)
          setVideoError(error?.message || t("messages.loadVideosFailed"));
      } finally {
        if (!ignore) setIsLoadingVideos(false);
      }
    }
    loadVideos();
    return () => {
      ignore = true;
    };
  }, [status, currentPage, pageInfo.size, t, revision]);
  function changeStatus(nextStatus) {
    setStatus(nextStatus);
    setCurrentPage(0);
  }
  function openDetail(videoId, mode = "review") {
    setSelectedId(videoId);
    setDetailMode(mode);
    setView("detail");
  }
  async function approveVideo() {
    await adminApproveVideo(selectedVideo.id);
    setStatus("APPROVED");
    setCurrentPage(0);
    setView("review");
    setRevision((value) => value + 1);
  }
  async function rejectVideo() {
    await adminRejectVideo(selectedVideo.id, {
      reasonType: selectedReason,
      customReason: customReason.trim() || t(`reason.${selectedReason}`),
    });
    setStatus("REJECTED");
    setCurrentPage(0);
    setView("review");
    setRevision((value) => value + 1);
  }
  async function takeDownVideo() {
    await adminTakeDownVideo(selectedVideo.id);
    setStatus("TAKEN_DOWN");
    setCurrentPage(0);
    setView("review");
    setRevision((value) => value + 1);
  }
  return {
    view,
    setView,
    status,
    selectedReason,
    setSelectedReason,
    customReason,
    setCustomReason,
    detailMode,
    search,
    setSearch,
    isLoadingVideos,
    videoError,
    setCurrentPage,
    pageInfo,
    selectedVideo,
    filteredVideos,
    metrics,
    changeStatus,
    openDetail,
    approveVideo,
    rejectVideo,
    takeDownVideo,
  };
}
export default useAdminDashboard;
