import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
function Guard({ user, children, requireUser }) {
  const loc = useLocation();
  return user ? (
    children
  ) : (
    <div className="fr-page fr-empty">
      <h2>Đăng nhập để tiếp tục</h2>
      <p>Tham gia FlashReel để chia sẻ khoảnh khắc của bạn.</p>
      <button className="fr-primary" onClick={() => requireUser(loc.pathname)}>
        Đăng nhập
      </button>
    </div>
  );
}
Guard.propTypes = {
  user: PropTypes.object,
  children: PropTypes.node,
  requireUser: PropTypes.func,
};
export default Guard;
