import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { consumerApi } from "../services/consumerApi";
import PropTypes from "prop-types";
import { trackViewOnce } from "../utils/trackViewOnce";

export default function MyVideoPlayer({ publicProfile = false }) {
  const { id, userId } = useParams();
  const [playback, setPlayback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestNumber, setRequestNumber] = useState(0);
  const mediaRetry = useRef(false);
  const resumeAt = useRef(0);
  const viewed = useRef(new Set());

  useEffect(() => {
    mediaRetry.current = false;
    resumeAt.current = 0;
  }, [id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setPlayback(null);
    consumerApi
      .playback(id)
      .then((video) => {
        if (!active) return;
        if (!video.videoUrl) throw new Error("Video chưa có đường dẫn phát.");
        setPlayback(video);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Không thể tải video.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, requestNumber]);

  function handleMediaError(event) {
    if (!mediaRetry.current) {
      mediaRetry.current = true;
      resumeAt.current = event.currentTarget.currentTime || 0;
      setRequestNumber((number) => number + 1);
      return;
    }
    setError("Không thể phát video. Vui lòng kiểm tra kết nối hoặc thử lại.");
  }

  function retry() {
    mediaRetry.current = false;
    setRequestNumber((number) => number + 1);
  }

  return (
    <div className="fr-page">
      <Link
        className="fr-back"
        to={
          publicProfile ? `/users/${encodeURIComponent(userId)}` : "/my-videos"
        }
      >
        <ArrowLeft size={16} />{" "}
        {publicProfile ? "Trang cá nhân" : "Video của tôi"}
      </Link>
      <h1>{playback?.title || "Xem video"}</h1>
      {loading && <p>Đang tải video...</p>}
      {error && (
        <div role="alert">
          <p className="fr-error">{error}</p>
          <button className="fr-outline" onClick={retry}>
            Thử lại
          </button>
        </div>
      )}
      {playback && !error && (
        <video
          key={`${id}-${requestNumber}`}
          className="fr-my-video-player"
          src={playback.videoUrl}
          poster={playback.coverUrl || undefined}
          controls
          autoPlay
          playsInline
          onError={handleMediaError}
          onPlaying={() => {
            if (publicProfile)
              trackViewOnce(id, viewed.current, consumerApi).catch(() => {});
          }}
          onLoadedMetadata={(event) => {
            if (resumeAt.current) {
              event.currentTarget.currentTime = resumeAt.current;
              resumeAt.current = 0;
            }
          }}
        >
          Trình duyệt của bạn không hỗ trợ phát video.
        </video>
      )}
    </div>
  );
}
MyVideoPlayer.propTypes = { publicProfile: PropTypes.bool };
