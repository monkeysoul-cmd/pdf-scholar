import React, { useState } from "react";
import { useAppState } from "../lib/state-context";
import {
  BookOpen,
  UploadCloud,
  GraduationCap,
  MessageSquare,
  FileText,
  Trash2,
  Cloud,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import PDFScholarLogo from "./PDFScholarLogo";
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

  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "upload", label: "Upload PDF", icon: UploadCloud },
    { id: "quiz", label: "Practice Quiz", icon: GraduationCap, disabled: !selectedDocumentId },
    { id: "chat", label: "Chat with PDF", icon: MessageSquare, disabled: !selectedDocumentId }
  ];

  const activeDoc = documents.find((d) => d.id === selectedDocumentId);

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-80"
      } bg-[#0B0B0B] text-white border-r border-zinc-800/80 flex flex-col h-full select-none relative z-20 shadow-2xl transition-all duration-300 ease-in-out shrink-0`}
      id="sidebar-container"
    >
      {/* Brand Header & Collapse Toggle */}
      <div
        className={`border-b border-zinc-800/80 bg-[#090909] ${
          isCollapsed ? "py-5 px-2 flex flex-col items-center gap-3" : "p-6 flex items-center justify-between"
        }`}
      >
        {isCollapsed ? (
          <>
            {/* Collapsed Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsCollapsed(false)}
              className="w-10 h-10 rounded-sm bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center text-[#00FF66] shrink-0 cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.15)]"
              title="Expand PDF Scholar Hub"
            >
              <PDFScholarLogo className="w-5 h-5 text-[#00FF66]" />
            </motion.div>

            {/* Collapsed Expand Toggle Button */}
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-8 h-8 bg-zinc-900 hover:bg-[#00FF66] text-zinc-400 hover:text-black border border-zinc-800 hover:border-[#00FF66] rounded-sm transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-9 h-9 rounded-sm bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center text-[#00FF66] shrink-0 shadow-[0_0_12px_rgba(0,255,102,0.15)]"
              >
                <PDFScholarLogo className="w-5 h-5 text-[#00FF66]" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <div className="flex items-center gap-1.5 font-black text-xl tracking-tight leading-none">
                  <span className="text-[#00FF66] drop-shadow-[0_0_12px_rgba(0,255,102,0.35)]">PDF</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
                    Scholar Hub
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-zinc-500 uppercase mt-1">
                  <span className="w-1.5 h-1.5 rounded-none bg-[#00FF66] animate-pulse" />
                  Vector AI Active
                </div>
              </motion.div>
            </div>

            {/* Expanded Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 bg-zinc-900 hover:bg-[#00FF66] text-zinc-400 hover:text-black border border-zinc-800 hover:border-[#00FF66] rounded-sm transition-all cursor-pointer shrink-0"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Main Navigation */}
      <nav className={`flex-1 ${isCollapsed ? "px-3" : "px-5"} py-6 space-y-4 overflow-y-auto min-h-0`}>
        {!isCollapsed && (
          <div className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-black px-2">
            Navigation Menu
          </div>
        )}

        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.disabled;

            return (
              <motion.button
                key={item.id}
                whileHover={!isDisabled ? { x: isCollapsed ? 0 : 3, scale: isCollapsed ? 1.05 : 1 } : {}}
                whileTap={!isDisabled ? { scale: 0.96 } : {}}
                onClick={() => !isDisabled && setTab(item.id)}
                disabled={isDisabled}
                title={isCollapsed ? `${item.label}${isDisabled ? " (Select Document First)" : ""}` : undefined}
                id={`nav-btn-${item.id}`}
                className={`w-full relative flex items-center ${
                  isCollapsed ? "justify-center px-0 py-3.5" : "justify-between px-3.5 py-3"
                } rounded-sm text-xs font-bold uppercase tracking-wider text-left transition-all ${
                  isActive
                    ? "text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/40 shadow-[0_0_12px_rgba(0,255,102,0.15)]"
                    : isDisabled
                    ? "text-zinc-700 bg-transparent cursor-not-allowed opacity-50"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800"
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} relative z-10`}>
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#00FF66]" : "text-zinc-400"}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.id === "quiz" && selectedDocumentId && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[9px] font-black bg-[#00FF66] text-black px-2 py-0.5 rounded-sm relative z-10 shadow-sm"
                  >
                    READY
                  </motion.span>
                )}

                {/* Pulsing indicator when collapsed & active */}
                {isCollapsed && isActive && (
                  <span className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Document Section */}
        <div className="pt-6">
          {!isCollapsed && (
            <div className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-black mb-3 px-2 flex items-center justify-between">
              <span>Active Target</span>
              {selectedDocumentId && (
                <span className="badge-local bg-[#FF5F00] text-black text-[9px] font-black px-2 py-0.5 rounded-sm animate-pulse">
                  ACTIVE
                </span>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeDoc ? (
              isCollapsed ? (
                <motion.button
                  key={activeDoc.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setTab("chat")}
                  title={`Active Target: ${activeDoc.name}`}
                  className="w-full p-3 bg-[#141414] border border-[#00FF66]/40 rounded-sm flex items-center justify-center text-[#00FF66] relative shadow-md cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
                </motion.button>
              ) : (
                <motion.div
                  key={activeDoc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-[#141414] border border-zinc-800 rounded-sm flex flex-col gap-3 relative group/doc shadow-lg overflow-hidden"
                >
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-sm bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shrink-0 mt-0.5">
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
                      className="flex-1 text-center bg-[#00FF66] hover:bg-[#00e55b] text-black font-extrabold text-[10px] uppercase tracking-wider py-2 rounded-sm transition-all shadow-[0_0_12px_rgba(0,255,102,0.2)] cursor-pointer"
                    >
                      Start Chat
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteDocument(activeDoc.id)}
                      title="Delete Document"
                      className="p-2 bg-zinc-900 hover:bg-red-950/50 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-900/40 rounded-sm transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              )
            ) : !isCollapsed ? (
              <div className="text-[11px] font-mono text-zinc-500 p-4 border border-dashed border-zinc-800 rounded-sm text-center uppercase">
                No Document Activated
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </nav>

      {/* User Info & Logout Footer */}
      <div className={`p-4 ${isCollapsed ? "p-3" : "p-5"} border-t border-zinc-800/80 flex flex-col gap-3 text-xs font-mono uppercase tracking-wider shrink-0 bg-[#080808]`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-[#121212] p-2.5 rounded-sm border border-zinc-800/60">
              <div className="flex items-center gap-2 min-w-0">
                <Cloud className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
                <span className="truncate">User: <strong className="text-white">{user?.username}</strong></span>
              </div>
              <div className="w-2 h-2 rounded-none bg-[#00FF66] shadow-[0_0_8px_#00FF66] animate-pulse shrink-0" />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={logout}
              className="w-full py-2.5 bg-transparent hover:bg-red-950/30 border border-zinc-800 hover:border-red-900/40 text-zinc-400 hover:text-red-400 rounded-sm text-[10px] font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            title={`Sign Out (${user?.username})`}
            className="w-full py-3 bg-zinc-900 hover:bg-red-950/50 border border-zinc-800 hover:border-red-900/40 text-zinc-400 hover:text-red-400 rounded-sm flex items-center justify-center transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </aside>
  );
}
