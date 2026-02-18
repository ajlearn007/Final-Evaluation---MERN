import React, { useState } from "react";
import { CanovaLogoIcon } from "./CanovaLogoIcon";

const logoUrl = process.env.PUBLIC_URL + "/logo.png";

export function CanovaLogo({ className = "", iconSize = 32 }) {
  const [useFallback, setUseFallback] = useState(false);
  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {useFallback ? (
        <CanovaLogoIcon size={iconSize} />
      ) : (
        <img
          src={logoUrl}
          alt="CANOVA"
          className="canova-logo-img"
          style={{ width: iconSize, height: iconSize, objectFit: "contain" }}
          onError={() => setUseFallback(true)}
        />
      )}
      <span className="auth-brand-text">CANOVA</span>
    </div>
  );
}

export default CanovaLogo;
