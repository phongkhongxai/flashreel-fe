import useMyVideos from "../hooks/useMyVideos.js";
import { Link } from "react-router-dom";
import MyVideoThumbnail from "./MyVideoThumbnail.jsx";
import { statuses } from "../constants/statuses.js";
import PropTypes from "prop-types";
function MyVideos({ version }) {
  const { items, filter, setFilter, page, loading, error, loadMore } =
    useMyVideos({
      version,
    });
  return (
    <div className="fr-page">
      <span className="fr-eyebrow">KHÔNG GIAN CỦA BẠN</span>
      <h1>Video của tôi</h1>
      <p>Theo dõi hành trình của những câu chuyện bạn chia sẻ.</p>
      <div className="fr-filter">
        {[["ALL", "Tất cả"], ...Object.entries(statuses)].map(([v, l]) => (
          <button
            className={filter === v ? "selected" : ""}
            onClick={() => setFilter(v)}
            key={v}
          >
            {l}
          </button>
        ))}
      </div>
      {error && <p className="fr-error">{error}</p>}
      {loading && <p>Đang tải...</p>}
      <div className="fr-video-list">
        {items
          .filter((v) => filter === "ALL" || v.status === filter)
          .map((v, i) => (
            <article key={v.id}>
              <MyVideoThumbnail video={v} index={i} />
              <div>
                <span className={"fr-status " + v.status}>
                  {statuses[v.status]}
                </span>
                <h3>
                  <Link to={`/my-videos/${encodeURIComponent(v.id)}`}>
                    {v.title}
                  </Link>
                </h3>
                <small>Video của bạn · FlashReel</small>
                {v.status === "REJECTED" && (
                  <p className="fr-error">
                    {v.reason}{" "}
                    <Link to={"/my-videos/" + v.id + "/resubmit"}>
                      Gửi lại →
                    </Link>
                  </p>
                )}
              </div>
            </article>
          ))}
        {!loading &&
          !error &&
          !items.filter((v) => filter === "ALL" || v.status === filter)
            .length && (
            <div className="fr-empty">
              Chưa có video nào. <Link to="/upload">Đăng video đầu tiên</Link>
            </div>
          )}
      </div>
      {page.hasNext && (
        <button className="fr-outline" disabled={loading} onClick={loadMore}>
          Xem thêm
        </button>
      )}
    </div>
  );
}
MyVideos.propTypes = {
  version: PropTypes.number,
};
export default MyVideos;
