import React from "react";

/**
 * Toggle button (Rectangle 1-1, 1-2, 1-3 style from Figma).
 * Renders as a pill with two segments: off (1-1) and on (1-2/1-3).
 */
export function Toggle({ checked, onChange, disabled, className = "", "aria-label": ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={ariaLabel || (checked ? "On" : "Off")}
      disabled={disabled}
      className={"toggle-rect " + (checked ? "toggle-rect-on " : "") + className}
      onClick={() => onChange?.(!checked)}
    >
      <span className="toggle-rect-track">
        <span className="toggle-rect-thumb" />
      </span>
    </button>
  );
}

export default Toggle;
