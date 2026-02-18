import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import ProjectCard from "../../components/ProjectCard";

function ProjectsSection() {
  const [projects, setProjects] = useState([]);

  const loadProjects = async () => {
    try {
      const data = await apiRequest("/api/projects", { auth: true });
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleShare = async (project) => {
    const res = await apiRequest(`/api/projects/${project._id}/share`, {
      method: "POST",
      auth: true,
    });
    if (res?.shareLink) {
      await navigator.clipboard.writeText(
        `${window.location.origin}${res.shareLink}`,
      );
      alert("Link copied to clipboard");
    }
  };

  const handleRename = async (project) => {
    const name = prompt("Enter new project name", project.name || "");
    if (!name || !name.trim()) return;
    await apiRequest(`/api/projects/${project._id}/rename`, {
      method: "PATCH",
      auth: true,
      body: { name },
    });
    await loadProjects();
  };

  const handleCopy = async (project) => {
    await apiRequest(`/api/projects/${project._id}/copy`, {
      method: "POST",
      auth: true,
    });
    await loadProjects();
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.name}"?`)) return;
    await apiRequest(`/api/projects/${project._id}`, {
      method: "DELETE",
      auth: true,
    });
    await loadProjects();
  };

  return (
    <div>
      <h1 className="home-welcome">Welcome to CANOVA</h1>
      <div className="projects-grid-screen">
        {projects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            onShare={handleShare}
            onRename={handleRename}
            onCopy={handleCopy}
            onDelete={handleDelete}
          />
        ))}
      </div>
      {projects.length === 0 && (
        <p className="muted-text">No projects yet. Create one from Home.</p>
      )}
    </div>
  );
}

export default ProjectsSection;
