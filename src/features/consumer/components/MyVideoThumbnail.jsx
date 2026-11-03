import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import PropTypes from "prop-types";
import { consumerApi } from "../services/consumerApi";

export default function MyVideoThumbnail({ video, index }) {
  const [coverUrl, setCoverUrl] = useState(video.coverUrl || "");
  const attemptedRefresh = useRef(false);

  useEffect(() => {
    setCoverUrl(video.coverUrl || "");
    attemptedRefresh.current = false;
  }, [video.id, video.coverUrl]);

  async function handleCoverError() {
    if (attemptedRefresh.current) {
      setCoverUrl("");
      return;
    }
    attemptedRefresh.current = true;
    try {
      const refreshed = await consumerApi.getVideo(video.id);
      setCoverUrl(
        refreshed.coverUrl && refreshed.coverUrl !== coverUrl
          ? refreshed.coverUrl
          : "",
      );
    } catch {
      setCoverUrl("");
    }
  }

  return (
    <Link
      className={`fr-thumb thumb-${index}`}
      to={`/my-videos/${encodeURIComponent(video.id)}`}
      aria-label={`Xem video ${video.title}`}
    >
      {coverUrl && (
        <img src={coverUrl} alt="" loading="lazy" onError={handleCoverError} />
      )}
      <Play fill="currentColor" size={18} aria-hidden="true" />
    </Link>
  );
}

MyVideoThumbnail.propTypes = {
  video: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    coverUrl: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};
