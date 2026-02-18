import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import CanovaLogo from "../../components/CanovaLogo";
import { IconEye } from "../../components/Icons";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: { email, resetToken, password: form.password },
      });
      navigate("/login");
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
          <h1 className="auth-title">Create New Password</h1>
          <p className="auth-subtitle">
            Today is a new day. It&apos;s your day. You shape it.
            <br />
            Sign in to start managing your projects.
          </p>

          {error && <p className="auth-error-text">{error}</p>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="auth-label" htmlFor="password">
                Enter New Password
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="at least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password visibility"
                >
                  <IconEye size={18} />
                </button>
              </div>
            </div>

            <div>
              <label className="auth-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="at least 8 characters"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password visibility"
                >
                  <IconEye size={18} />
                </button>
              </div>
              <div className="auth-forgot-link">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>

            <button type="submit" className="auth-primary-btn">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;





