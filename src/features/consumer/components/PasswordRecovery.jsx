import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword, resetPassword } from "../../../services/authApi";
export default function PasswordRecovery() {
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [requested, setRequested] = useState(false);
  return (
    <div className="fr-page fr-form-page">
      <Link className="fr-back" to="/login">
        ← Quay lại đăng nhập
      </Link>
      <h1>Đặt lại mật khẩu</h1>
      <p>Nhập email để yêu cầu mã đặt lại mật khẩu.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          try {
            if (!requested) {
              await forgotPassword(email);
              setRequested(true);
              setMessage(
                "Nếu tài khoản đủ điều kiện, yêu cầu đã được tiếp nhận.",
              );
            } else {
              await resetPassword(email, code, password);
              setMessage("Mật khẩu đã được đặt lại. Bạn có thể đăng nhập.");
            }
          } catch (err) {
            setError(err.message || "Không thể hoàn tất yêu cầu.");
          }
        }}
      >
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {requested && (
          <>
            <label>
              Mã xác minh
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </label>
            <label>
              Mật khẩu mới
              <input
                type="password"
                required
                minLength={8}
                maxLength={50}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </>
        )}
        {error && <p className="fr-error">{error}</p>}
        {message && <p>{message}</p>}
        <button className="fr-primary">
          {requested ? "Đặt lại mật khẩu" : "Yêu cầu mã"}
        </button>
      </form>
    </div>
  );
}
