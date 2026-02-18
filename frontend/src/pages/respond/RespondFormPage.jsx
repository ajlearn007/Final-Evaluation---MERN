import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function RespondFormPage() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [responderEmail, setResponderEmail] = useState("");
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadForm = async () => {
      try {
        const data = await apiRequest(`/api/forms/public/slug/${slug}`);
        setForm(data);
      } catch {
        setForm(null);
      }
    };
    loadForm();
  }, [slug]);

  if (!form) {
    return (
      <div className="respond-shell">
        <p className="muted-text">Loading form...</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    const payload = {
      responderEmail: responderEmail || undefined,
      answers: Object.entries(answers).map(([key, value]) => {
        const [sectionId, componentId] = key.split("__");
        return { sectionId, componentId, value };
      }),
    };

    try {
      await apiRequest(`/api/responses/form/${form._id}`, {
        method: "POST",
        body: payload,
      });
      setStatus("Response submitted. Thank you!");
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div className="respond-shell">
      <form className="respond-card" onSubmit={handleSubmit}>
        <h1 className="respond-title">{form.name}</h1>
        <p className="respond-subtitle">{form.description}</p>

        <div className="respond-email-row">
          <label className="auth-label">
            Email (optional)
            <input
              className="auth-input"
              type="email"
              value={responderEmail}
              onChange={(e) => setResponderEmail(e.target.value)}
            />
          </label>
        </div>

        {form.sections?.map((sec) => (
          <div key={sec.id} className="respond-section">
            <h2 className="respond-section-title">{sec.title}</h2>
            {sec.components?.map((cmp) => {
              const key = `${sec.id}__${cmp.id}`;
              if (cmp.type === "question") {
                if (cmp.questionType === "shortAnswer") {
                  return (
                    <div key={cmp.id} className="respond-field">
                      <label className="auth-label">{cmp.title}</label>
                      <input
                        type="text"
                        className="auth-input"
                        value={answers[key] || ""}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder="Short answer"
                      />
                    </div>
                  );
                }
                if (cmp.questionType === "longAnswer") {
                  return (
                    <div key={cmp.id} className="respond-field">
                      <label className="auth-label">{cmp.title}</label>
                      <textarea
                        className="auth-input"
                        rows={3}
                        value={answers[key] || ""}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder="Long answer"
                      />
                    </div>
                  );
                }
                if (cmp.questionType === "date") {
                  return (
                    <div key={cmp.id} className="respond-field">
                      <label className="auth-label">{cmp.title}</label>
                      <input
                        type="date"
                        className="auth-input"
                        value={answers[key] || ""}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                      />
                    </div>
                  );
                }
                if (cmp.questionType === "linear") {
                  const min = cmp.scaleMin ?? 0;
                  const max = cmp.scaleMax ?? 10;
                  const val = answers[key] !== undefined && answers[key] !== "" ? Number(answers[key]) : Math.floor((min + max) / 2);
                  return (
                    <div key={cmp.id} className="respond-field">
                      <label className="auth-label">{cmp.title}</label>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={val}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="respond-linear-slider"
                      />
                      <div className="respond-linear-labels">
                        <span>{min}</span>
                        <span className="respond-linear-value">{val}</span>
                        <span>{max}</span>
                      </div>
                    </div>
                  );
                }
                if (cmp.questionType === "rating") {
                  const starCount = cmp.starCount ?? 5;
                  const val = answers[key] !== undefined && answers[key] !== "" ? Number(answers[key]) : 0;
                  return (
                    <div key={cmp.id} className="respond-field">
                      <label className="auth-label">{cmp.title}</label>
                      <div className="respond-stars">
                        {Array.from({ length: starCount }, (_, i) => (
                          <button
                            key={i}
                            type="button"
                            className={"respond-star " + (i + 1 <= val ? "filled" : "")}
                            onClick={() => setAnswers((prev) => ({ ...prev, [key]: String(i + 1) }))}
                            aria-label={`Rate ${i + 1} of ${starCount}`}
                          >
                            â˜…
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (cmp.questionType === "mcq") {
                  return (
                    <div key={cmp.id} className="respond-field">
                      <label className="auth-label">{cmp.title}</label>
                      <div className="respond-options-row">
                        {cmp.options?.map((opt) => (
                          <label key={opt} className="respond-option-pill">
                            <input
                              type="radio"
                              name={key}
                              value={opt}
                              checked={answers[key] === opt}
                              onChange={(e) =>
                                setAnswers((prev) => ({ ...prev, [key]: e.target.value }))
                              }
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (cmp.questionType === "dropdown") {
                  return (
                    <div key={cmp.id} className="respond-field">
                      <label className="auth-label">{cmp.title}</label>
                      <select
                        className="auth-input"
                        value={answers[key] || ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                      >
                        <option value="">Select</option>
                        {cmp.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
              }

              if (cmp.type === "text") {
                return (
                  <p key={cmp.id} className="respond-text">
                    {cmp.title}
                  </p>
                );
              }
              if (cmp.type === "image" && cmp.mediaUrl) {
                return (
                  <div key={cmp.id} className="respond-media">
                    <img src={cmp.mediaUrl} alt={cmp.title || "Image"} className="respond-media-img" />
                    {cmp.title && <p className="respond-text">{cmp.title}</p>}
                  </div>
                );
              }
              if (cmp.type === "video" && cmp.mediaUrl) {
                return (
                  <div key={cmp.id} className="respond-media">
                    <video
                      src={cmp.mediaUrl}
                      controls
                      className="respond-media-video"
                      title={cmp.title}
                    />
                    {cmp.title && <p className="respond-text">{cmp.title}</p>}
                  </div>
                );
              }

              return null;
            })}
          </div>
        ))}

        {status && <p className="auth-info-text">{status}</p>}

        <button type="submit" className="auth-primary-btn">
          Submit
        </button>
      </form>
    </div>
  );
}

export default RespondFormPage;


