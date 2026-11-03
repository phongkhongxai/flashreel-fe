import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Plus } from "lucide-react";
import { Clapperboard } from "lucide-react";
import { UserRound } from "lucide-react";
import PropTypes from "prop-types";
function ConsumerBottomNav({ requireUser }) {
  return (
    <nav className="fr-bottom">
      <Link to="/">
        <Home />
        <span>Trang chủ</span>
      </Link>
      <button onClick={() => requireUser("/upload")}>
        <span className="fr-plus">
          <Plus />
        </span>
        <span>Đăng video</span>
      </button>
      <button onClick={() => requireUser("/my-videos")}>
        <Clapperboard />
        <span>Video của tôi</span>
      </button>
      <button onClick={() => requireUser("/profile")}>
        <UserRound />
        <span>Hồ sơ</span>
      </button>
    </nav>
  );
}
ConsumerBottomNav.propTypes = {
  requireUser: PropTypes.func,
};
export default ConsumerBottomNav;
