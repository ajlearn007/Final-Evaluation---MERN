import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CanovaLogo from "../../components/CanovaLogo";
import { IconEye } from "../../components/Icons";

function LoginPage() {
  const { loginWithCredentials } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await loginWithCredentials({
        email: form.email,
        password: form.password,
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
            Today is a new day. It&apos;s your day. You shape it.
            <br />
            Sign in to start managing your projects.
          </p>

          {error && <p className="auth-error-text">{error}</p>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="auth-label" htmlFor="email">
                Email
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="Example@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="auth-label" htmlFor="password">
                Password
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

              <div className="auth-forgot-link">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>

            <button type="submit" className="auth-primary-btn">
              Sign in
            </button>
          </form>

          <div className="auth-secondary-row">
            <span>Don&apos;t you have an account?</span>
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;





