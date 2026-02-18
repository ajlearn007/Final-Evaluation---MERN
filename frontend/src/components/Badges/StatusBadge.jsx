import React from "react";
import Approved from "./Status/Approved.svg";
import Pending from "./Status/Pending.svg";
import Disabled from "./Status/Disabled.svg";
import Waiting from "./Status/Waiting.svg";
import Canceled from "./Status/Canceled.svg";

const BADGES = {
  approved: Approved,
  pending: Pending,
  disabled: Disabled,
  waiting: Waiting,
  canceled: Canceled,
};

export function StatusBadge({ status = "pending", className = "", ...props }) {
  const src = BADGES[status.toLowerCase()] || BADGES.pending;
  return (
    <img
      src={src}
      alt={status}
      className={"status-badge " + className}
      style={{ height: 16, display: "block" }}
      {...props}
    />
  );
}

export default StatusBadge;
