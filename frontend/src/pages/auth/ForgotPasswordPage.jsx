import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import CanovaLogo from "../../components/CanovaLogo";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      const res = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      if (res.emailSent === false && res.otp) {
        setInfo(`${res.message} OTP: ${res.otp}`);
        return;
      }

      setInfo(res.message || "OTP sent to your email.");
      navigate("/verify-otp", { state: { email } });
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
            Please enter your registered email ID to receive an OTP
          </p>

          {error && <p className="auth-error-text">{error}</p>}
          {info && <p className="auth-info-text">{info}</p>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="auth-label" htmlFor="email">
                E-mail
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-primary-btn">
              Send Mail
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;


