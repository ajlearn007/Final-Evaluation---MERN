import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../../services/api";

function QuestionAnalysisPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const formName = location.state?.formName || "Title";
  const [analytics, setAnalytics] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!formId) return;
      try {
        const [analyticsData, formData] = await Promise.all([
          apiRequest(`/api/forms/${formId}/responses/analytics`, { auth: true }),
          apiRequest(`/api/forms/${formId}`, { auth: true }),
        ]);
        setAnalytics(analyticsData);
        setForm(formData);
      } catch {
        setAnalytics(null);
        setForm(null);
      }
    };
    load();
  }, [formId]);

  const handleDownload = () => {
    if (!analytics) return;
    const text = JSON.stringify(analytics, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${formId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!analytics && !form) {
    return (
      <div className="analysis-page">
        <p className="muted-text">Loading analysis...</p>
      </div>
    );
  }

  const questions = analytics?.byQuestion || [];
  const totalResponses = analytics?.totalResponses ?? 0;

  return (
    <div className="analysis-page question-analysis-page">
      <div className="question-analysis-header">
        <button type="button" className="fb-btn-secondary" onClick={() => navigate("/dashboard/analysis")}>
          {"<- Back"}
        </button>
        <h1 className="question-analysis-title">{formName}</h1>
        <button type="button" className="fb-btn-primary" onClick={handleDownload}>
          Save
        </button>
      </div>

      <div className="question-analysis-content">
        <h2 className="question-analysis-page-label">Page 01</h2>
        {questions.map((q, idx) => (
          <div key={`${q.sectionId}-${q.componentId}`} className="question-analysis-card">
            <h3 className="question-analysis-card-title">01 Question</h3>
            {q.questionType === "mcq" || q.questionType === "dropdown" ? (
              <>
                <div className="question-analysis-pie-wrap">
                  <div
                    className="question-analysis-pie"
                    style={{
                      background: (() => {
                        const entries = Object.entries(q.counts || {}).filter(([, v]) => v > 0);
                        const total = q.total || 1;
                        const colors = ["#0084F4", "#00C48C", "#1a1a2e", "#FFCF5C"];
                        let deg = 0;
                        const parts = entries.map(([, v], i) => {
                          const pct = (v / total) * 360;
                          const d = deg;
                          deg += pct;
                          return `${colors[i % colors.length]} ${d}deg ${d + pct}deg`;
                        });
                        return `conic-gradient(${parts.join(", ")})`;
                      })(),
                    }}
                  />
                  <div className="question-analysis-legend">
                    {Object.entries(q.counts || {}).map(([opt, count], i) => {
                      const colors = ["#0084F4", "#00C48C", "#1a1a2e", "#FFCF5C"];
                      const pct = q.total ? ((count / q.total) * 100).toFixed(1) : "0";
                      return (
                        <div key={opt} className="question-analysis-legend-item">
                          <span className="question-analysis-legend-dot" style={{ background: colors[i % colors.length] }} />
                          <span>Option</span>
                          <span>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="question-analysis-bar-wrap">
                  {Object.entries(q.counts || {}).map(([opt, count], i) => {
                    const colors = ["#7C3AED", "#5EEAD4", "#1a1a2e", "#0084F4"];
                    const maxCount = Math.max(...Object.values(q.counts || {}), 1);
                    const h = (count / maxCount) * 100;
                    return (
                      <div key={opt} className="question-analysis-bar-item">
                        <div className="question-analysis-bar-fill" style={{ height: `${h}%`, background: colors[i % colors.length] }} />
                        <span className="question-analysis-bar-label">{opt.length > 12 ? opt.slice(0, 12) + "..." : opt}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="question-analysis-pie-wrap">
                <div
                  className="question-analysis-pie"
                  style={{
                    background: totalResponses > 0
                      ? `conic-gradient(#0084F4 0% ${(totalResponses / (totalResponses + 1)) * 100}%, #e6eaef 0%)`
                      : "#e6eaef",
                  }}
                />
                <p className="muted-text">{q.total || 0} responses</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="question-analysis-footer">
        <button type="button" className="fb-btn-primary" onClick={handleDownload}>
          Download
        </button>
      </div>
    </div>
  );
}

export default QuestionAnalysisPage;

