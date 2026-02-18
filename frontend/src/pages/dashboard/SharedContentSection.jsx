import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import { IconPencil, EllipsisVertical } from "../../components/Icons";

function SharedContentSection() {
  const [forms, setForms] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest("/api/shared", { auth: true });
        setForms(data);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  const closeMenu = () => {
    setMenuOpenId(null);
  };

  const getRespondLink = (form) =>
    form?.publicSlug ? `${window.location.origin}/respond/${form.publicSlug}` : "";

  const handleViewDetails = (form) => {
    const link = getRespondLink(form);
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
    closeMenu();
  };

  const handleCopyLink = async (form) => {
    const link = getRespondLink(form);
    if (!link) return;
    await navigator.clipboard.writeText(link);
    alert("Link copied to clipboard");
    closeMenu();
  };

  return (
    <div>
      <h2 className="section-heading">Shared With Me</h2>
      <div className="card-grid">
        {forms.map((f) => (
          <div
            key={f._id}
            className="form-card"
            style={{ position: "relative" }}
          >
            <div
              style={{ position: "absolute", top: 12, right: 12, zIndex: 11 }}
            >
              <button
                type="button"
                className="form-card-menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === f._id ? null : f._id);
                }}
                aria-label="Options"
              >
                <EllipsisVertical size={18} />
              </button>
              {menuOpenId === f._id && (
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
                    <button type="button" onClick={() => handleViewDetails(f)}>
                      View Details
                    </button>
                    <button type="button" onClick={() => handleCopyLink(f)}>
                      Copy
                    </button>
                    <button type="button" onClick={() => handleCopyLink(f)}>
                      Share
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
                Owner: {f.owner?.email || "Private"}
              </div>
              <a
                href="/dashboard/analysis"
                className="form-card-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleViewDetails(f);
                }}
              >
                View Analysis
              </a>
            </div>
          </div>
        ))}
        {forms.length === 0 && (
          <p className="muted-text">No shared forms yet.</p>
        )}
      </div>
    </div>
  );
}

export default SharedContentSection;
