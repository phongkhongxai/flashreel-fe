import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Heart, MessageCircle } from "lucide-react";
import PropTypes from "prop-types";
import CommentPanel from "./CommentPanel";
import usePublicVideo from "../hooks/usePublicVideo";
import { consumerApi } from "../services/consumerApi";
import { fmt } from "../utils/formatCount";
import styles from "./PublicVideoPlayer.module.css";

export default function PublicVideoPlayer({ user }) {
  const { id, userId } = useParams();
  const state = usePublicVideo(id, user);
  const player = useRef(null);
  useEffect(() => {
    const pauseWhenHidden = () => { if (document.hidden) player.current?.pause(); };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);
  const { video } = state;
  return (
    <div className="fr-page">
      <Link className="fr-back" to={`/users/${encodeURIComponent(userId)}`}><ArrowLeft size={16} /> Trang cá nhân</Link>
      <h1>{video?.title || "Xem video"}</h1>
      {state.loading && <p role="status">Đang tải video...</p>}
      {state.error && <div role="alert"><p className="fr-error">{state.error}</p><button className="fr-outline" onClick={state.retry}>Thử lại</button></div>}
      {video && !state.error && <div className={styles.layout}>
        <div>
          <video ref={player} className="fr-my-video-player" src={video.videoUrl} poster={video.coverUrl || undefined} controls autoPlay muted playsInline onPlaying={state.onPlaying} onError={state.onMediaError}>Trình duyệt của bạn không hỗ trợ phát video.</video>
          <div className={styles.metadata}>
            <span aria-label={`${fmt(video.views)} lượt xem`}><Eye size={19} /> {fmt(video.views)}</span>
            <button disabled={state.busy} aria-pressed={video.liked} onClick={() => state.act(() => consumerApi.toggleLike(video))}><Heart size={19} fill={video.liked ? "currentColor" : "none"} /> {fmt(video.likes)} <span>Thích</span></button>
            <button aria-expanded={state.commentsOpen} onClick={() => state.setCommentsOpen(!state.commentsOpen)}><MessageCircle size={19} /> {fmt(video.commentCount)} <span>Bình luận</span></button>
          </div>
          {state.actionError && <p className="fr-error" role="alert">{state.actionError}</p>}
        </div>
        {state.commentsOpen && <CommentPanel current={video} setComments={state.setCommentsOpen} act={state.act} text={state.text} setText={state.setText} user={user} commentError={state.commentError} commentPage={state.page} loadMoreComments={state.loadMoreComments} />}
      </div>}
    </div>
  );
}
PublicVideoPlayer.propTypes = { user: PropTypes.object };

