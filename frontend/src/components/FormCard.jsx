import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVertical, IconPencil } from "./Icons";

function FormCard({ form, onEdit, onView, onRemove, onOpen }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleOpen = () => {
    if (onOpen) {
      onOpen(form);
      return;
    }
    navigate("/dashboard/analysis", { state: { formId: form._id } });
  };

  const handleAction = async (action) => {
    setMenuOpen(false);
    try {
      await action?.(form);
    } catch (err) {
      alert(err.message || "Action failed");
    }
  };

  return (
    <div
      className="mini-form-card"
      onClick={handleOpen}
    >
      <div className="mini-form-title">{form.name || "Form Name"}</div>
      <div className="mini-form-icon-wrap">
        <IconPencil size={32} />
      </div>
      <button
        type="button"
        className="mini-kebab-btn"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((prev) => !prev);
        }}
      >
        <EllipsisVertical size={16} />
      </button>
      <button
        type="button"
        className="mini-form-link"
        onClick={(e) => {
          e.stopPropagation();
          if (onView) {
            onView(form);
          } else {
            navigate("/dashboard/analysis", { state: { formId: form._id } });
          }
        }}
      >
        View Analysis
      </button>
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
            <button type="button" onClick={() => handleAction(onEdit)}>
              Edit
            </button>
            <button type="button" onClick={() => handleAction(onView)}>
              View
            </button>
            <button type="button" onClick={() => handleAction(onRemove)}>
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default FormCard;
