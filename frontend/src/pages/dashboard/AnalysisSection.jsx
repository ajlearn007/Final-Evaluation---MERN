import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { EllipsisVertical, IconPencil } from "../../components/Icons";
import StatusBadge from "../../components/Badges/StatusBadge";

function AnalysisSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [forms, setForms] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedFormId, setSelectedFormId] = useState(
    location.state?.formId || "",
  );
  const [menuOpenId, setMenuOpenId] = useState(null);

  const loadForms = useCallback(async () => {
    try {
      const data = await apiRequest("/api/forms", { auth: true });
      setForms(Array.isArray(data) ? data : []);
      if (data.length === 0) {
        setSelectedFormId("");
        return;
      }
      setSelectedFormId((prev) => prev || data[0]._id);
    } catch {
      setForms([]);
      setSelectedFormId("");
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  useEffect(() => {
    if (!selectedFormId) return;
    const loadSummary = async () => {
      try {
        const data = await apiRequest(
          `/api/forms/${selectedFormId}/responses/summary`,
          { auth: true },
        );
        setSummary(data);
      } catch {
        setSummary(null);
      }
    };
    loadSummary();
  }, [selectedFormId]);

  const closeMenu = () => setMenuOpenId(null);
  const views = summary?.views ?? 0;
  const viewsChange = 11.01;
  const chartLabels = ["+2hr", "+6hr", "+12hr", "+24hr", "+1 Day", "+4 Day", "+12 Day"];
  const thisYearData = [5, 12, 18, 22, 25, 27, 28];
  const lastYearData = [3, 8, 14, 18, 20, 22, 24];

  const handleViewDetails = (form) => {
    navigate(`/dashboard/analysis/${form._id}`, { state: { formName: form.name } });
    closeMenu();
  };

  const handleShare = async (form) => {
    const res = await apiRequest(`/api/forms/${form._id}/share`, {
      method: "POST",
      auth: true,
    });
    if (res?.shareLink) {
      await navigator.clipboard.writeText(
        `${window.location.origin}${res.shareLink}`,
      );
      alert("Link copied to clipboard");
    }
    closeMenu();
  };

  const handleExport = async (form) => {
    const analytics = await apiRequest(`/api/forms/${form._id}/responses/analytics`, {
      auth: true,
    });
    const blob = new Blob([JSON.stringify(analytics, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.name || "form"}-analytics.json`;
    a.click();
    URL.revokeObjectURL(url);
    closeMenu();
  };

  const handleDelete = async (form) => {
    if (!window.confirm(`Delete form "${form.name}"?`)) return;
    await apiRequest(`/api/forms/${form._id}`, {
      method: "DELETE",
      auth: true,
    });
    if (selectedFormId === form._id) {
      setSelectedFormId("");
      setSummary(null);
    }
    closeMenu();
    await loadForms();
  };

  return (
    <div className="analysis-page">
      <h1 className="analysis-page-title">Project Name</h1>

      <div className="analysis-kpis">
        <div className="analysis-kpi-card">
          <span className="analysis-kpi-label">Views</span>
          <span className="analysis-kpi-value">{views.toLocaleString()}</span>
          <span className="analysis-kpi-change positive">+{viewsChange}%</span>
          <span className="analysis-kpi-trend">UP</span>
        </div>
        <div className="analysis-kpi-card">
          <span className="analysis-kpi-label">Views</span>
          <span className="analysis-kpi-value">{views.toLocaleString()}</span>
          <span className="analysis-kpi-change positive">+{viewsChange}%</span>
          <span className="analysis-kpi-trend">UP</span>
        </div>
      </div>

      <div className="analysis-chart-card">
        <h3 className="analysis-chart-title">Average Response Chart</h3>
        <div className="analysis-chart-tabs">
          <span className="analysis-chart-tab active">Total Page</span>
          <span className="analysis-chart-tab">Operating Status</span>
        </div>
        <div className="analysis-chart-legend">
          <span className="analysis-legend-item">This year</span>
          <span className="analysis-legend-item dashed">Last year</span>
        </div>
        <div className="analysis-line-chart">
          <svg
            viewBox="0 0 400 120"
            className="analysis-chart-svg"
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="#1a1a2e"
              strokeWidth="2"
              points={thisYearData
                .map(
                  (d, i) =>
                    `${(i / (thisYearData.length - 1)) * 380 + 10},${120 - (d / 30) * 100}`,
                )
                .join(" ")}
            />
            <polyline
              fill="none"
              stroke="#0084F4"
              strokeWidth="2"
              strokeDasharray="4 4"
              points={lastYearData
                .map(
                  (d, i) =>
                    `${(i / (lastYearData.length - 1)) * 380 + 10},${120 - (d / 30) * 100}`,
                )
                .join(" ")}
            />
          </svg>
        </div>
        <div className="analysis-chart-xaxis">
          {chartLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>

      <div className="analysis-forms-grid">
        {forms.map((f) => (
          <div key={f._id} style={{ position: "relative" }}>
            <div
              className="analysis-form-card"
              onClick={() => handleViewDetails(f)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleViewDetails(f)}
            >
              <div className="analysis-form-card-icon">
                <IconPencil size={20} />
              </div>
              <span className="analysis-form-card-name">
                {f.name || "Form Name"}
              </span>
              <div className="analysis-form-card-badge">
                <StatusBadge status={f.isPublished ? "approved" : "pending"} />
              </div>
            </div>

            <div style={{ position: "absolute", top: 12, right: 12, zIndex: 11 }}>
              <button
                type="button"
                className="analysis-form-card-menu"
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
                  <div className="card-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => handleViewDetails(f)}>
                      View Details
                    </button>
                    <button type="button" onClick={() => handleShare(f)}>
                      Share
                    </button>
                    <button type="button" onClick={() => handleExport(f)}>
                      Export
                    </button>
                    <button type="button" onClick={() => handleDelete(f)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {forms.length === 0 && (
        <p className="muted-text">No forms yet. Create forms from Form Builder.</p>
      )}
    </div>
  );
}

export default AnalysisSection;

