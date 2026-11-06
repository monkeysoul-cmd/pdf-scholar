import React, { useState, useEffect } from "react";
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
  ChevronRight,
  Menu,
  X,
  Volume2,
  VolumeX
} from "lucide-react";
import PDFScholarLogo from "./PDFScholarLogo";
import { motion, AnimatePresence } from "motion/react";
import { playClick, playBlip, isSoundEnabled, toggleSound } from "../lib/sound-effects";

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sfxOn, setSfxOn] = useState(isSoundEnabled());

  useEffect(() => {
    setIsMobileOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Global hotkey navigation for developer affordance: [1], [2], [3], [4], [m]
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || document.activeElement?.isContentEditable) {
        return;
      }
      if (e.key === "1") {
        setTab("overview");
        playClick();
      } else if (e.key === "2") {
        setTab("upload");
        playClick();
      } else if (e.key === "3" && selectedDocumentId) {
        setTab("quiz");
        playClick();
      } else if (e.key === "4" && selectedDocumentId) {
        setTab("chat");
        playClick();
      } else if (e.key.toLowerCase() === "m") {
        const next = toggleSound();
        setSfxOn(next);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDocumentId, setTab]);

  const menuItems = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "upload", label: "Upload PDF", icon: UploadCloud },
    { id: "quiz", label: "Practice Quiz", icon: GraduationCap, disabled: !selectedDocumentId },
    { id: "chat", label: "Chat with PDF", icon: MessageSquare, disabled: !selectedDocumentId }
  ];

  const activeDoc = documents.find((d) => d.id === selectedDocumentId);

  const renderSidebarInner = (collapsed) => (
    <aside
      className={`${
        collapsed ? "w-[72px]" : "w-[260px] sm:w-[270px]"
      } bg-[#08090C] text-white border-r border-white/[0.08] flex flex-col h-full select-none relative shadow-2xl transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0 z-50 overflow-hidden will-change-[width]`}
      id="sidebar-container"
    >
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="h-16 px-3 border-b border-white/[0.08] relative z-10 flex items-center justify-between shrink-0 overflow-hidden">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (collapsed) {
              setIsCollapsed(false);
            } else {
              setTab("overview");
            }
            playClick();
          }}
          className="w-10 h-10 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-[#00FF66] shrink-0 shadow-inner cursor-pointer transition-colors relative group/logo"
          title={collapsed ? "Expand Sidebar (Click to expand)" : "PDF Scholar Hub"}
        >
          <PDFScholarLogo className="w-5 h-5 text-[#00FF66]" />
          {collapsed && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00FF66] text-black flex items-center justify-center shadow-md">
              <ChevronRight className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          )}
        </motion.button>

        <div
          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex-1 min-w-0 ${
            collapsed ? "max-w-0 opacity-0 pointer-events-none -translate-x-2" : "max-w-[170px] opacity-100 translate-x-0 ml-2.5"
          }`}
        >
          <div className="flex items-center gap-1 font-semibold text-base tracking-tight leading-none whitespace-nowrap">
            <span className="text-[#00FF66] shrink-0">PDF</span>
            <span className="text-white whitespace-nowrap truncate">Scholar Hub</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-zinc-400 uppercase mt-1 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] shrink-0" />
            <span>Online</span>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0 ${
            collapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[40px] opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setIsCollapsed(true);
              playClick();
            }}
            className="hidden md:flex p-1.5 bg-white/5 hover:bg-[#00FF66] text-zinc-400 hover:text-black border border-white/10 hover:border-[#00FF66] rounded-md transition-all cursor-pointer items-center justify-center shrink-0"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="flex md:hidden p-1.5 bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 rounded-md transition-all cursor-pointer items-center justify-center shrink-0"
            title="Close Navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto overflow-x-hidden min-h-0 relative z-10 space-y-4">
        <div
          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold px-2 ${
            collapsed ? "max-h-0 opacity-0 pointer-events-none mb-0" : "max-h-5 opacity-100 mb-2"
          }`}
        >
          Navigation
        </div>

        <div className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.disabled;
            return (
              <motion.button
                key={item.id}
                whileHover={!isDisabled ? { scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                onClick={() => {
                  if (!isDisabled) {
                    playClick();
                    setTab(item.id);
                  }
                }}
                disabled={isDisabled}
                title={collapsed ? `${item.label}${isDisabled ? " (Select a PDF first)" : ""}` : undefined}
                id={`nav-btn-${item.id}`}
                className={`w-full h-10 px-2 rounded-lg text-xs font-bold uppercase tracking-wider text-left transition-colors flex items-center relative ${
                  isDisabled ? "cursor-not-allowed opacity-40 text-zinc-600 bg-transparent" : "cursor-pointer"
                } ${
                  isActive
                    ? "text-white bg-white/[0.08] border-l-2 border-[#00FF66] font-medium"
                    : isDisabled
                    ? ""
                    : "text-zinc-400 hover:text-white terminal-panel hover:border-white/20"
                }`}
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0 relative z-10">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#00FF66]" : "text-zinc-400"}`} />
                </div>

                <div
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-between flex-1 min-w-0 ${
                    collapsed ? "max-w-0 opacity-0 pointer-events-none ml-0" : "max-w-[190px] opacity-100 ml-2"
                  }`}
                >
                  <span className="font-mono truncate">{item.label}</span>
                  {item.id === "quiz" && selectedDocumentId && !isActive && (
                    <span className="text-[10px] bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30 px-1.5 py-0.5 rounded font-medium shrink-0 ml-1.5">
                      READY
                    </span>
                  )}
                </div>

                {collapsed && isActive && (
                  <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Target Document Card */}
        <div className="pt-4 border-t border-white/[0.06]">
          <div
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              collapsed ? "max-h-0 opacity-0 pointer-events-none mb-0" : "max-h-6 opacity-100 mb-2 px-1"
            }`}
          >
            <div className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-bold flex items-center justify-between">
              <span>Current document</span>
              {selectedDocumentId && (
                <span className="bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30 text-[9px] font-medium px-1.5 py-0.5 rounded">
                  ACTIVE
                </span>
              )}
            </div>
          </div>

          {documents.length > 1 && (
            <div
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                collapsed ? "max-h-0 opacity-0 pointer-events-none mb-0" : "max-h-12 opacity-100 mb-2"
              }`}
            >
              <select
                value={selectedDocumentId || ""}
                onChange={(e) => selectDocument(e.target.value)}
                className="w-full bg-black/70 border border-white/10 hover:border-[#00FF66]/40 focus:border-[#00FF66] text-[10px] font-mono text-zinc-300 rounded-lg py-1.5 px-2 outline-none cursor-pointer transition-all"
                title="Switch document"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id} className="bg-zinc-950 text-white">
                    {d.name.length > 22 ? `${d.name.slice(0, 20)}...` : d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeDoc ? (
            <div
              className={`rounded-xl border transition-all duration-300 overflow-hidden relative ${
                collapsed
                  ? "p-1 bg-white/[0.03] border-white/10 hover:border-[#00FF66]/50 cursor-pointer"
                  : "p-3 bg-[#0B0D13] border-white/10 border-l-2 border-l-[#00FF66] shadow-sm flex flex-col gap-2.5"
              }`}
              onClick={() => {
                if (collapsed) {
                  setTab("chat");
                  playClick();
                }
              }}
              title={collapsed ? `Target: ${activeDoc.name} (Click to open chat)` : undefined}
            >
              <div className={`flex items-center ${collapsed ? "justify-center h-10 w-full" : "gap-2.5"}`}>
                <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                  <FileText className="w-3.5 h-3.5 text-[#00FF66]" />
                </div>

                <div
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex-1 min-w-0 ${
                    collapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[170px] opacity-100"
                  }`}
                >
                  <div className="text-xs font-medium text-zinc-100 truncate" title={activeDoc.name}>
                    {activeDoc.name}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-0.5 flex items-center gap-1.5">
                    <span>{activeDoc.pageCount || 1} pgs</span>
                    <span className="text-zinc-600">•</span>
                    <span>{activeDoc.chunkCount || 0} chunks</span>
                  </div>
                </div>

                {collapsed && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
                )}
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  collapsed ? "max-h-0 opacity-0 pointer-events-none mt-0" : "max-h-12 opacity-100 mt-1"
                }`}
              >
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTab("chat");
                      playClick();
                    }}
                    className="flex-1 text-center bg-[#00FF66] hover:bg-[#1aff75] text-black font-medium text-xs py-1.5 rounded transition-colors cursor-pointer"
                  >
                    Open Chat
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete "${activeDoc.name}"? This cannot be undone.`)) {
                        deleteDocument(activeDoc.id);
                      }
                    }}
                    title="Delete Document"
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                collapsed ? "max-h-0 opacity-0 pointer-events-none" : "max-h-16 opacity-100"
              }`}
            >
              <div className="text-[10px] font-mono text-zinc-500 p-3 border border-dashed border-white/10 rounded-lg text-center uppercase bg-white/[0.02]">
                No document selected
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* User Profile & Sign Out */}
      <div className="p-3 border-t border-white/[0.08] flex flex-col gap-2 shrink-0 relative z-10 overflow-hidden">
        <div
          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            collapsed ? "max-h-0 opacity-0 pointer-events-none mb-0" : "max-h-12 opacity-100 mb-1"
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-zinc-400 terminal-panel p-2 rounded-lg border border-white/[0.06]">
            <div className="flex items-center gap-2 min-w-0">
              <Cloud className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
              <span className="truncate">User: <strong className="text-white font-medium ml-1">{user?.username}</strong></span>
            </div>
            <div className="status-led-green shrink-0" />
          </div>
        </div>

        {/* Audio Feedback Toggle */}
        <button
          type="button"
          onClick={() => setSfxOn(toggleSound())}
          className="w-full h-9 px-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors flex items-center cursor-pointer relative"
          title={collapsed ? `SFX // ${sfxOn ? "Active" : "Muted"} (Hotkey: M)` : "Toggle Audio Haptics (HotKey: M)"}
        >
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            {sfxOn ? <Volume2 className="w-3.5 h-3.5 text-[#00FF66]" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-600" />}
          </div>

          <div
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-between flex-1 min-w-0 ${
              collapsed ? "max-w-0 opacity-0 pointer-events-none ml-0" : "max-w-[170px] opacity-100 ml-2"
            }`}
          >
            <span className="truncate">SFX // {sfxOn ? "ACTIVE" : "MUTED"}</span>
            <kbd className="text-[8px] bg-black/40 border border-white/10 px-1 py-0.5 rounded text-zinc-500 ml-1">M</kbd>
          </div>
        </button>

        {/* Sign Out Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full h-9 px-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 text-xs font-medium transition-colors flex items-center cursor-pointer relative"
          title={collapsed ? `Sign Out (${user?.username})` : undefined}
        >
          <div className="w-7 h-7 flex items-center justify-center shrink-0 text-red-400">
            <LogOut className="w-3.5 h-3.5" />
          </div>

          <div
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex-1 min-w-0 text-center ${
              collapsed ? "max-w-0 opacity-0 pointer-events-none ml-0" : "max-w-[170px] opacity-100 ml-2"
            }`}
          >
            <span>Sign Out</span>
          </div>
        </motion.button>
      </div>
    </aside>
  );

  return (
    <>
      <AnimatePresence>
        {!isMobileOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden fixed top-3 left-3 z-40 w-10 h-10 glass-card border-white/10 text-zinc-300 hover:text-[#00FF66] hover:border-[#00FF66]/40 rounded-xl flex items-center justify-center transition-all shadow-lg cursor-pointer"
            title="Open Navigation"
            id="mobile-menu-btn"
          >
            <Menu className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 z-30 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed inset-y-0 left-0 z-40"
            >
              <div className="relative h-full shadow-2xl">
                {renderSidebarInner(false)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden md:flex h-full relative z-40">
        {renderSidebarInner(isCollapsed)}
      </div>
    </>
  );
}
