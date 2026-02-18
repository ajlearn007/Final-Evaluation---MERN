import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CanovaLogo from "../../components/CanovaLogo";
import { IconEye } from "../../components/Icons";

function SignupPage() {
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;

    if (!hasMinLength) return "Password must be at least 8 characters long";
    if (!hasUpperCase)
      return "Password must contain at least one uppercase letter";
    if (!hasLowerCase)
      return "Password must contain at least one lowercase letter";
    if (!hasNumber) return "Password must contain at least one number";
    if (!hasSpecialChar)
      return "Password must contain at least one special character";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Real-time password validation
    if (name === "password" && value) {
      const passwordError = validatePassword(value);
      setError(passwordError);
    } else if (name === "confirmPassword" && value && form.password) {
      if (value !== form.password) {
        setError("Passwords do not match");
      } else {
        setError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate password
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signup({
        name: form.name,
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
              <label className="auth-label" htmlFor="name">
                Name
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="auth-input"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

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
                Create Password
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
            </div>

            <button type="submit" className="auth-primary-btn">
              Sign up
            </button>
          </form>

          <div className="auth-secondary-row">
            <span>Do you have an account?</span>
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;





