import Avatar from "../../../components/Avatar";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Eye } from "lucide-react";
import { Volume2 } from "lucide-react";
import { VolumeX } from "lucide-react";
import { Play } from "lucide-react";
import { ChevronUp } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { consumerApi } from "../services/consumerApi";
import { fmt } from "../utils/formatCount.js";
import PropTypes from "prop-types";
function Reel({
  current,
  startY,
  setIndex,
  items,
  video,
  muted,
  toggle,
  act,
  setPlaying,
  index,
  setMuted,
  playing,
  setComments,
  comments,
  onPlaying,
  onMediaError,
  user,
}) {
  return (
    <div className="fr-reel-wrap">
      <div
        className="fr-reel"
        data-color={current.color}
        onTouchStart={(e) => (startY.current = e.touches[0].clientY)}
        onTouchEnd={(e) => {
          let d = e.changedTouches[0].clientY - startY.current;
          if (Math.abs(d) > 60)
            setIndex((i) =>
              Math.max(0, Math.min(items.length - 1, i + (d < 0 ? 1 : -1))),
            );
        }}
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > 30) {
            setIndex((i) =>
              Math.max(
                0,
                Math.min(items.length - 1, i + (e.deltaY > 0 ? 1 : -1)),
              ),
            );
          }
        }}
      >
        <video
          ref={video}
          src={current.videoUrl}
          poster={current.coverUrl || undefined}
          muted={muted}
          loop
          playsInline
          onClick={toggle}
          onDoubleClick={() => {
            if (!current.liked) act(() => consumerApi.toggleLike(current));
          }}
          onPlaying={onPlaying}
          onError={onMediaError}
        />
        <div className="fr-reel-art" hidden>
          <div className="fr-art-orb" />
          <div className="fr-art-line" />
          <span>FLASHREEL / {String(index + 1).padStart(2, "0")}</span>
          <strong>
            little
            <br />
            moments<span>.</span>
          </strong>
          <em>big stories</em>
        </div>
        <div className="fr-reel-shade" />
        <div className="fr-reel-header">
          <span className="fr-reel-tag">✦ &nbsp; FOR YOU</span>
          <button
            onClick={() => setMuted(!muted)}
            aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
        </div>
        <div
          className="fr-view-count"
          aria-label={`${fmt(current.views)} lượt xem`}
        >
          <Eye size={15} aria-hidden="true" /> {fmt(current.views)} lượt xem
        </div>
        <button
          className={"fr-play " + (playing ? "is-playing" : "")}
          onClick={toggle}
          aria-label={playing ? "Tạm dừng" : "Phát video"}
        >
          <Play fill="currentColor" />
        </button>
        <div className="fr-reel-caption">
          <div className="fr-author">
            {current.authorId ? (
              <Link
                className="fr-author-profile"
                to={
                  user
                    ? user.id === current.authorId
                      ? "/profile"
                      : `/users/${encodeURIComponent(current.authorId)}`
                    : "/login"
                }
                state={
                  user
                    ? undefined
                    : { from: `/users/${encodeURIComponent(current.authorId)}` }
                }
                aria-label={`Xem trang cá nhân của ${current.author}`}
              >
                <Avatar
                  key={current.id}
                  name={current.author}
                  src={current.authorAvatar}
                  onRefresh={async () =>
                    (await consumerApi.playback(current.id)).authorAvatar
                  }
                />
                <div>
                  <b>{current.author}</b>
                  <small>
                    @{current.author.toLowerCase().replaceAll(" ", "")}
                  </small>
                </div>
              </Link>
            ) : (
              <>
                <Avatar
                  key={current.id}
                  name={current.author}
                  src={current.authorAvatar}
                  onRefresh={async () =>
                    (await consumerApi.playback(current.id)).authorAvatar
                  }
                />
                <div>
                  <b>{current.author}</b>
                </div>
              </>
            )}
            {user?.id !== current.authorId && (
              <button
                onClick={() => act(() => consumerApi.toggleFollow(current))}
              >
                {current.followed ? "Đang theo dõi" : "Theo dõi"}
              </button>
            )}
          </div>
          <p>{current.title}</p>
          <span>♫ &nbsp; Âm thanh gốc · {current.author}</span>
        </div>
      </div>
      <div className="fr-actions">
        <button
          onClick={() => act(() => consumerApi.toggleLike(current))}
          aria-label="Thích"
        >
          <span className={current.liked ? "liked" : ""}>
            <Heart fill={current.liked ? "currentColor" : "none"} />
          </span>
          <small>{fmt(current.likes)}</small>
        </button>
        <button onClick={() => setComments(!comments)} aria-label="Bình luận">
          <span>
            <MessageCircle />
          </span>
          <small>{current.commentCount ?? current.comments.length}</small>
        </button>
        <div className="fr-action-divider" />
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Video trước"
        >
          <span>
            <ChevronUp />
          </span>
        </button>
        <button
          onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          disabled={index === items.length - 1}
          aria-label="Video tiếp"
        >
          <span>
            <ChevronDown />
          </span>
        </button>
      </div>
    </div>
  );
}
Reel.propTypes = {
  current: PropTypes.object,
  startY: PropTypes.object,
  setIndex: PropTypes.func,
  items: PropTypes.array,
  video: PropTypes.object,
  muted: PropTypes.bool,
  toggle: PropTypes.func,
  act: PropTypes.func,
  setPlaying: PropTypes.func,
  index: PropTypes.number,
  setMuted: PropTypes.func,
  playing: PropTypes.bool,
  setComments: PropTypes.func,
  comments: PropTypes.bool,
};
export default Reel;
