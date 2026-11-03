import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { verifyEmailCode, resendCode } from "../../../services/authApi";
export default function Verify() {
  const nav = useNavigate(),
    location = useLocation(),
    [email, setEmail] = useState(location.state?.email || ""),
    [code, setCode] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  return (
    <div className="fr-page fr-form-page">
      <Link className="fr-back" to="/register">
        <ArrowLeft size={16} /> Quay lại
      </Link>
      <h1>Xác minh email</h1>
      <p>Nhập mã xác minh được gửi đến email của bạn.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          try {
            await verifyEmailCode(email, code);
            nav("/login", { state: { from: location.state?.from } });
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Mã xác minh
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>
        {error && <p className="fr-error">{error}</p>}
        {message && <p>{message}</p>}
        <button className="fr-primary">Xác minh</button>
        <button
          type="button"
          className="fr-outline"
          onClick={async () => {
            try {
              await resendCode(email);
              setMessage(
                "Nếu tài khoản đủ điều kiện, yêu cầu gửi mã đã được tiếp nhận.",
              );
            } catch (err) {
              setError(err.message);
            }
          }}
        >
          Gửi lại mã
        </button>
      </form>
    </div>
  );
}
