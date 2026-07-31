import React from "react";

/**
 * Custom PDF Scholar Hub Brand Logo Icon.
 * Distinctly combines a PDF Document silhouette with a Scholar Graduation Cap and glowing accent.
 */
export default function PDFScholarLogo({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* PDF Document Silhouette */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      {/* Scholar Graduation Cap Emblem inside Document */}
      <polygon points="12 11.2 7.5 13.2 12 15.2 16.5 13.2 12 11.2" fill="currentColor" fillOpacity="0.3" />
      <path d="M9.2 14.2v2.2a2.8 2.8 0 0 0 5.6 0v-2.2" />
      <line x1="16.5" y1="13.2" x2="16.5" y2="16" />
    </svg>
  );
}
