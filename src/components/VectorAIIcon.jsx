import React from "react";

/**
 * Custom Vector AI Icon component representing high-dimensional vector embeddings,
 * connected RAG nodes, and neural search geometry.
 * Designed with a sleek glowing aesthetic for a premium SaaS feel.
 */
export default function VectorAIIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <filter id="vectorGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="vectorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Connectivity Network / Dimensions */}
      <path
        d="M12 4L4 8l8 4 8-4-8-4z"
        stroke="url(#vectorGradient)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M4 8v8l8 4 8-4V8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M12 12v8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Neural Core Node */}
      <circle
        cx="12"
        cy="12"
        r="2.5"
        fill="currentColor"
        filter="url(#vectorGlow)"
      />
      
      {/* Outer Data Nodes */}
      <circle cx="4" cy="8" r="1.5" fill="currentColor" opacity="0.8" />
      <circle cx="20" cy="8" r="1.5" fill="currentColor" opacity="0.8" />
      <circle cx="12" cy="20" r="1.5" fill="currentColor" opacity="0.8" />
      <circle cx="12" cy="4" r="1.5" fill="currentColor" opacity="0.8" />
    </svg>
  );
}
