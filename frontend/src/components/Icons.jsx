import React from "react";

const iconProps = (size = 20) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

/**
 * Three vertical dots – options menu (from Figma Group 1752).
 */
export function EllipsisVertical({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Home / house – sidebar nav */
export function IconHome({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

/** Bar chart / analysis – sidebar nav */
export function IconAnalysis({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

/** Folder – sidebar Projects & project cards */
export function IconFolder({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/** Folder with document – “Start from scratch” card */
export function IconFolderDocument({ size = 24, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <path d="M8 11h8" />
      <path d="M8 15h6" />
    </svg>
  );
}

/** Pencil / edit – Create Form & form cards */
export function IconPencil({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/** User silhouette – Profile in sidebar */
export function IconProfile({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/** Plus – Add new Page, Add Question */
export function IconPlus({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/** Three lines / hamburger – Add Text */
export function IconAddText({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

/** Document with list – Add Condition */
export function IconAddCondition({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

/** Image / landscape – Add Image */
export function IconAddImage({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

/** Video camera – Add Video */
export function IconAddVideo({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

/** Stacked rectangles – Add Sections */
export function IconAddSections({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <rect x="2" y="4" width="20" height="6" rx="1" />
      <rect x="2" y="14" width="20" height="6" rx="1" />
    </svg>
  );
}

/** Eye – condition True/False (from Figma Frame 1948754813) */
export function IconEye({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Close X – modals */
export function IconClose({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/** Cube/box – Publish, Create Project modals */
export function IconCube({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

/** Cog/settings */
export function IconSettings({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9.93 3.1V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/** Logout */
export function IconLogout({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/** Right chevron */
export function IconChevronRight({ size = 20, className, ...props }) {
  return (
    <svg {...iconProps(size)} className={className} {...props}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default {
  EllipsisVertical,
  IconHome,
  IconAnalysis,
  IconFolder,
  IconFolderDocument,
  IconPencil,
  IconProfile,
  IconPlus,
  IconAddText,
  IconAddCondition,
  IconAddImage,
  IconAddVideo,
  IconAddSections,
  IconEye,
  IconClose,
  IconCube,
  IconSettings,
  IconLogout,
  IconChevronRight,
};
