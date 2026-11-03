import useAdminDashboard from "../hooks/useAdminDashboard.js";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import ReviewWorkspace from "../components/ReviewWorkspace.jsx";
import ReviewDetail from "../components/ReviewDetail.jsx";
import PolicyCenter from "../components/PolicyCenter.jsx";
function AdminDashboard() {
  const {
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
  } = useAdminDashboard();
  return (
    <div className="app">
      <Sidebar view={view} onView={setView} />
      <main className="main">
        <Header search={search} onSearch={setSearch} />
        {view === "review" && (
          <ReviewWorkspace
            metrics={metrics}
            status={status}
            onStatus={changeStatus}
            videos={filteredVideos}
            onOpen={openDetail}
            isLoading={isLoadingVideos}
            error={videoError}
            pageInfo={pageInfo}
            onPage={setCurrentPage}
          />
        )}
        {view === "detail" && (
          <ReviewDetail
            video={selectedVideo}
            selectedReason={selectedReason}
            onReason={setSelectedReason}
            customReason={customReason}
            onCustomReason={setCustomReason}
            onBack={() => setView("review")}
            onApprove={approveVideo}
            onReject={rejectVideo}
            onTakeDown={takeDownVideo}
            canShowActions={detailMode === "review"}
          />
        )}
        {view === "policies" && <PolicyCenter />}
      </main>
    </div>
  );
}
export default AdminDashboard;
