import React from "react";

/**
 * Ultra-Modern PDF Scholar Hub Brand Logo.
 * Seamlessly integrates a PDF Document silhouette, a futuristic Scholar Mortarboard Cap, 
 * and a Central Vector Hub node with glowing neon green styling.
 */
export default function PDFScholarLogo({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Modern PDF Document Badge Frame */}
      <path d="M4.5 4A2.5 2.5 0 0 1 7 1.5h8.5L20.5 6V19.5A2.5 2.5 0 0 1 18 22H7a2.5 2.5 0 0 1-2.5-2.5V4z" />
      <path d="M15 1.5V6.5h5" />

      {/* Futuristic Scholar Cap (Mortarboard Diamond) */}
      <polygon
        points="12 7.8 5.8 11 12 14.2 18.2 11"
        fill="currentColor"
        fillOpacity="0.3"
      />
      {/* Scholar Cap Crest Base */}
      <path d="M8.5 12.8v2.2a3.5 3.5 0 0 0 7 0v-2.2" />

      {/* Central Vector Hub Core Node */}
      <circle cx="12" cy="11" r="1.4" fill="currentColor" />
    </svg>
  );
}
