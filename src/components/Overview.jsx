import React from "react";
import { useAppState } from "../lib/state-context";
import {
  FileText,
  Trash2,
  Calendar,
  Database,
  Cloud,
  Layers,
  ArrowRight,
  Plus,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";

export default function Overview() {
  const {
    documents,
    selectedDocumentId,
    selectDocument,
    deleteDocument,
    setTab
  } = useAppState();

  const totalChunks = documents.reduce((acc, d) => acc + d.chunkCount, 0);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const stats = [
    { label: "Total Reading Segments", value: totalChunks, icon: Layers, color: "#00FF66" },
    { label: "Cloud Server Status", value: "ONLINE", icon: Cloud, color: "#3B82F6" },
    { label: "Storage Location", value: "MONGODB ATLAS", icon: Database, color: "#10B981" },
  ];

  return (
    <div className="flex-1 p-8 md:p-12 overflow-y-auto min-h-0 flex flex-col bg-[#080808] text-white select-none relative" id="overview-view">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#00FF66]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Upper Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/80 pb-6 mb-8 relative z-10"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400">Database Engine</span>
            <span className="bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
              MongoDB Atlas Active
            </span>
          </div>
          <h2 className="text-xs font-mono tracking-wider uppercase text-zinc-400">Study Hub Overview</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTab("upload")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00FF66] hover:bg-[#00e55b] text-black text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,102,0.25)]"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Upload PDF</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10 relative z-10"
      >
        <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none uppercase text-white">
          Study Hub <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-500 via-zinc-600 to-zinc-800">
            Dashboard
          </span>
        </h1>
      </motion.section>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 relative z-10"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -4, borderColor: "rgba(0, 255, 102, 0.4)" }}
              className="bg-[#121212] p-6 rounded-2xl border border-zinc-800/80 flex flex-col justify-between shadow-xl relative overflow-hidden group transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                  {stat.label}
                </span>
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-[#00FF66] transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
                {stat.value}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Ingested Documents Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#101010] border border-zinc-800/80 rounded-2xl mb-10 overflow-hidden shadow-2xl relative z-10"
      >
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between bg-[#141414]/50">
          <div>
            <h3 className="font-extrabold text-white text-base uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00FF66]" />
              My Study Materials
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1 uppercase font-mono">
              Select a document to initiate interactive AI study sessions.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-zinc-900 text-[#00FF66] px-3 py-1.5 rounded-full border border-zinc-800">
            {documents.length} DOCUMENTS LOADED
          </span>
        </div>

        {documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#141414]/80 text-zinc-400 font-extrabold text-[10px] tracking-wider uppercase border-b border-zinc-800">
                  <th className="py-4 px-6">Document Name</th>
                  <th className="py-4 px-6">Uploaded At</th>
                  <th className="py-4 px-6 text-center">Reading Details</th>
                  <th className="py-4 px-6">File Size</th>
                  <th className="py-4 px-6 text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {documents.map((doc) => {
                  const isSelected = doc.id === selectedDocumentId;
                  return (
                    <motion.tr
                      key={doc.id}
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                      className={`transition-colors ${
                        isSelected ? "bg-[#00FF66]/5" : ""
                      }`}
                    >
                      {/* Doc name & active label */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 max-w-md">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30" : "bg-zinc-900 text-zinc-500"
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className={`font-bold uppercase tracking-wide truncate block text-xs ${
                              isSelected ? "text-[#00FF66]" : "text-zinc-200"
                            }`} title={doc.name}>
                              {doc.name}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-mono font-bold text-[#00FF66] tracking-wider uppercase bg-[#00FF66]/10 px-2 py-0.5 rounded-full border border-[#00FF66]/20">
                                ACTIVE TARGET
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-zinc-400 font-mono text-xs">
                        {new Date(doc.uploadedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>

                      {/* page Count / Chunks */}
                      <td className="py-4 px-6 text-center font-mono text-xs">
                        <span className="font-bold text-white">{doc.pageCount}</span>
                        <span className="text-zinc-400 text-[10px]"> PAGES</span>
                        <span className="mx-2 text-zinc-400 font-black">•</span>
                        <span className="font-bold text-[#00FF66]">{doc.chunkCount}</span>
                        <span className="text-zinc-400 text-[10px]"> SECTIONS</span>
                      </td>

                      {/* size */}
                      <td className="py-4 px-6 text-zinc-400 font-mono uppercase text-xs">
                        {formatBytes(doc.size)}
                      </td>

                      {/* actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {isSelected ? (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setTab("chat")}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00FF66] hover:bg-[#00e55b] text-black text-[10px] font-extrabold uppercase tracking-wide rounded-lg transition-all shadow-[0_0_12px_rgba(0,255,102,0.2)]"
                            >
                              <span>Open Chat</span>
                              <ArrowRight className="w-3 h-3" />
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => selectDocument(doc.id)}
                              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 hover:text-white text-[10px] font-extrabold uppercase tracking-wide rounded-lg transition-colors"
                            >
                              Open
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1, color: "#ef4444" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteDocument(doc.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete Target"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 text-[#00FF66] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-white text-base uppercase tracking-wider">No Study Materials Yet</h4>
            <p className="text-zinc-400 text-xs max-w-sm mx-auto mt-1 mb-6 uppercase font-mono">
              Upload textbook chapters, research papers, or notes to get started.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setTab("upload")}
              className="px-6 py-3 bg-[#00FF66] hover:bg-[#00e55b] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,102,0.25)]"
            >
              Upload PDF File
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Stepper Process Footer */}
      <section className="mt-auto border-t border-zinc-800/80 pt-8 relative z-10">
        <div className="stepper grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="step border-t-2 border-[#00FF66] pt-3">
            <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider">1. Read Document</div>
          </div>
          <div className="step border-t-2 border-[#00FF66] pt-3">
            <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider">2. Process Sections</div>
          </div>
          <div className="step border-t-2 border-[#00FF66] pt-3">
            <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider">3. Vector Database</div>
          </div>
          <div className="step border-t-2 border-zinc-800 pt-3">
            <div className="step-label text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">4. Ready to Study</div>
          </div>
        </div>
      </section>
    </div>
  );
}
