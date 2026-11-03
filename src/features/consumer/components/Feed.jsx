import Reel from "./Reel.jsx";
import CommentPanel from "./CommentPanel.jsx";
import useFeed from "../hooks/useFeed.js";
import { Plus } from "lucide-react";
import PropTypes from "prop-types";
function Feed({ user, version, refresh, requireUser }) {
  const {
    items,
    order,
    setOrder,
    index,
    setIndex,
    comments,
    setComments,
    text,
    setText,
    loading,
    error,
    muted,
    setMuted,
    playing,
    setPlaying,
    video,
    startY,
    current,
    act,
    toggle,
    onPlaying,
    onMediaError,
    commentError,
    actionError,
    commentPage,
    loadMoreComments,
  } = useFeed({
    user,
    version,
    refresh,
    requireUser,
  });
  return (
    <div className="fr-feed">
      {actionError && (
        <p className="fr-error" role="alert">
          {actionError}
        </p>
      )}
      <div className="fr-feed-top">
        <div>
          <span className="fr-eyebrow">DÀNH CHO BẠN</span>
          <h1>Khám phá</h1>
          <p>Những câu chuyện đang diễn ra</p>
        </div>
        <div className="fr-tabs">
          <button
            className={order === "hot" ? "selected" : ""}
            onClick={() => {
              setOrder("hot");
              setIndex(0);
            }}
          >
            Thịnh hành
          </button>
          <button
            className={order === "latest" ? "selected" : ""}
            onClick={() => {
              setOrder("latest");
              setIndex(0);
            }}
          >
            Mới nhất
          </button>
        </div>
        <div className="fr-top-actions">
          <span className="fr-live-dot" /> CÙNG XEM NHÉ{" "}
          <button onClick={() => requireUser("/upload")}>
            <Plus size={17} /> Tạo video
          </button>
        </div>
      </div>
      <div className="fr-view-area">
        {loading ? (
          <div className="fr-feed-message">Đang tải video...</div>
        ) : error ? (
          <div className="fr-feed-message">
            {error}
            <button onClick={refresh}>Thử lại</button>
          </div>
        ) : !current ? (
          <div className="fr-feed-message">Chưa có video nào.</div>
        ) : (
          <>
            <Reel
              current={current}
              startY={startY}
              setIndex={setIndex}
              items={items}
              video={video}
              muted={muted}
              toggle={toggle}
              act={act}
              setPlaying={setPlaying}
              index={index}
              setMuted={setMuted}
              playing={playing}
              setComments={setComments}
              comments={comments}
              onPlaying={onPlaying}
              onMediaError={onMediaError}
              user={user}
            />
            {comments && (
              <CommentPanel
                current={current}
                setComments={setComments}
                act={act}
                text={text}
                setText={setText}
                user={user}
                commentError={commentError}
                commentPage={commentPage}
                loadMoreComments={loadMoreComments}
              />
            )}
          </>
        )}
      </div>
      <div className="fr-feed-foot">
        <span>✦ &nbsp; MỖI NGÀY MỘT CÂU CHUYỆN</span>
        <span>Cuộn để khám phá thêm ↓</span>
      </div>
    </div>
  );
}
Feed.propTypes = {
  user: PropTypes.object,
  version: PropTypes.number,
  refresh: PropTypes.func,
  requireUser: PropTypes.func,
};
export default Feed;
