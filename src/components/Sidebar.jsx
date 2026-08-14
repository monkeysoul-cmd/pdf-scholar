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

  // Close mobile sidebar on tab change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [activeTab]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
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

  // Reusable sidebar inner content (used for both desktop & mobile drawer)
  const SidebarInner = ({ collapsed }) => (
    <aside
      className={`${
        collapsed ? "w-16 sm:w-20" : "w-72 sm:w-80"
      } bg-[#0B0B0B] text-white border-r border-zinc-800/80 flex flex-col h-full select-none relative shadow-2xl transition-all duration-300 ease-in-out shrink-0`}
      id="sidebar-container"
    >
      {/* Brand Header & Collapse Toggle */}
      <div
        className={`border-b border-zinc-800/80 bg-[#090909] ${
          collapsed ? "py-4 px-2 flex flex-col items-center gap-3" : "p-4 sm:p-6 flex items-center justify-between"
        }`}
      >
        {collapsed ? (
          <>
            {/* Collapsed Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsCollapsed(false)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center text-[#00FF66] shrink-0 cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.15)]"
              title="Expand PDF Scholar Hub"
            >
              <PDFScholarLogo className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FF66]" />
            </motion.div>

            {/* Collapsed Expand Toggle Button */}
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-900 hover:bg-[#00FF66] text-zinc-400 hover:text-black border border-zinc-800 hover:border-[#00FF66] rounded-sm transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-sm bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center text-[#00FF66] shrink-0 shadow-[0_0_12px_rgba(0,255,102,0.15)]"
              >
                <PDFScholarLogo className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FF66]" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <div className="flex items-center gap-1.5 font-black text-lg sm:text-xl tracking-tight leading-none">
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

            {/* Expanded Collapse Toggle Button — desktop only */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden md:flex p-1.5 bg-zinc-900 hover:bg-[#00FF66] text-zinc-400 hover:text-black border border-zinc-800 hover:border-[#00FF66] rounded-sm transition-all cursor-pointer shrink-0 items-center justify-center"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Main Navigation */}
      <nav className={`flex-1 ${collapsed ? "px-2 sm:px-3" : "px-4 sm:px-5"} py-5 sm:py-6 space-y-4 overflow-y-auto min-h-0`}>
        {!collapsed && (
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
                whileHover={!isDisabled ? { x: collapsed ? 0 : 3, scale: collapsed ? 1.05 : 1 } : {}}
                whileTap={!isDisabled ? { scale: 0.96 } : {}}
                onClick={() => !isDisabled && setTab(item.id)}
                disabled={isDisabled}
                title={collapsed ? `${item.label}${isDisabled ? " (Select Document First)" : ""}` : undefined}
                id={`nav-btn-${item.id}`}
                className={`w-full relative flex items-center ${
                  collapsed ? "justify-center px-0 py-3" : "justify-between px-3 sm:px-3.5 py-3"
                } rounded-sm text-xs font-bold uppercase tracking-wider text-left transition-all ${
                  isActive
                    ? "text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/40 shadow-[0_0_12px_rgba(0,255,102,0.15)]"
                    : isDisabled
                    ? "text-zinc-700 bg-transparent cursor-not-allowed opacity-50"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800"
                }`}
              >
                <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} relative z-10`}>
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#00FF66]" : "text-zinc-400"}`} />
                  {!collapsed && <span>{item.label}</span>}
                </div>

                {!collapsed && item.id === "quiz" && selectedDocumentId && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[9px] font-black bg-[#00FF66] text-black px-2 py-0.5 rounded-sm relative z-10 shadow-sm"
                  >
                    READY
                  </motion.span>
                )}

                {/* Pulsing indicator when collapsed & active */}
                {collapsed && isActive && (
                  <span className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Document Section */}
        <div className="pt-5 sm:pt-6">
          {!collapsed && (
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
              collapsed ? (
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
                  className="p-3 sm:p-4 bg-[#141414] border border-zinc-800 rounded-sm flex flex-col gap-3 relative group/doc shadow-lg overflow-hidden"
                >
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00FF66]" />
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
            ) : !collapsed ? (
              <div className="text-[11px] font-mono text-zinc-500 p-4 border border-dashed border-zinc-800 rounded-sm text-center uppercase">
                No Document Activated
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </nav>

      {/* User Info & Logout Footer */}
      <div className={`${collapsed ? "p-2 sm:p-3" : "p-4 sm:p-5"} border-t border-zinc-800/80 flex flex-col gap-3 text-xs font-mono uppercase tracking-wider shrink-0 bg-[#080808]`}>
        {!collapsed ? (
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

  return (
    <>
      {/* Mobile Hamburger Button */}
      <AnimatePresence>
        {!isMobileOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden fixed top-3 left-3 z-40 w-9 h-9 bg-[#0B0B0B] border border-zinc-800 text-zinc-400 hover:text-[#00FF66] hover:border-[#00FF66]/40 rounded-sm flex items-center justify-center transition-all shadow-lg"
            title="Open Navigation"
            id="mobile-menu-btn"
          >
            <Menu className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay + Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed inset-y-0 left-0 z-40"
            >
              <div className="relative h-full">
                <SidebarInner collapsed={false} />
                {/* Close button inside drawer */}
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="absolute top-3 right-3 p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white rounded-sm transition-all z-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar — always visible on md+ */}
      <div className="hidden md:flex">
        <SidebarInner collapsed={isCollapsed} />
      </div>
    </>
  );
}
