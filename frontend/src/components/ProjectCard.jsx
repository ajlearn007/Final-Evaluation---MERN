import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVertical, IconFolder } from "./Icons";

function ProjectCard({ project, onShare, onRename, onCopy, onDelete, onOpen }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleOpen = () => {
    if (onOpen) {
      onOpen(project);
      return;
    }
    navigate("/dashboard/projects", { state: { projectId: project._id } });
  };

  const handleAction = async (action) => {
    setMenuOpen(false);
    try {
      await action?.(project);
    } catch (err) {
      alert(err.message || "Action failed");
    }
  };

  return (
    <div
      className="mini-project-card"
      onClick={handleOpen}
    >
      <div className="mini-project-top">
        <IconFolder size={58} />
      </div>
      <div className="mini-project-bottom">
        <p>{project.name || "Project Name"}</p>
        <button
          type="button"
          className="mini-kebab-btn dark"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
        >
          <EllipsisVertical size={16} />
        </button>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="mini-menu-overlay"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
            }}
          />
          <div className="mini-card-menu" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => handleAction(onShare)}>
              Share
            </button>
            <button type="button" onClick={() => handleAction(onRename)}>
              Rename
            </button>
            <button type="button" onClick={() => handleAction(onCopy)}>
              Copy
            </button>
            <button type="button" onClick={() => handleAction(onDelete)}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProjectCard;
