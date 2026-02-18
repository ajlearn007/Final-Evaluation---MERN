import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { apiRequest } from "../../services/api";
import CanovaLogo from "../../components/CanovaLogo";
import {
  IconPlus,
  IconAddText,
  IconAddCondition,
  IconAddImage,
  IconAddVideo,
  IconAddSections,
  IconCube,
  IconClose,
  IconEye,
  IconProfile,
} from "../../components/Icons";

const emptySection = () => ({
  id: `sec_${Date.now()}`,
  title: "Untitled Section",
  color: "#B6B6B6",
  components: [],
  conditions: [],
});

const QUESTION_TYPES = [
  { value: "shortAnswer", label: "Short Answer" },
  { value: "longAnswer", label: "Long Answer" },
  { value: "mcq", label: "Multiple Choice" },
  { value: "dropdown", label: "Dropdown" },
  { value: "date", label: "Date" },
  { value: "linear", label: "Linear Scale" },
  { value: "rating", label: "Rating" },
];

function FormBuilderSection() {
  const location = useLocation();
  const requestedFormId = location.state?.formId || "";
  const [forms, setForms] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeFormId, setActiveFormId] = useState("");
  const [workingForm, setWorkingForm] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(
    Boolean(location.state?.openCreateProject),
  );
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRespondersMenu, setShowRespondersMenu] = useState(false);
  const [viewMode, setViewMode] = useState("canvas"); // "canvas" | "flowchart"
  const [projectName, setProjectName] = useState("");
  const [initialFormName, setInitialFormName] = useState("");
  const [newFormProjectId, setNewFormProjectId] = useState("");
  const [newFormName, setNewFormName] = useState("");
  const [publishSaveToProjectId, setPublishSaveToProjectId] = useState("");
  const [publishAccessType, setPublishAccessType] = useState("anyone");
  const [publishEmails, setPublishEmails] = useState([]);
  const [shareLink, setShareLink] = useState("");
  const [showSelectPageModal, setShowSelectPageModal] = useState(false);
  const [selectedConditionRef, setSelectedConditionRef] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const uploadTargetRef = useRef({ cmpId: null, type: "image" });
  const autosaveTimerRef = useRef(null);
  const lastAutosavePayloadRef = useRef("");

  const loadForms = async () => {
    try {
      const allForms = await apiRequest("/api/forms", { auth: true });
      setForms(allForms);
      if (allForms.length > 0 && !activeFormId) {
        const preferredForm =
          allForms.find((f) => f._id === requestedFormId) || allForms[0];
        setActiveFormId(preferredForm._id);
        setWorkingForm(preferredForm);
        setPublishAccessType(preferredForm.accessType || "anyone");
        setPublishEmails(preferredForm.allowedEmails || []);
        if (preferredForm.sections?.length) {
          setSelectedSectionId(preferredForm.sections[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    const loadRequestedForm = async () => {
      if (!requestedFormId) return;
      if (requestedFormId === activeFormId) return;
      try {
        const form = await apiRequest(`/api/forms/${requestedFormId}`, {
          auth: true,
        });
        setActiveFormId(form._id);
        setWorkingForm(form);
        setPublishAccessType(form.accessType || "anyone");
        setPublishEmails(form.allowedEmails || []);
        if (form.sections?.length) {
          setSelectedSectionId(form.sections[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadRequestedForm();
  }, [requestedFormId, activeFormId]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const list = await apiRequest("/api/projects", { auth: true });
        setProjects(list);
        if (list.length > 0 && !newFormProjectId)
          setNewFormProjectId(list[0]._id);
        if (list.length > 0 && !publishSaveToProjectId)
          setPublishSaveToProjectId(list[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    if (showNewFormModal || showProjectModal || showPublishModal)
      loadProjects();
  }, [showNewFormModal, showProjectModal, showPublishModal]);

  const activeSections = workingForm?.sections || [];
  const selectedSection =
    activeSections.find((s) => s.id === selectedSectionId) || null;
  const selectedCondition = selectedConditionRef
    ? activeSections
        .find((s) => s.id === selectedConditionRef.sectionId)
        ?.conditions?.find((c) => c.id === selectedConditionRef.conditionId) ||
      null
    : null;

  const updateForm = (patch) => {
    setWorkingForm((prev) => (prev ? { ...prev, ...patch } : null));
  };

  const updateSection = (sectionId, patch) => {
    updateForm({
      sections: activeSections.map((sec) =>
        sec.id === sectionId ? { ...sec, ...patch } : sec,
      ),
    });
  };

  const addSection = () => {
    const newSec = emptySection();
    newSec.title = `Page ${String(activeSections.length + 1).padStart(2, "0")}`;
    updateForm({ sections: [...activeSections, newSec] });
    setSelectedSectionId(newSec.id);
  };

  const addComponentToSection = (type, questionType) => {
    if (!selectedSection) return;
    const component = {
      id: `cmp_${Date.now()}`,
      type,
      title: "What is ?",
      questionType: questionType || undefined,
      options:
        questionType === "mcq" || questionType === "dropdown"
          ? ["Option 01", "Option 02"]
          : [],
      scaleMin: 0,
      scaleMax: 10,
      starCount: 5,
    };
    if (questionType === "linear") {
      component.scaleMin = 0;
      component.scaleMax = 10;
    }
    updateSection(selectedSection.id, {
      components: [...selectedSection.components, component],
    });
  };

  const getSavableFormPayload = () => {
    if (!workingForm) return null;
    const {
      name,
      description,
      backgroundColor,
      sections,
      accessType,
      allowedEmails,
      saveToProjectId,
    } = workingForm;
    return {
      name,
      description,
      backgroundColor,
      sections,
      accessType,
      allowedEmails,
      saveToProjectId,
    };
  };

  const handleSave = async () => {
    if (!activeFormId || !workingForm) return;
    setError("");
    try {
      const payload = getSavableFormPayload();
      const saved = await apiRequest(`/api/forms/${activeFormId}`, {
        method: "PUT",
        auth: true,
        body: payload,
      });
      lastAutosavePayloadRef.current = JSON.stringify(payload);
      setWorkingForm(saved);
      setForms((prev) => prev.map((f) => (f._id === saved._id ? saved : f)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePublish = async () => {
    if (!activeFormId) return;
    setError("");
    try {
      const allowedEmails =
        publishAccessType === "restricted" ? publishEmails : [];
      const res = await apiRequest(`/api/forms/${activeFormId}/publish`, {
        method: "POST",
        auth: true,
        body: {
          accessType: publishAccessType,
          allowedEmails,
          saveToProjectId: publishSaveToProjectId || undefined,
        },
      });
      setWorkingForm((prev) =>
        prev
          ? {
              ...prev,
              publicSlug: res.publicSlug,
              isPublished: true,
              accessType: publishAccessType,
              allowedEmails,
            }
          : null,
      );
      setShareLink(`${window.location.origin}/respond/${res.publicSlug}`);
      setShowPublishModal(false);
      setShowShareModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await apiRequest("/api/projects", {
        method: "POST",
        auth: true,
        body: { name: projectName, initialFormName },
      });
      const newForm = res.initialForm;
      setForms((prev) => [newForm, ...prev]);
      setActiveFormId(newForm._id);
      setWorkingForm(newForm);
      setPublishAccessType("anyone");
      setPublishEmails([]);
      setSelectedSectionId(newForm.sections?.[0]?.id || "");
      setShowProjectModal(false);
      setProjectName("");
      setInitialFormName("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateNewForm = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const form = await apiRequest(`/api/forms/project/${newFormProjectId}`, {
        method: "POST",
        auth: true,
        body: { name: newFormName },
      });
      setForms((prev) => [form, ...prev]);
      setActiveFormId(form._id);
      setWorkingForm(form);
      setPublishAccessType(form.accessType || "anyone");
      setPublishEmails(form.allowedEmails || []);
      setSelectedSectionId(form.sections?.[0]?.id || "");
      setShowNewFormModal(false);
      setNewFormName("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePreview = () => {
    if (workingForm?.publicSlug) {
      window.open(
        `${window.location.origin}/respond/${workingForm.publicSlug}`,
        "_blank",
      );
    } else {
      alert("Save and publish the form first to get a preview link.");
    }
  };

  const removeComponent = (cmpId) => {
    if (!selectedSection) return;
    updateSection(selectedSection.id, {
      components: selectedSection.components.filter((c) => c.id !== cmpId),
    });
  };

  const addCondition = (sectionId = selectedSectionId) => {
    const section = activeSections.find((sec) => sec.id === sectionId);
    if (!section) return null;
    const cond = {
      id: `cond_${Date.now()}`,
      questionComponentId:
        section.components.find((c) => c.type === "question")?.id || "",
      operator: "equals",
      value: "",
      targetSectionId: "",
      elseSectionId: "",
    };
    updateSection(section.id, {
      conditions: [...(section.conditions || []), cond],
    });
    return cond;
  };

  const openSelectPageModal = (sectionId, conditionId) => {
    setSelectedConditionRef({ sectionId, conditionId });
    setShowSelectPageModal(true);
  };

  const getSectionLabel = (sectionId) => {
    const index = activeSections.findIndex((sec) => sec.id === sectionId);
    if (index === -1) return "Page";
    return `Page ${String(index + 1).padStart(2, "0")}`;
  };

  const flowchartSourceSection = selectedSection || activeSections[0] || null;
  const flowchartCondition = flowchartSourceSection?.conditions?.[0] || null;
  const flowchartTrueLabel = flowchartCondition?.targetSectionId
    ? getSectionLabel(flowchartCondition.targetSectionId)
    : "Select page";
  const flowchartFalseLabel = flowchartCondition?.elseSectionId
    ? getSectionLabel(flowchartCondition.elseSectionId)
    : "Select page";

  const handleOpenFlowchartCondition = () => {
    if (!flowchartSourceSection) return;
    let condition = flowchartCondition;
    if (!condition) {
      condition = addCondition(flowchartSourceSection.id);
    }
    if (condition) {
      openSelectPageModal(flowchartSourceSection.id, condition.id);
    }
  };

  const updateCondition = (sectionId, condId, patch) => {
    const sec = activeSections.find((s) => s.id === sectionId);
    if (!sec) return;
    const conditions = (sec.conditions || []).map((c) =>
      c.id === condId ? { ...c, ...patch } : c,
    );
    updateSection(sectionId, { conditions });
  };

  const handleFileUpload = (cmpId, files, type) => {
    if (!files?.length || !selectedSection) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      updateSection(selectedSection.id, {
        components: selectedSection.components.map((c) =>
          c.id === cmpId ? { ...c, mediaUrl: dataUrl, mediaType: type } : c,
        ),
      });
    };
    reader.readAsDataURL(file);
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
    }
  };

  const addEmailToPublish = () => {
    const email = prompt("Enter email address");
    const normalized = email?.trim().toLowerCase();
    if (!normalized) return;
    setPublishAccessType("restricted");
    setPublishEmails((prev) =>
      prev.includes(normalized) ? prev : [...prev, normalized],
    );
  };

  useEffect(() => {
    if (!workingForm || !activeFormId) return;
    const payload = getSavableFormPayload();
    const payloadString = JSON.stringify(payload);
    if (!payloadString || payloadString === lastAutosavePayloadRef.current) {
      return;
    }
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(async () => {
      try {
        await apiRequest(`/api/forms/${activeFormId}`, {
          method: "PUT",
          auth: true,
          body: payload,
        });
        lastAutosavePayloadRef.current = payloadString;
      } catch (err) {
        console.error("Autosave failed:", err);
      }
    }, 1000);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [workingForm, activeFormId]);

  useEffect(() => {
    if (forms.length > 0 && !activeFormId) {
      const first = forms[0];
      setActiveFormId(first._id);
      setWorkingForm(first);
      if (first.sections?.length) setSelectedSectionId(first.sections[0].id);
    }
  }, [forms.length, activeFormId]);

  return (
    <div className="fb-create-shell">
      <aside className="fb-sidebar-left">
        <div className="fb-logo-wrap">
          <CanovaLogo iconSize={28} />
        </div>
        <div className="fb-pages-list">
          {activeSections.map((sec, idx) => (
            <button
              key={sec.id}
              type="button"
              className={
                "fb-page-pill " +
                (sec.id === selectedSectionId ? " active" : "")
              }
              onClick={() => setSelectedSectionId(sec.id)}
            >
              Page {String(idx + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
        <button type="button" className="fb-add-page-btn" onClick={addSection}>
          <IconPlus size={20} />
          Add new Page
        </button>
        <div className="fb-sidebar-actions">
          <button
            type="button"
            className="fb-btn-secondary"
            onClick={() =>
              setViewMode(viewMode === "flowchart" ? "canvas" : "flowchart")
            }
          >
            {viewMode === "flowchart" ? "Back to form" : "Flow chart"}
          </button>
        </div>
        <div style={{ flex: 1 }} />
        <NavLink to="/dashboard/profile" className="fb-profile-link">
          <IconProfile size={18} />
          Profile
        </NavLink>
      </aside>

      <div className="fb-center">
        <div className="fb-top-bar">
          <input
            type="text"
            className="fb-form-title-input"
            value={workingForm?.name || ""}
            onChange={(e) => updateForm({ name: e.target.value })}
            placeholder="Title"
            style={{ fontSize: "20px", fontWeight: "600" }}
          />
          <div className="fb-top-actions">
            <button
              type="button"
              className="fb-btn-secondary fb-preview-btn"
              onClick={handlePreview}
            >
              Preview
            </button>
            <button
              type="button"
              className="fb-btn-primary fb-save-btn"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>

        {viewMode === "flowchart" ? (
          <div className="fb-flowchart-view">
            <div className="fb-flowchart-node fb-flowchart-start">
              {flowchartSourceSection
                ? getSectionLabel(flowchartSourceSection.id)
                : "Page 01"}
            </div>
            <div className="fb-flowchart-branch">
              <button
                type="button"
                className="fb-flowchart-cond"
                onClick={handleOpenFlowchartCondition}
              >
                <IconEye size={16} />
                True
              </button>
              <button
                type="button"
                className="fb-flowchart-cond"
                onClick={handleOpenFlowchartCondition}
              >
                <IconEye size={16} />
                False
              </button>
            </div>
            <div className="fb-flowchart-nodes">
              <div className="fb-flowchart-node">{flowchartTrueLabel}</div>
              <div className="fb-flowchart-node">{flowchartFalseLabel}</div>
            </div>
            <button
              type="button"
              className="fb-btn-primary fb-next-btn"
              onClick={() => setViewMode("canvas")}
            >
              Next
            </button>
          </div>
        ) : (
          <div
            className="fb-canvas"
            style={{
              backgroundColor: workingForm?.backgroundColor || "#ffffff",
            }}
          >
            {!workingForm ? (
              <div className="fb-empty-state">
                <p>Select or create a project to start building forms.</p>
                <button
                  type="button"
                  className="fb-btn-primary"
                  onClick={() => setShowProjectModal(true)}
                >
                  + Create Project
                </button>
              </div>
            ) : selectedSection ? (
              <>
                <div className="fb-component-list">
                  {selectedSection.components.map((cmp, idx) => (
                    <div key={cmp.id} className="fb-question-block">
                      {cmp.type === "text" ? (
                        <>
                          <div className="fb-question-head">
                            <span className="fb-q-label">Text</span>
                            <button
                              type="button"
                              className="fb-remove-cmp"
                              onClick={() => removeComponent(cmp.id)}
                              aria-label="Remove"
                            >
                              <IconClose size={16} />
                            </button>
                          </div>
                          <input
                            type="text"
                            className="fb-question-title"
                            value={cmp.title || ""}
                            onChange={(e) => {
                              updateSection(selectedSection.id, {
                                components: selectedSection.components.map(
                                  (c) =>
                                    c.id === cmp.id
                                      ? { ...c, title: e.target.value }
                                      : c,
                                ),
                              });
                            }}
                            placeholder="What is ?"
                          />
                        </>
                      ) : (
                        <>
                          <div className="fb-question-head">
                            <span className="fb-q-label">Q{idx + 1}</span>
                            <select
                              className="fb-type-select"
                              value={cmp.questionType || "shortAnswer"}
                              onChange={(e) => {
                                const v = e.target.value;
                                updateSection(selectedSection.id, {
                                  components: selectedSection.components.map(
                                    (c) =>
                                      c.id === cmp.id
                                        ? {
                                            ...c,
                                            questionType: v,
                                            options:
                                              v === "mcq" || v === "dropdown"
                                                ? c.options?.length
                                                  ? c.options
                                                  : ["Option 01", "Option 02"]
                                                : c.options,
                                            scaleMin:
                                              v === "linear"
                                                ? (c.scaleMin ?? 0)
                                                : undefined,
                                            scaleMax:
                                              v === "linear"
                                                ? (c.scaleMax ?? 10)
                                                : undefined,
                                            starCount:
                                              v === "rating"
                                                ? (c.starCount ?? 5)
                                                : undefined,
                                          }
                                        : c,
                                  ),
                                });
                              }}
                            >
                              {QUESTION_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="fb-remove-cmp"
                              onClick={() => removeComponent(cmp.id)}
                              aria-label="Remove"
                            >
                              <IconClose size={16} />
                            </button>
                          </div>
                          <input
                            type="text"
                            className="fb-question-title"
                            value={cmp.title || ""}
                            onChange={(e) => {
                              updateSection(selectedSection.id, {
                                components: selectedSection.components.map(
                                  (c) =>
                                    c.id === cmp.id
                                      ? { ...c, title: e.target.value }
                                      : c,
                                ),
                              });
                            }}
                            placeholder="What is ?"
                          />

                          {cmp.questionType === "shortAnswer" && (
                            <input
                              type="text"
                              className="fb-input-short"
                              placeholder="Short answer text"
                              readOnly
                            />
                          )}
                          {cmp.questionType === "longAnswer" && (
                            <textarea
                              className="fb-input-long"
                              placeholder="Long answer text"
                              rows={3}
                              readOnly
                            />
                          )}
                          {(cmp.questionType === "mcq" ||
                            cmp.questionType === "dropdown") && (
                            <div className="fb-options-wrap">
                              {cmp.options?.map((opt, i) => (
                                <label key={i} className="fb-radio-wrap">
                                  <input
                                    type="radio"
                                    name={`q_${cmp.id}`}
                                    readOnly
                                  />
                                  <input
                                    type="text"
                                    className="fb-option-inline"
                                    value={opt}
                                    onChange={(e) => {
                                      const next = [...(cmp.options || [])];
                                      next[i] = e.target.value;
                                      updateSection(selectedSection.id, {
                                        components:
                                          selectedSection.components.map((c) =>
                                            c.id === cmp.id
                                              ? { ...c, options: next }
                                              : c,
                                          ),
                                      });
                                    }}
                                    placeholder={`Option ${String(i + 1).padStart(2, "0")}`}
                                  />
                                </label>
                              ))}
                            </div>
                          )}
                          {cmp.questionType === "date" && (
                            <div className="fb-date-wrap">
                              <input
                                type="date"
                                className="fb-input-short fb-input-date"
                                placeholder="DD/MM/YYYY"
                              />
                              <span className="fb-calendar-icon" aria-hidden>
                                Cal
                              </span>
                            </div>
                          )}
                          {cmp.questionType === "linear" && (
                            <div className="fb-linear-wrap">
                              <div className="fb-linear-inputs">
                                <input
                                  type="text"
                                  className="fb-linear-label-inp"
                                  value={cmp.scaleMin ?? 0}
                                  onChange={(e) => {
                                    const n = parseInt(e.target.value, 10);
                                    if (!isNaN(n))
                                      updateSection(selectedSection.id, {
                                        components:
                                          selectedSection.components.map((c) =>
                                            c.id === cmp.id
                                              ? { ...c, scaleMin: n }
                                              : c,
                                          ),
                                      });
                                  }}
                                />
                                <span className="fb-linear-to">
                                  Scale Starting
                                </span>
                                <input
                                  type="text"
                                  className="fb-linear-label-inp"
                                  value={cmp.scaleMax ?? 10}
                                  onChange={(e) => {
                                    const n = parseInt(e.target.value, 10);
                                    if (!isNaN(n))
                                      updateSection(selectedSection.id, {
                                        components:
                                          selectedSection.components.map((c) =>
                                            c.id === cmp.id
                                              ? { ...c, scaleMax: n }
                                              : c,
                                          ),
                                      });
                                  }}
                                />
                                <span className="fb-linear-to">
                                  Scale Ending
                                </span>
                              </div>
                              <div className="fb-linear-slider-wrap">
                                <input
                                  type="range"
                                  min={cmp.scaleMin ?? 0}
                                  max={cmp.scaleMax ?? 10}
                                  defaultValue={Math.floor(
                                    ((cmp.scaleMax ?? 10) -
                                      (cmp.scaleMin ?? 0)) /
                                      2,
                                  )}
                                  className="fb-linear-slider"
                                  readOnly
                                />
                                <span className="fb-linear-value">5</span>
                              </div>
                              <div className="fb-linear-minmax">
                                <span>{cmp.scaleMin ?? 0}</span>
                                <span>{cmp.scaleMax ?? 10}</span>
                              </div>
                            </div>
                          )}
                          {cmp.questionType === "rating" && (
                            <div className="fb-rating-wrap">
                              <div className="fb-stars">
                                {Array.from(
                                  { length: cmp.starCount ?? 5 },
                                  (_, i) => (
                                    <span key={i} className="fb-star">
                                      â˜…
                                    </span>
                                  ),
                                )}
                              </div>
                              <label className="fb-star-count-label">
                                Star Count:
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={cmp.starCount ?? 5}
                                  onChange={(e) => {
                                    const n = parseInt(e.target.value, 10);
                                    if (!isNaN(n))
                                      updateSection(selectedSection.id, {
                                        components:
                                          selectedSection.components.map((c) =>
                                            c.id === cmp.id
                                              ? { ...c, starCount: n }
                                              : c,
                                          ),
                                      });
                                  }}
                                  className="fb-star-count-inp"
                                />
                              </label>
                            </div>
                          )}
                          {(cmp.type === "image" || cmp.type === "video") && (
                            <div className="fb-upload-wrap">
                              <div
                                className="fb-upload-zone"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  handleFileUpload(
                                    cmp.id,
                                    e.dataTransfer.files,
                                    cmp.type,
                                  );
                                }}
                              >
                                {cmp.mediaUrl ? (
                                  cmp.type === "image" ? (
                                    <img
                                      src={cmp.mediaUrl}
                                      alt="Uploaded"
                                      className="fb-upload-preview"
                                    />
                                  ) : (
                                    <video
                                      src={cmp.mediaUrl}
                                      controls
                                      className="fb-upload-preview"
                                    />
                                  )
                                ) : (
                                  <>
                                    <p className="fb-upload-text">
                                      Drag & drop files to upload
                                    </p>
                                    <p className="fb-upload-hint">
                                      Consider upto 25 MB per Image
                                    </p>
                                    <span className="fb-upload-or">or</span>
                                    <button
                                      type="button"
                                      className="fb-btn-browse"
                                      onClick={() => {
                                        uploadTargetRef.current = {
                                          cmpId: cmp.id,
                                          type: cmp.type,
                                        };
                                        fileInputRef.current?.click();
                                      }}
                                    >
                                      Browse files
                                    </button>
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept={
                                        cmp.type === "image"
                                          ? "image/*"
                                          : "video/*"
                                      }
                                      style={{ display: "none" }}
                                      onChange={(e) => {
                                        const { cmpId, type } =
                                          uploadTargetRef.current;
                                        if (cmpId)
                                          handleFileUpload(
                                            cmpId,
                                            e.target.files,
                                            type,
                                          );
                                        e.target.value = "";
                                      }}
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="fb-empty-state">
                <p>No section selected. Add a page from the left.</p>
              </div>
            )}
          </div>
        )}

        <div className="fb-center-actions">
          <button
            type="button"
            className="fb-btn-secondary"
            onClick={() => setShowProjectModal(true)}
          >
            + Create Project
          </button>
          <button
            type="button"
            className="fb-btn-secondary"
            onClick={() => setShowNewFormModal(true)}
          >
            + Create Form
          </button>
          <select
            className="fb-form-select"
            value={activeFormId}
            onChange={async (e) => {
              const id = e.target.value;
              setActiveFormId(id);
              if (!id) return;
              try {
                const form = await apiRequest(`/api/forms/${id}`, {
                  auth: true,
                });
                setWorkingForm(form);
                setPublishAccessType(form.accessType || "anyone");
                setPublishEmails(form.allowedEmails || []);
                if (form.sections?.length)
                  setSelectedSectionId(form.sections[0].id);
              } catch (err) {
                setError(err.message);
              }
            }}
          >
            <option value="">Select form</option>
            {forms.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <aside className="fb-sidebar-right">
        <button
          type="button"
          className="fb-add-btn"
          onClick={() => addComponentToSection("question", "shortAnswer")}
        >
          <IconPlus size={18} />
          Add Question
        </button>
        <button
          type="button"
          className="fb-add-btn"
          onClick={() => addComponentToSection("text")}
        >
          <IconAddText size={18} />
          Add Text
        </button>
        <button
          type="button"
          className="fb-add-condition-btn"
          onClick={() => {
            if (!selectedSection) return;
            const newCondition = addCondition(selectedSection.id);
            if (newCondition && selectedSection) {
              openSelectPageModal(selectedSection.id, newCondition.id);
            }
          }}
        >
          <IconAddCondition size={18} />
          Add Condition
        </button>
        <button
          type="button"
          className="fb-add-btn"
          onClick={() => addComponentToSection("image")}
        >
          <IconAddImage size={18} />
          Add Image
        </button>
        <button
          type="button"
          className="fb-add-btn"
          onClick={() => addComponentToSection("video")}
        >
          <IconAddVideo size={18} />
          Add Video
        </button>
        <button type="button" className="fb-add-btn" onClick={addSection}>
          <IconAddSections size={18} />
          Add Sections
        </button>
        <div className="fb-color-row">
          <label className="fb-color-label">
            Background Color
            <div className="fb-color-inp-wrap">
              <input
                type="color"
                className="fb-color-swatch"
                value={workingForm?.backgroundColor || "#B6B6B6"}
                onChange={(e) =>
                  updateForm({ backgroundColor: e.target.value })
                }
              />
              <div className="fb-color-info">
                <input
                  type="text"
                  className="fb-color-hex"
                  value={(workingForm?.backgroundColor || "#B6B6B6")
                    .replace("#", "")
                    .toUpperCase()}
                  readOnly
                />
                <span className="fb-color-opacity">100%</span>
              </div>
            </div>
          </label>
        </div>
        <div className="fb-color-row">
          <label className="fb-color-label">
            Section Color
            <div className="fb-color-inp-wrap">
              <input
                type="color"
                className="fb-color-swatch"
                value={selectedSection?.color || "#B6B6B6"}
                onChange={(e) =>
                  selectedSection &&
                  updateSection(selectedSection.id, { color: e.target.value })
                }
              />
              <div className="fb-color-info">
                <input
                  type="text"
                  className="fb-color-hex"
                  value={(selectedSection?.color || "#B6B6B6")
                    .replace("#", "")
                    .toUpperCase()}
                  readOnly
                />
                <span className="fb-color-opacity">100%</span>
              </div>
            </div>
          </label>
        </div>
        <button
          type="button"
          className="fb-btn-primary fb-next-btn"
          onClick={() => setShowPublishModal(true)}
        >
          Next
        </button>
      </aside>

      {error && <p className="fb-error">{error}</p>}

      {showProjectModal && (
        <div className="fb-modal-backdrop">
          <div className="fb-modal">
            <div className="fb-modal-header">
              <IconCube size={22} />
              <h3 className="fb-modal-title">Create Project</h3>
              <button
                type="button"
                className="fb-modal-close"
                onClick={() => setShowProjectModal(false)}
              >
                <IconClose size={20} />
              </button>
            </div>
            <form className="fb-modal-form" onSubmit={handleCreateProject}>
              <label className="fb-modal-label">
                Project Name{" "}
                <input
                  className="fb-modal-input"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project Name"
                  required
                />
              </label>
              <label className="fb-modal-label">
                Form Name{" "}
                <input
                  className="fb-modal-input"
                  value={initialFormName}
                  onChange={(e) => setInitialFormName(e.target.value)}
                  placeholder="Form Name"
                  required
                />
              </label>
              <div className="fb-modal-actions">
                <button type="submit" className="fb-btn-primary fb-create-btn">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewFormModal && (
        <div className="fb-modal-backdrop">
          <div className="fb-modal">
            <div className="fb-modal-header">
              <IconCube size={22} />
              <h3 className="fb-modal-title">New Form</h3>
              <button
                type="button"
                className="fb-modal-close"
                onClick={() => setShowNewFormModal(false)}
              >
                <IconClose size={20} />
              </button>
            </div>
            <form className="fb-modal-form" onSubmit={handleCreateNewForm}>
              <label className="fb-modal-label">
                Project{" "}
                <select
                  className="fb-modal-input"
                  value={newFormProjectId}
                  onChange={(e) => setNewFormProjectId(e.target.value)}
                  required
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="fb-modal-label">
                Form Name{" "}
                <input
                  className="fb-modal-input"
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  placeholder="Form name"
                  required
                />
              </label>
              <div className="fb-modal-actions">
                <button
                  type="button"
                  className="fb-btn-secondary"
                  onClick={() => setShowNewFormModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="fb-btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPublishModal && (
        <div className="fb-modal-backdrop">
          <div className="fb-modal fb-publish-modal">
            <div className="fb-modal-header">
              <IconCube size={22} />
              <h3 className="fb-modal-title">Publish</h3>
              <button
                type="button"
                className="fb-modal-close"
                onClick={() => setShowPublishModal(false)}
              >
                <IconClose size={20} />
              </button>
            </div>
            <div className="fb-publish-body">
              <div className="fb-publish-row">
                <span className="fb-publish-label">Save to</span>
                <div className="fb-publish-field">
                  <span>
                    {projects.find((p) => p._id === publishSaveToProjectId)
                      ?.name || "Project"}
                  </span>
                  <button
                    type="button"
                    className="fb-link"
                    onClick={() =>
                      setPublishSaveToProjectId(projects[0]?._id || "")
                    }
                  >
                    Change
                  </button>
                </div>
              </div>
              <div className="fb-publish-row">
                <span className="fb-publish-label">Responders</span>
                <div className="fb-publish-field">
                  <button
                    type="button"
                    className="fb-responders-btn"
                    onClick={() =>
                      setPublishAccessType((prev) =>
                        prev === "anyone" ? "restricted" : "anyone",
                      )
                    }
                  >
                    {publishAccessType === "anyone"
                      ? "Anyone with the Link"
                      : "Restricted"}
                  </button>
                  <button
                    type="button"
                    className="fb-link"
                    onClick={() => setShowRespondersMenu((prev) => !prev)}
                  >
                    Manage
                  </button>
                </div>
                {showRespondersMenu && (
                  <div className="fb-access-menu">
                    <button
                      type="button"
                      className={publishAccessType === "anyone" ? "active" : ""}
                      onClick={() => {
                        setPublishAccessType("anyone");
                        setShowRespondersMenu(false);
                      }}
                    >
                      Anyone
                    </button>
                    <button
                      type="button"
                      className={
                        publishAccessType === "restricted" ? "active" : ""
                      }
                      onClick={() => {
                        setPublishAccessType("restricted");
                        setShowRespondersMenu(false);
                      }}
                    >
                      Restricted
                    </button>
                  </div>
                )}
              </div>
              {publishAccessType === "restricted" && (
                <div className="fb-share-tab">
                  <span className="fb-publish-label">Share</span>
                  <div className="fb-share-list">
                    <div className="fb-share-item">
                      <span className="fb-share-avatar" /> Owner
                    </div>
                    {publishEmails.map((email, i) => (
                      <div key={i} className="fb-share-item">
                        <span className="fb-share-avatar" />
                        {email}
                        <button type="button" className="fb-link">
                          Edit
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="fb-link"
                      onClick={addEmailToPublish}
                    >
                      + Add Mails
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="fb-modal-actions">
              <button
                type="button"
                className="fb-btn-secondary"
                onClick={() => setShowPublishModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="fb-btn-primary"
                onClick={handlePublish}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fb-modal-backdrop">
          <div className="fb-modal fb-share-modal">
            <div className="fb-modal-header">
              <span className="fb-share-icon">↗</span>
              <h3 className="fb-modal-title">Share</h3>
              <button
                type="button"
                className="fb-modal-close"
                onClick={() => setShowShareModal(false)}
              >
                <IconClose size={20} />
              </button>
            </div>
            <div className="fb-share-body">
              <span className="fb-publish-label">Share</span>
              <button
                type="button"
                className="fb-copy-link-btn"
                onClick={copyShareLink}
              >
                Link Copy the Link
              </button>
              <button
                type="button"
                className="fb-btn-primary fb-share-submit"
                onClick={() => setShowShareModal(false)}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {showSelectPageModal && (
        <div className="fb-modal-backdrop">
          <div className="fb-modal fb-select-page-modal">
            <div className="fb-modal-header">
              <h3 className="fb-modal-title">Select Page</h3>
              <button
                type="button"
                className="fb-modal-close"
                onClick={() => {
                  setShowSelectPageModal(false);
                  setSelectedConditionRef(null);
                }}
              >
                <IconClose size={20} />
              </button>
            </div>
            <div className="fb-modal-body">
              <p className="fb-modal-desc">
                If the conditions are all met, it lead the user to the page
                you've Selected here
              </p>
              <div className="fb-select-page-row">
                <label className="fb-select-page-label">
                  Select, if it's true
                </label>
                <select
                  className="fb-select-page-dropdown"
                  value={selectedCondition?.targetSectionId || ""}
                  onChange={(e) => {
                    if (selectedConditionRef) {
                      updateCondition(
                        selectedConditionRef.sectionId,
                        selectedConditionRef.conditionId,
                        {
                          targetSectionId: e.target.value,
                        },
                      );
                    }
                  }}
                >
                  <option value="">Page</option>
                  {activeSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {getSectionLabel(sec.id)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fb-select-page-row">
                <label className="fb-select-page-label">
                  Select, if it's false
                </label>
                <select
                  className="fb-select-page-dropdown"
                  value={selectedCondition?.elseSectionId || ""}
                  onChange={(e) => {
                    if (selectedConditionRef) {
                      updateCondition(
                        selectedConditionRef.sectionId,
                        selectedConditionRef.conditionId,
                        {
                          elseSectionId: e.target.value,
                        },
                      );
                    }
                  }}
                >
                  <option value="">Page</option>
                  {activeSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {getSectionLabel(sec.id)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="fb-modal-actions">
              <button
                type="button"
                className="fb-btn-primary"
                onClick={() => {
                  setShowSelectPageModal(false);
                  setSelectedConditionRef(null);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormBuilderSection;

