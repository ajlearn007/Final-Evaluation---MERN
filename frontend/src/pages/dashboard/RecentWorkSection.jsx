import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import {
  IconFolder,
  IconPencil,
  EllipsisVertical,
} from "../../components/Icons";

function RecentWorkSection() {
  const [recent, setRecent] = useState({ projects: [], forms: [] });
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuType, setMenuType] = useState(null);
  const navigate = useNavigate();

  const loadRecent = async () => {
    try {
      const data = await apiRequest("/api/projects/recent", { auth: true });
      setRecent(data);
    } catch {
      setRecent({ projects: [], forms: [] });
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const closeMenu = () => {
    setMenuOpenId(null);
    setMenuType(null);
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    alert("Link copied to clipboard");
  };

  const shareProject = async (project) => {
    const res = await apiRequest(`/api/projects/${project._id}/share`, {
      method: "POST",
      auth: true,
    });
    if (res?.shareLink) {
      await copyText(`${window.location.origin}${res.shareLink}`);
    }
    closeMenu();
  };

  const renameProject = async (project) => {
    const name = prompt("Enter new project name", project.name || "");
    if (!name || !name.trim()) return;
    await apiRequest(`/api/projects/${project._id}/rename`, {
      method: "PATCH",
      auth: true,
      body: { name },
    });
    closeMenu();
    await loadRecent();
  };

  const copyProject = async (project) => {
    await apiRequest(`/api/projects/${project._id}/copy`, {
      method: "POST",
      auth: true,
    });
    closeMenu();
    await loadRecent();
  };

  const deleteProject = async (project) => {
    if (!window.confirm(`Delete project "${project.name}"?`)) return;
    await apiRequest(`/api/projects/${project._id}`, {
      method: "DELETE",
      auth: true,
    });
    closeMenu();
    await loadRecent();
  };

  const shareForm = async (form) => {
    const res = await apiRequest(`/api/forms/${form._id}/share`, {
      method: "POST",
      auth: true,
    });
    if (res?.shareLink) {
      await copyText(`${window.location.origin}${res.shareLink}`);
    }
    closeMenu();
  };

  const renameForm = async (form) => {
    const name = prompt("Enter new form name", form.name || "");
    if (!name || !name.trim()) return;
    await apiRequest(`/api/forms/${form._id}/rename`, {
      method: "PATCH",
      auth: true,
      body: { name },
    });
    closeMenu();
    await loadRecent();
  };

  const copyForm = async (form) => {
    await apiRequest(`/api/forms/${form._id}/copy`, {
      method: "POST",
      auth: true,
    });
    closeMenu();
    await loadRecent();
  };

  const deleteForm = async (form) => {
    if (!window.confirm(`Delete form "${form.name}"?`)) return;
    await apiRequest(`/api/forms/${form._id}`, {
      method: "DELETE",
      auth: true,
    });
    closeMenu();
    await loadRecent();
  };

  return (
    <div>
      <div>
        <h2 className="section-heading">Recent Projects</h2>
        <div className="card-grid">
          {recent.projects.map((p) => (
            <div
              key={p._id}
              className="project-card"
              style={{ position: "relative" }}
              onClick={() =>
                navigate("/dashboard/projects", { state: { projectId: p._id } })
              }
            >
              <div
                style={{ position: "absolute", top: 12, right: 12, zIndex: 11 }}
              >
                <button
                  type="button"
                  className="project-card-menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(
                      menuOpenId === `proj-${p._id}` ? null : `proj-${p._id}`,
                    );
                    setMenuType("project");
                  }}
                  aria-label="Options"
                >
                  <EllipsisVertical size={18} />
                </button>
                {menuOpenId === `proj-${p._id}` && menuType === "project" && (
                  <>
                    <div
                      role="presentation"
                      style={{ position: "fixed", inset: 0, zIndex: 10 }}
                      onClick={closeMenu}
                    />
                    <div
                      className="card-menu-dropdown"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button type="button" onClick={() => shareProject(p)}>
                        Share
                      </button>
                      <button type="button" onClick={() => renameProject(p)}>
                        Rename
                      </button>
                      <button type="button" onClick={() => copyProject(p)}>
                        Copy
                      </button>
                      <button type="button" onClick={() => deleteProject(p)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="project-card-icon">
                <IconFolder size={28} />
              </div>
              <div className="project-card-title">{p.name}</div>
              <div className="card-sub">
                Created: {new Date(p.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 className="section-heading">Recent Forms</h2>
        <div className="card-grid">
          {recent.forms.map((f) => (
            <div
              key={f._id}
              className="form-card"
              style={{ position: "relative" }}
              onClick={() =>
                navigate("/dashboard/analysis", { state: { formId: f._id } })
              }
            >
              <div
                style={{ position: "absolute", top: 12, right: 12, zIndex: 11 }}
              >
                <button
                  type="button"
                  className="form-card-menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(
                      menuOpenId === `form-${f._id}` ? null : `form-${f._id}`,
                    );
                    setMenuType("form");
                  }}
                  aria-label="Options"
                >
                  <EllipsisVertical size={18} />
                </button>
                {menuOpenId === `form-${f._id}` && menuType === "form" && (
                  <>
                    <div
                      role="presentation"
                      style={{ position: "fixed", inset: 0, zIndex: 10 }}
                      onClick={closeMenu}
                    />
                    <div
                      className="card-menu-dropdown"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button type="button" onClick={() => shareForm(f)}>
                        Share
                      </button>
                      <button type="button" onClick={() => renameForm(f)}>
                        Rename
                      </button>
                      <button type="button" onClick={() => copyForm(f)}>
                        Copy
                      </button>
                      <button type="button" onClick={() => deleteForm(f)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="form-card-icon">
                <IconPencil size={24} />
              </div>
              <div className="form-card-body">
                <div className="card-title">{f.name}</div>
                <div className="card-sub">
                  Updated: {new Date(f.updatedAt).toLocaleDateString()}
                </div>
                <a
                  href="/dashboard/analysis"
                  className="form-card-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/dashboard/analysis", {
                      state: { formId: f._id },
                    });
                  }}
                >
                  View Analysis
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecentWorkSection;
