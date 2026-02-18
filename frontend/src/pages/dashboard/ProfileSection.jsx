import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  IconProfile,
  IconSettings,
  IconLogout,
  IconChevronRight,
} from "../../components/Icons";

function ProfileSection() {
  const { user, logout, updateProfile, updateSettings } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    mobile: "",
    location: "USA",
  });
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      location: user.location || "USA",
    });
    setTheme(user.theme || "light");
  }, [user]);

  const onProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setError("");
    setMessage("");
    try {
      await updateProfile(profileForm);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDiscardProfile = () => {
    setError("");
    setMessage("");
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
      location: user?.location || "USA",
    });
  };

  const handleThemeChange = async (value) => {
    setTheme(value);
    setSavingSettings(true);
    setError("");
    setMessage("");
    try {
      await updateSettings({ theme: value });
      setMessage("Settings updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update settings");
      setTheme(user?.theme || "light");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="profile-screen profile-page-standalone">
      <aside className="profile-screen-sidebar">
        <div className="profile-side-user">
          <div className="profile-avatar-circle">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="profile-side-name">{user?.name || "Your name"}</p>
            <p className="profile-side-email">
              {user?.email || "yourname@gmail.com"}
            </p>
          </div>
        </div>

        <button
          type="button"
          className={
            "profile-side-item " + (activeTab === "profile" ? "active" : "")
          }
          onClick={() => {
            setActiveTab("profile");
            setError("");
            setMessage("");
          }}
        >
          <span>
            <IconProfile size={18} />
            My Profile
          </span>
          <IconChevronRight size={16} />
        </button>

        <button
          type="button"
          className={
            "profile-side-item " + (activeTab === "settings" ? "active" : "")
          }
          onClick={() => {
            setActiveTab("settings");
            setError("");
            setMessage("");
          }}
        >
          <span>
            <IconSettings size={18} />
            Settings
          </span>
          <IconChevronRight size={16} />
        </button>

        <button type="button" className="profile-side-item logout" onClick={logout}>
          <span>
            <IconLogout size={18} />
            Log Out
          </span>
        </button>
      </aside>

      <section className="profile-screen-main">
        <header className="profile-screen-header">
          <h1>{activeTab === "profile" ? "My Profile" : "Settings"}</h1>
        </header>

        <div className="profile-screen-body">
          {error && <p className="auth-error-text">{error}</p>}
          {message && <p className="auth-info-text">{message}</p>}

          {activeTab === "profile" ? (
            <>
              <div className="profile-main-user">
                <div className="profile-avatar-circle">
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="profile-main-name">{user?.name || "Your name"}</p>
                  <p className="profile-main-email">
                    {user?.email || "yourname@gmail.com"}
                  </p>
                </div>
              </div>

              <div className="profile-info-grid">
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => onProfileChange("name", e.target.value)}
                    placeholder="your name"
                  />
                </label>
                <label>
                  <span>Email account</span>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => onProfileChange("email", e.target.value)}
                    placeholder="yourname@gmail.com"
                  />
                </label>
                <label>
                  <span>Mobile number</span>
                  <input
                    type="text"
                    value={profileForm.mobile}
                    onChange={(e) => onProfileChange("mobile", e.target.value)}
                    placeholder="Add number"
                  />
                </label>
                <label>
                  <span>Location</span>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => onProfileChange("location", e.target.value)}
                    placeholder="USA"
                  />
                </label>
              </div>

              <div className="profile-actions-row">
                <button
                  type="button"
                  className="profile-save-btn"
                  disabled={savingProfile}
                  onClick={handleSaveProfile}
                >
                  {savingProfile ? "Saving..." : "Save Change"}
                </button>
                <button
                  type="button"
                  className="profile-discard-btn"
                  onClick={handleDiscardProfile}
                >
                  Discard Change
                </button>
              </div>
            </>
          ) : (
            <div className="settings-section">
              <h3>Preferences</h3>
              <div className="settings-row">
                <span>Theme</span>
                <select
                  value={theme}
                  disabled={savingSettings}
                  onChange={(e) => handleThemeChange(e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="settings-row">
                <span>Language</span>
                <span className="settings-value-static">Eng</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProfileSection;
