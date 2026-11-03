import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import PropTypes from "prop-types";
import { consumerApi } from "../services/consumerApi";
import { fmt } from "../utils/formatCount";
import styles from "./CreatorProfile.module.css";
export default function CreatorVideoCard({ video, userId }) {
  const [cover, setCover] = useState(video.coverUrl || "");
  const refreshed = useRef(false);
  useEffect(() => {
    setCover(video.coverUrl || "");
    refreshed.current = false;
  }, [video.id, video.coverUrl]);
  async function onError() {
    if (refreshed.current) {
      setCover("");
      return;
    }
    refreshed.current = true;
    try {
      const next = await consumerApi.getVideo(video.id);
      setCover(next.coverUrl && next.coverUrl !== cover ? next.coverUrl : "");
    } catch {
      setCover("");
    }
  }
  return (
    <Link
      className={styles.videoCard}
      to={`/users/${encodeURIComponent(userId)}/video/${encodeURIComponent(video.id)}`}
      aria-label={`Xem video ${video.title}`}
    >
      <div className={styles.cover}>
        {cover && <img src={cover} alt="" loading="lazy" onError={onError} />}
        <span className={styles.views}>
          <Play size={13} fill="currentColor" aria-hidden="true" />{" "}
          {fmt(video.views)}
        </span>
      </div>
      <span className={styles.videoTitle}>{video.title}</span>
    </Link>
  );
}
CreatorVideoCard.propTypes = {
  video: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    coverUrl: PropTypes.string,
    views: PropTypes.number,
  }).isRequired,
  userId: PropTypes.string.isRequired,
};
