import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Plus } from "lucide-react";
import { Clapperboard } from "lucide-react";
import { UserRound } from "lucide-react";
import Brand from "../components/Brand.jsx";
import PropTypes from "prop-types";
function ConsumerSidebar({ loc, requireUser }) {
  return (
    <aside className="fr-sidebar">
      <Brand />
      <p className="fr-side-label">KHÁM PHÁ</p>
      <nav>
        <Link to="/" className={loc.pathname === "/" ? "active" : ""}>
          <Home />
          <span>Trang chủ</span>
        </Link>
        <a
          href="/upload"
          onClick={(e) => {
            e.preventDefault();
            requireUser("/upload");
          }}
        >
          <Plus />
          <span>Đăng video</span>
        </a>
        <a
          href="/my-videos"
          onClick={(e) => {
            e.preventDefault();
            requireUser("/my-videos");
          }}
        >
          <Clapperboard />
          <span>Video của tôi</span>
        </a>
        <a
          href="/profile"
          onClick={(e) => {
            e.preventDefault();
            requireUser("/profile");
          }}
        >
          <UserRound />
          <span>Hồ sơ</span>
        </a>
      </nav>
      <div className="fr-side-bottom">
        <p>
          Những khoảnh khắc nhỏ,
          <br />
          câu chuyện thật lớn.
        </p>
        <small>© 2026 FlashReel</small>
      </div>
    </aside>
  );
}
ConsumerSidebar.propTypes = {
  loc: PropTypes.object,
  requireUser: PropTypes.func,
};
export default ConsumerSidebar;
