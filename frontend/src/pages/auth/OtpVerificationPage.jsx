import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import CanovaLogo from "../../components/CanovaLogo";

function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length !== 6) return;
    try {
      const res = await apiRequest("/api/auth/verify-otp", {
        method: "POST",
        body: { email, otp },
      });
      navigate("/reset-password", {
        state: { email, resetToken: res.resetToken },
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <CanovaLogo />
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Welcome CANOVA</h1>
          <p className="auth-subtitle">
            Enter 6-digit code sent to <strong>{email || "your email"}</strong>.
          </p>

          {error && <p className="auth-error-text">{error}</p>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="auth-input"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              required
            />

            <button type="submit" className="auth-primary-btn">
              Verify &amp; Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OtpVerificationPage;

