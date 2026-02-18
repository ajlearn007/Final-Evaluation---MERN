import React from "react";

export function CanovaLogoIcon({ className = "", size = 32, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="16" y="16" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

export default CanovaLogoIcon;
