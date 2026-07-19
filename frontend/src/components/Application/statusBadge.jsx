import React from "react";

export const STATUS_OPTIONS = [
  "Applied",
  "Shortlisted",
  "Selected",
  "Rejected",
];

const STATUS_COLORS = {
  Applied: { bg: "#e8eef9", fg: "#2a5aa8" },
  Shortlisted: { bg: "#fdf3dc", fg: "#9a6d00" },
  Selected: { bg: "#e2f2e9", fg: "#1a7f4e" },
  Rejected: { bg: "#fdeaea", fg: "#b3352e" },
};

export const StatusBadge = ({ status }) => {
  const s = STATUS_OPTIONS.includes(status) ? status : "Applied";
  const { bg, fg } = STATUS_COLORS[s];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 14px",
        borderRadius: "20px",
        background: bg,
        color: fg,
        fontSize: "13px",
        fontWeight: 700,
        letterSpacing: "0.4px",
      }}
    >
      {s}
    </span>
  );
};
