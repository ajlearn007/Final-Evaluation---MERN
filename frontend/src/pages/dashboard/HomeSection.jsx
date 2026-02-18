import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import ProjectCard from "../../components/ProjectCard";
import FormCard from "../../components/FormCard";
import { IconFolderDocument, IconPencil } from "../../components/Icons";

function HomeSection() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState({ projects: [], forms: [] });
  const [shared, setShared] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [recentData, sharedData] = await Promise.all([
        apiRequest("/api/projects/recent", { auth: true }),
        apiRequest("/api/shared", { auth: true }),
      ]);
      setRecent(recentData);
      setShared(Array.isArray(sharedData) ? sharedData : []);
    } catch {
      setRecent({ projects: [], forms: [] });
      setShared([]);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    alert("Link copied to clipboard");
  };

  const handleProjectShare = async (project) => {
    const res = await apiRequest(`/api/projects/${project._id}/share`, {
      method: "POST",
      auth: true,
    });
    if (res?.shareLink) {
      await copyText(`${window.location.origin}${res.shareLink}`);
    }
  };

  const handleProjectRename = async (project) => {
    const name = prompt("Enter new project name", project.name || "");
    if (!name || !name.trim()) return;
    await apiRequest(`/api/projects/${project._id}/rename`, {
      method: "PATCH",
      auth: true,
      body: { name },
    });
    await loadData();
  };

  const handleProjectCopy = async (project) => {
    await apiRequest(`/api/projects/${project._id}/copy`, {
      method: "POST",
      auth: true,
    });
    await loadData();
  };

  const handleProjectDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.name}"?`)) return;
    await apiRequest(`/api/projects/${project._id}`, {
      method: "DELETE",
      auth: true,
    });
    await loadData();
  };

  const handleFormEdit = (form) => {
    navigate("/dashboard/form-builder", { state: { formId: form._id } });
  };

  const handleFormView = (form) => {
    navigate("/dashboard/analysis", { state: { formId: form._id } });
  };

  const handleSharedFormView = (form) => {
    if (!form?.publicSlug) return;
    window.open(
      `${window.location.origin}/respond/${form.publicSlug}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleFormRemove = async (form) => {
    if (!window.confirm(`Delete form "${form.name}"?`)) return;
    await apiRequest(`/api/forms/${form._id}`, {
      method: "DELETE",
      auth: true,
    });
    await loadData();
  };

  const recentItems = [
    ...recent.forms.map((f) => ({ type: "form", ...f })),
    ...recent.projects.map((p) => ({ type: "project", ...p })),
  ].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt) -
      new Date(a.updatedAt || a.createdAt),
  );

  return (
    <div>
      <section className="home-creation">
        <button
          className="home-creation-card"
          onClick={() =>
            navigate("/dashboard/form-builder", {
              state: { openCreateProject: true },
            })
          }
        >
          <div className="home-creation-icon">
            <IconFolderDocument size={28} />
          </div>
          <div className="home-creation-title">Start From scratch</div>
          <div className="home-creation-sub">Create your first Project now</div>
        </button>
        <button
          type="button"
          className="home-creation-card"
          onClick={() => navigate("/dashboard/form-builder")}
        >
          <div className="home-creation-icon">
            <IconPencil size={28} />
          </div>
          <div className="home-creation-title">Create Form</div>
          <div className="home-creation-sub">create your first Form now</div>
        </button>
      </section>

      <section>
        <h2 className="home-section-title">Recent Works</h2>
        <div className="card-grid">
          {recentItems.length === 0 && (
            <p className="muted-text">
              No recent items yet. Create a project or form to get started.
            </p>
          )}
          {recentItems.slice(0, 6).map((item) => {
            if (item.type === "form") {
              return (
                <FormCard
                  key={item._id}
                  form={item}
                  onEdit={handleFormEdit}
                  onView={handleFormView}
                  onRemove={handleFormRemove}
                />
              );
            } else {
              return (
                <ProjectCard
                  key={item._id}
                  project={item}
                  onShare={handleProjectShare}
                  onRename={handleProjectRename}
                  onCopy={handleProjectCopy}
                  onDelete={handleProjectDelete}
                />
              );
            }
          })}
        </div>
      </section>

      <section>
        <h2 className="home-section-title">Shared Content</h2>
        <div className="card-grid">
          {shared.length === 0 ? (
            <p className="muted-text">No shared content yet.</p>
          ) : (
            shared.slice(0, 6).map((item) => (
              <FormCard
                key={item._id}
                form={item}
                onView={handleSharedFormView}
                onEdit={handleSharedFormView}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default HomeSection;
