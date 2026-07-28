import React from "react";
import { useAppState } from "../lib/state-context";
import {
  BookOpen,
  UploadCloud,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  FileText,
  Trash2,
  Cloud,
  LogOut,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Sidebar() {
  const {
    documents,
    selectedDocumentId,
    activeTab,
    setTab,
    selectDocument,
    deleteDocument,
    user,
    logout
  } = useAppState();

  const menuItems = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "upload", label: "Upload PDF", icon: UploadCloud },
    { id: "quiz", label: "Practice Quiz", icon: GraduationCap, disabled: !selectedDocumentId },
    { id: "chat", label: "Chat with PDF", icon: MessageSquare, disabled: !selectedDocumentId },
    { id: "guide", label: "How to Use", icon: HelpCircle },
  ];

  const activeDoc = documents.find(d => d.id === selectedDocumentId);

  return (
    <aside className="w-80 bg-[#0B0B0B] text-white border-r border-zinc-800/80 flex flex-col h-full select-none relative z-20 shadow-2xl" id="sidebar-container">
      {/* Brand Header */}
      <div className="p-7 border-b border-zinc-800/80 flex flex-col gap-1.5 bg-[#090909]">
        <div className="logo font-black text-xl tracking-tight text-[#00FF66] flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="w-8 h-8 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center text-[#00FF66]"
          >
            <BookOpen className="w-4 h-4" />
          </motion.div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
            PDF Scholar Hub
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-zinc-500 uppercase mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
          Cloud Vector Active
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-5 py-6 space-y-4 overflow-y-auto min-h-0">
        <div className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-black px-2">
          Navigation Menu
        </div>
        
        <div className="flex flex-col gap-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.disabled;

            return (
              <motion.button
                key={item.id}
                whileHover={!isDisabled ? { x: 4 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                onClick={() => !isDisabled && setTab(item.id)}
                disabled={isDisabled}
                id={`nav-btn-${item.id}`}
                className={`w-full relative flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all ${
                  isActive
                    ? "text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/30 shadow-[0_0_15px_rgba(0,255,102,0.15)]"
                    : isDisabled
                    ? "text-zinc-700 bg-transparent cursor-not-allowed opacity-50"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#00FF66]" : "text-zinc-500"}`} />
                  <span>{item.label}</span>
                </div>

                {item.id === "quiz" && selectedDocumentId && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[9px] font-black bg-[#00FF66] text-black px-2 py-0.5 rounded-full relative z-10 shadow-sm"
                  >
                    READY
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Document Section */}
        <div className="pt-8">
          <div className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-black mb-3 px-2 flex items-center justify-between">
            <span>Active Target</span>
            {selectedDocumentId && (
              <span className="badge-local bg-[#FF5F00] text-black text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                ACTIVE
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {activeDoc ? (
              <motion.div
                key={activeDoc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-[#141414] border border-zinc-800 rounded-xl flex flex-col gap-3 relative group/doc shadow-lg overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FF66]/5 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-[#00FF66]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold uppercase tracking-wide text-zinc-100 truncate" title={activeDoc.name}>
                      {activeDoc.name}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 mt-1 flex items-center gap-1.5">
                      <span>{activeDoc.pageCount} Pages</span>
                      <span>•</span>
                      <span>{activeDoc.chunkCount} Chunks</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1 relative z-10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTab("chat")}
                    className="flex-1 text-center bg-[#00FF66] hover:bg-[#00e55b] text-black font-extrabold text-[10px] uppercase tracking-wider py-2 rounded-lg transition-all shadow-[0_0_12px_rgba(0,255,102,0.2)]"
                  >
                    Start Chat
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteDocument(activeDoc.id)}
                    title="Delete Document"
                    className="p-2 bg-zinc-900 hover:bg-red-950/50 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-900/40 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="text-[11px] font-mono text-zinc-500 p-4 border border-dashed border-zinc-800 rounded-xl text-center uppercase">
                No Document Activated
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Document Switcher List */}
        {documents.length > 1 && (
          <div className="pt-6">
            <div className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-black mb-2.5 px-2">
              Switch Target Document
            </div>
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
              {documents.map(doc => {
                if (doc.id === selectedDocumentId) return null;
                return (
                  <motion.button
                    key={doc.id}
                    whileHover={{ x: 3 }}
                    onClick={() => selectDocument(doc.id)}
                    className="w-full text-left p-2.5 bg-[#121212] hover:bg-[#181818] border border-zinc-800/60 hover:border-zinc-700 rounded-lg transition-all text-[11px] text-zinc-400 hover:text-white uppercase font-bold tracking-wide truncate flex items-center gap-2.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate flex-1">{doc.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-5 border-t border-zinc-800/80 flex flex-col gap-3.5 text-xs font-mono uppercase tracking-wider shrink-0 bg-[#080808]">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-[#121212] p-2.5 rounded-lg border border-zinc-800/60">
          <div className="flex items-center gap-2 min-w-0">
            <Cloud className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
            <span className="truncate">User: <strong className="text-white">{user?.username}</strong></span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66] animate-pulse shrink-0" />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full py-2.5 bg-transparent hover:bg-red-950/30 border border-zinc-800 hover:border-red-900/40 text-zinc-400 hover:text-red-400 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </aside>
  );
}
