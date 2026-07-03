import React from "react";
import { useAppState } from "../lib/state-context";
import {
  FileText,
  Trash2,
  Calendar,
  Database,
  Cpu,
  Layers,
  ArrowRight,
  Plus
} from "lucide-react";

export default function Overview() {
  const {
    documents,
    selectedDocumentId,
    selectDocument,
    deleteDocument,
    setTab
  } = useAppState();

  const totalChunks = documents.reduce((acc, d) => acc + d.chunkCount, 0);

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const stats = [
    { label: "Total Embeddings (Chunks)", value: totalChunks, icon: Layers },
    { label: "Vector Dimensions", value: "768", icon: Cpu },
    { label: "Active Database Mode", value: "LOCAL JSON", icon: Database },
  ];

  return (
    <div className="flex-1 p-8 md:p-12 overflow-y-auto min-h-0 flex flex-col bg-[#0A0A0A] text-white select-none" id="overview-view">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#222] pb-8 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">Active Engine</span>
            <span className="bg-[#FF5F00] text-black text-[9px] font-black px-1.5 py-0.5 rounded-xs uppercase tracking-wider">
              Local JSON Fallback
            </span>
          </div>
          <h2 className="text-sm font-mono tracking-wider uppercase text-zinc-400">PDF Scholar Analytics</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="bg-[#00FF66] text-black px-3 py-1 font-black text-xs rounded-xs uppercase tracking-wider">
            V.2.5 FLASH READY
          </span>
          <button
            onClick={() => setTab("upload")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00FF66] hover:bg-[#00e55b] text-black text-xs font-black uppercase tracking-wider rounded-xs transition-all duration-200"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* 84px Giant Bold Heading */}
      <section className="mb-10">
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none uppercase text-white">
          RAG ENGINE<br />
          <span className="text-zinc-800">OVERVIEW</span>
        </h1>
      </section>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => {
          return (
            <div
              key={i}
              className="bg-[#111] p-6 rounded-xs border border-[#222] flex flex-col justify-between"
            >
              <div className="text-5xl font-black tracking-tighter text-white mb-2 leading-none">
                {stat.value}
              </div>
              <div className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Ingestion Documents Grid */}
      <div className="bg-[#0A0A0A] border border-[#222] rounded-xs mb-10 overflow-hidden">
        <div className="p-6 border-b border-[#222] flex items-center justify-between bg-[#111]/30">
          <div>
            <h3 className="font-black text-white text-base uppercase tracking-wider">Ingested Academic Library</h3>
            <p className="text-[11px] text-zinc-500 mt-1 uppercase font-mono">Select a document below to mount to active workspace.</p>
          </div>
          <span className="text-[10px] font-mono font-black bg-[#222] text-[#00FF66] px-3 py-1 rounded-xs border border-[#333]">
            {documents.length} AVAILABLE TARGETS
          </span>
        </div>

        {documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111]/50 text-zinc-500 font-black text-[10px] tracking-wider uppercase border-b-2 border-white">
                  <th className="py-4 px-6">Document Target</th>
                  <th className="py-4 px-6">Ingested At</th>
                  <th className="py-4 px-6 text-center">Structure Specs</th>
                  <th className="py-4 px-6">Volume Size</th>
                  <th className="py-4 px-6 text-right">Engine Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222] text-xs">
                {documents.map((doc) => {
                  const isSelected = doc.id === selectedDocumentId;
                  return (
                    <tr
                      key={doc.id}
                      className={`group transition-all duration-150 ${
                        isSelected ? "bg-[#111]/65" : "hover:bg-[#111]/30"
                      }`}
                    >
                      {/* Doc name & active label */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 max-w-md">
                          <FileText className={`w-4 h-4 shrink-0 ${
                            isSelected ? "text-[#00FF66]" : "text-zinc-600"
                          }`} />
                          <div className="min-w-0">
                            <span className={`font-black uppercase tracking-wide truncate block text-xs ${
                              isSelected ? "text-[#00FF66]" : "text-zinc-200"
                            }`} title={doc.name}>
                              {doc.name}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-black text-[#00FF66] tracking-wider uppercase bg-[#00FF66]/10 px-1.5 py-0.2 rounded-xs border border-[#00FF66]/20">
                                ACTIVE WORKSPACE
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-zinc-500 font-mono">
                        {new Date(doc.uploadedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>

                      {/* page Count / Chunks */}
                      <td className="py-4 px-6 text-center font-mono">
                        <span className="font-bold text-white">{doc.pageCount}</span>
                        <span className="text-zinc-500 text-[10px]"> PAGES</span>
                        <span className="mx-2 text-[#222] font-black">/</span>
                        <span className="font-bold text-[#00FF66]">{doc.chunkCount}</span>
                        <span className="text-zinc-500 text-[10px]"> CHUNKS</span>
                      </td>

                      {/* size */}
                      <td className="py-4 px-6 text-zinc-500 font-mono uppercase">
                        {formatBytes(doc.size)}
                      </td>

                      {/* actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          {isSelected ? (
                            <button
                              onClick={() => setTab("chat")}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00FF66] hover:bg-[#00e55b] text-black text-[10px] font-black uppercase tracking-wide rounded-xs transition-colors"
                            >
                              <span>Enter Chat</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => selectDocument(doc.id)}
                              className="px-3 py-1.5 bg-transparent hover:bg-[#111] border border-[#222] text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-wide rounded-xs transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors"
                            title="Delete Target"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-[#111] border border-[#222] text-[#FF5F00] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-black text-white text-sm uppercase tracking-wider">No Targets Registered</h4>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto mt-1 mb-6 uppercase font-mono">
              Upload textbook chapters, articles, or research papers to build your local retrieval engine.
            </p>
            <button
              onClick={() => setTab("upload")}
              className="px-5 py-2.5 bg-[#00FF66] hover:bg-[#00e55b] text-black text-xs font-black uppercase tracking-wider rounded-xs transition-colors"
            >
              Upload PDF Target
            </button>
          </div>
        )}
      </div>

      {/* Ingest Stepper Process matching the template exact design style */}
      <section className="mt-auto border-t border-[#222] pt-8">
        <div className="stepper grid grid-cols-4 gap-6">
          <div className="step border-t-4 border-[#00FF66] pt-3 relative">
            <div className="step-label text-[10px] font-black text-[#00FF66] uppercase tracking-wider">1. Read Target</div>
          </div>
          <div className="step border-t-4 border-[#00FF66] pt-3 relative">
            <div className="step-label text-[10px] font-black text-[#00FF66] uppercase tracking-wider">2. Split Chunks</div>
          </div>
          <div className="step border-t-4 border-[#00FF66] pt-3 relative">
            <div className="step-label text-[10px] font-black text-[#00FF66] uppercase tracking-wider">3. Embed Vectors</div>
          </div>
          <div className="step border-t-4 border-zinc-800 pt-3 relative">
            <div className="step-label text-[10px] font-black text-zinc-600 uppercase tracking-wider">4. Ready Loop</div>
          </div>
        </div>
      </section>
    </div>
  );
}
