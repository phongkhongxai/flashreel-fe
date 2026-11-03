import { registerUser } from "../../../services/authApi";
import { startGoogleLogin } from "../services/googleOAuth";
import useAuth from "../hooks/useAuth.js";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Brand from "../components/Brand.jsx";
import PropTypes from "prop-types";
function Auth({ login, register }) {
  const { nav, loc, error, setError } = useAuth({
    login,
    register,
  });
  return (
    <div className="fr-auth">
      <div className="fr-auth-visual">
        <Brand />
        <div>
          <span className="fr-eyebrow">MỌI KHOẢNH KHẮC ĐỀU ĐÁNG NHỚ</span>
          <h1>
            Câu chuyện
            <br />
            bắt đầu từ <i>bạn.</i>
          </h1>
          <p>
            Khám phá, sáng tạo và chia sẻ những khoảnh khắc làm nên cuộc sống.
          </p>
          <div className="fr-auth-art">
            ✦{" "}
            <span>
              YOUR STORY
              <br />
              YOUR MOMENT
            </span>
          </div>
        </div>
        <small>© 2026 FlashReel · Made for moments</small>
      </div>
      <div className="fr-auth-form">
        <Link className="fr-back" to="/">
          <ArrowLeft size={17} /> Về trang chủ
        </Link>
        <div>
          <span className="fr-eyebrow">CHÀO MỪNG ĐẾN VỚI FLASHREEL</span>
          <h1>{register ? "Tạo tài khoản" : "Rất vui được gặp bạn."}</h1>
          <p>
            {register
              ? "Bắt đầu hành trình chia sẻ của bạn."
              : "Đăng nhập để lưu lại những điều bạn yêu thích."}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              const form = new FormData(e.currentTarget);
              try {
                if (register) {
                  const email = String(form.get("email")).trim();
                  await registerUser({
                    username: String(form.get("username")).trim(),
                    email,
                    displayName: String(form.get("displayName")).trim(),
                    password: String(form.get("password")),
                  });
                  nav("/verify-email", {
                    state: { from: loc.state?.from, email },
                  });
                } else
                  await login(
                    String(form.get("username")).trim(),
                    String(form.get("password")),
                  );
              } catch (error) {
                setError(error.message || "Không thể đăng nhập.");
              }
            }}
          >
            <label>
              {register ? "Tên đăng nhập" : "Tên đăng nhập hoặc email"}
              <input
                name="username"
                required
                placeholder="Nhập tên đăng nhập"
              />
            </label>
            {register && (
              <>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="ban@example.com"
                  />
                </label>
                <label>
                  Tên hiển thị
                  <input
                    name="displayName"
                    required
                    placeholder="Bạn muốn được gọi là gì?"
                  />
                </label>
              </>
            )}
            <label>
              Mật khẩu
              <input
                type="password"
                name="password"
                required
                minLength={register ? 8 : 1}
                placeholder="Nhập mật khẩu"
              />
            </label>
            {error && <p className="fr-error">{error}</p>}
            <button className="fr-primary">
              {register ? "Đăng ký" : "Đăng nhập"} <span>→</span>
            </button>
          </form>
          {!register && (
            <>
              <div className="fr-or">hoặc</div>
              <button
                className="fr-outline"
                type="button"
                onClick={async () => {
                  try {
                    await startGoogleLogin(loc.state?.from || "/");
                  } catch (error) {
                    setError(error.message);
                  }
                }}
              >
                Tiếp tục với Google
              </button>
            </>
          )}
          {!register && (
            <p className="fr-auth-switch">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </p>
          )}
          <p className="fr-auth-switch">
            {register ? "Đã có tài khoản?" : "Bạn mới đến FlashReel?"}{" "}
            <Link to={register ? "/login" : "/register"} state={loc.state}>
              {register ? "Đăng nhập" : "Đăng ký ngay"}
            </Link>
          </p>
          <small>
            Bằng cách tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền
            riêng tư của FlashReel.
          </small>
        </div>
      </div>
    </div>
  );
}
Auth.propTypes = {
  login: PropTypes.func,
  register: PropTypes.bool,
};
export default Auth;
