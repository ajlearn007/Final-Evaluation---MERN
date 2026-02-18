import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CanovaLogo from "../../components/CanovaLogo";
import {
  IconHome,
  IconAnalysis,
  IconFolder,
  IconProfile,
} from "../../components/Icons";

function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <CanovaLogo iconSize={28} />
        </div>
        <nav className="dash-nav">
          <NavLink
            to="/dashboard/home"
            end
            className={({ isActive }) =>
              "dash-nav-item" + (isActive ? " active" : "")
            }
          >
            <IconHome size={20} className="dash-nav-icon" />
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/dashboard/analysis"
            className={({ isActive }) =>
              "dash-nav-item" + (isActive ? " active" : "")
            }
          >
            <IconAnalysis size={20} className="dash-nav-icon" />
            <span>Analysis</span>
          </NavLink>
          <NavLink
            to="/dashboard/projects"
            className={({ isActive }) =>
              "dash-nav-item" + (isActive ? " active" : "")
            }
          >
            <IconFolder size={20} className="dash-nav-icon" />
            <span>Projects</span>
          </NavLink>
          <div style={{ flex: 1 }} />
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              "dash-nav-item" + (isActive ? " active" : "")
            }
          >
            <IconProfile size={20} className="dash-nav-icon" />
            <span>Profile</span>
          </NavLink>
        </nav>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <h1 className="dash-topbar-title">CANOVA</h1>
          </div>
          <div className="dash-topbar-right">
            <div className="dash-user-chip">
              <span className="dash-user-initial">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
              <div className="dash-user-meta">
                <span className="dash-user-name">{user?.name}</span>
                <span className="dash-user-email">{user?.email}</span>
              </div>
            </div>
            <button className="dash-logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <section className="dash-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default DashboardLayout;
