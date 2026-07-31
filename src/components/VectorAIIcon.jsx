import React from "react";

/**
 * Custom Vector AI Icon component representing high-dimensional vector embeddings,
 * connected RAG nodes, and neural search geometry.
 */
export default function VectorAIIcon({ className = "w-4 h-4", ...props }) {
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
      {/* Central Vector Core */}
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.25" />
      <circle cx="12" cy="12" r="1.8" />
      {/* Vector Embedding Nodes */}
      <circle cx="5" cy="6" r="1.5" />
      <circle cx="19" cy="6" r="1.5" />
      <circle cx="5" cy="18" r="1.5" />
      <circle cx="19" cy="18" r="1.5" />
      {/* Neural Vector Connections */}
      <line x1="6.3" y1="7.1" x2="9.8" y2="10.2" />
      <line x1="17.7" y1="7.1" x2="14.2" y2="10.2" />
      <line x1="6.3" y1="16.9" x2="9.8" y2="13.8" />
      <line x1="17.7" y1="16.9" x2="14.2" y2="13.8" />
      <line x1="5" y1="7.5" x2="5" y2="16.5" strokeDasharray="2 2" />
      <line x1="19" y1="7.5" x2="19" y2="16.5" strokeDasharray="2 2" />
    </svg>
  );
}
