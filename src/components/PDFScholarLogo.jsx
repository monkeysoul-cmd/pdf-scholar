import React from "react";

/**
 * Ultra-Premium PDF Scholar Hub Brand Logo.
 * Designed by a Senior Designer:
 * Features a sleek, minimalist glowing geometry that combines a document fold, 
 * an AI neural node, and a scholar cap silhouette.
 */
export default function PDFScholarLogo({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Neural Node / Scholar Cap Diamond */}
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        fill="url(#logoGradient)"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter="url(#neonGlow)"
      />
      
      {/* Document Fold & Depth Lines */}
      <path
        d="M4.5 9.5v5c0 3 2.5 5.5 7.5 5.5s7.5-2.5 7.5-5.5v-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <path
        d="M12 12v10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Accent AI Core Dot */}
      <circle
        cx="12"
        cy="7"
        r="2"
        fill="currentColor"
        filter="url(#neonGlow)"
      />
    </svg>
  );
}
