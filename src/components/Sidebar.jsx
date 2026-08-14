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
  X
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const menuItems = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "upload", label: "Upload PDF", icon: UploadCloud },
    { id: "quiz", label: "Practice Quiz", icon: GraduationCap, disabled: !selectedDocumentId },
    { id: "chat", label: "Chat with PDF", icon: MessageSquare, disabled: !selectedDocumentId }
  ];

  const activeDoc = documents.find((d) => d.id === selectedDocumentId);

  const SidebarInner = ({ collapsed }) => (
    <aside
      className={`${
        collapsed ? "w-16 sm:w-20" : "w-[260px] sm:w-[270px]"
      } bg-black/60 backdrop-blur-2xl text-white border-r border-white/10 flex flex-col h-full select-none relative shadow-2xl transition-all duration-300 ease-in-out shrink-0 z-50`}
      id="sidebar-container"
    >
      <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />

      {/* Header */}
      <div
        className={`border-b border-white/10 relative z-10 ${
          collapsed ? "py-4 px-2 flex flex-col items-center gap-3" : "px-4 py-4 sm:py-5 flex items-center justify-between gap-2"
        }`}
      >
        {collapsed ? (
          <>
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsCollapsed(false)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00FF66] shrink-0 cursor-pointer shadow-inner"
              title="Expand PDF Scholar Hub"
            >
              <PDFScholarLogo className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FF66]" />
            </motion.div>
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-white/5 hover:bg-[#00FF66] text-zinc-400 hover:text-black border border-white/10 hover:border-[#00FF66] rounded-full transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0 flex-nowrap">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00FF66] shrink-0 shadow-inner"
              >
                <PDFScholarLogo className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FF66]" />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0 flex-1">
                <div className="flex items-center gap-1 font-black text-base sm:text-[17px] tracking-tight leading-none whitespace-nowrap">
                  <span className="text-[#00FF66] drop-shadow-[0_0_12px_rgba(0,255,102,0.35)] shrink-0">PDF</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400 whitespace-nowrap truncate">
                    Scholar Hub
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-zinc-500 uppercase mt-1 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse shrink-0" />
                  <span>Vector AI Active</span>
                </div>
              </motion.div>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden md:flex p-1.5 bg-white/5 hover:bg-[#00FF66] text-zinc-400 hover:text-black border border-white/10 hover:border-[#00FF66] rounded-full transition-all cursor-pointer shrink-0 items-center justify-center"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Nav Menu */}
      <nav className={`flex-1 ${collapsed ? "px-2 sm:px-3" : "px-4 sm:px-5"} py-5 sm:py-6 space-y-4 overflow-y-auto min-h-0 relative z-10`}>
        {!collapsed && (
          <div className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-black px-2">
            Main Menu
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.disabled;
            return (
              <motion.button
                key={item.id}
                whileHover={!isDisabled ? { x: collapsed ? 0 : 3, scale: collapsed ? 1.05 : 1 } : {}}
                whileTap={!isDisabled ? { scale: 0.96 } : {}}
                onClick={() => !isDisabled && setTab(item.id)}
                disabled={isDisabled}
                title={collapsed ? `${item.label}${isDisabled ? " (Select a PDF first)" : ""}` : undefined}
                id={`nav-btn-${item.id}`}
                className={`w-full relative flex items-center ${
                  collapsed ? "justify-center px-0 py-3 rounded-xl" : "justify-between px-3 py-2.5 rounded-xl"
                } text-xs font-bold uppercase tracking-wider text-left transition-all cursor-pointer ${
                  isActive
                    ? "text-black bg-gradient-to-r from-[#00FF66] to-[#00E55B] shadow-[0_0_15px_rgba(0,255,102,0.35)] font-black"
                    : isDisabled
                    ? "text-zinc-700 bg-transparent cursor-not-allowed opacity-50"
                    : "text-zinc-400 hover:text-white glass-card hover:border-white/20"
                }`}
              >
                <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} relative z-10`}>
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-black drop-shadow-sm" : "text-zinc-400"}`} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && item.id === "quiz" && selectedDocumentId && !isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[9px] font-black bg-[#00FF66] text-black px-2 py-0.5 rounded-full relative z-10 shadow-sm"
                  >
                    READY
                  </motion.span>
                )}
                {collapsed && isActive && (
                  <span className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Target Document Card */}
        <div className="pt-5 sm:pt-6">
          {!collapsed && (
            <div className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-black mb-3 px-2 flex items-center justify-between">
              <span>Current Document</span>
              {selectedDocumentId && (
                <span className="bg-amber-400/20 border border-amber-400/50 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-inner">
                  ACTIVE
                </span>
              )}
            </div>
          )}
          <AnimatePresence mode="wait">
            {activeDoc ? (
              collapsed ? (
                <motion.button
                  key={activeDoc.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setTab("chat")}
                  title={`Active Target: ${activeDoc.name}`}
                  className="w-full p-3 glass-card border-[#00FF66]/50 rounded-xl flex items-center justify-center text-[#00FF66] relative shadow-[0_0_15px_rgba(0,255,102,0.15)] cursor-pointer"
                >
                  <FileText className="w-4 h-4 drop-shadow-[0_0_5px_currentColor]" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
                </motion.button>
              ) : (
                <motion.div
                  key={activeDoc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3.5 sm:p-4 glass-card border-l-2 border-l-[#00FF66] rounded-xl flex flex-col gap-3 relative group/doc shadow-lg overflow-hidden"
                >
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00FF66] drop-shadow-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold uppercase tracking-wide text-zinc-100 truncate drop-shadow-sm" title={activeDoc.name}>
                        {activeDoc.name}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 mt-1 flex items-center gap-1.5">
                        <span>{activeDoc.pageCount || 1} Pgs</span>
                        <span>•</span>
                        <span>{activeDoc.chunkCount || 0} Chnks</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 relative z-10">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTab("chat")}
                      className="flex-1 text-center bg-gradient-to-r from-[#00FF66] to-[#00E55B] hover:from-[#00E55B] hover:to-[#00CC55] text-black font-extrabold text-[10px] uppercase tracking-wider py-2 rounded-lg transition-all shadow-[0_0_12px_rgba(0,255,102,0.25)] cursor-pointer"
                    >
                      Chat with PDF
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteDocument(activeDoc.id)}
                      title="Delete Document"
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              )
            ) : !collapsed ? (
              <div className="text-[11px] font-mono text-zinc-500 p-4 border border-dashed border-white/10 rounded-xl text-center uppercase bg-white/5">
                No Document Selected
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </nav>

      {/* User Profile & Sign Out */}
      <div className={`${collapsed ? "p-2 sm:p-3" : "p-4 sm:p-5"} border-t border-white/10 flex flex-col gap-3 text-xs font-mono uppercase tracking-wider shrink-0 relative z-10`}>
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 glass-card p-3 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <Cloud className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
                <span className="truncate">User: <strong className="text-white drop-shadow-sm">{user?.username}</strong></span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66] animate-pulse shrink-0" />
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={logout}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        )}
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
                <SidebarInner collapsed={false} />
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="absolute top-4 right-4 p-2 glass-card hover:bg-white/10 text-zinc-400 hover:text-white rounded-full transition-all z-50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden md:flex h-full relative z-40">
        <SidebarInner collapsed={isCollapsed} />
      </div>
    </>
  );
}
