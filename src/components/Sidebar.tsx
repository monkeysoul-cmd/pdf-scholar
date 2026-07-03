import React from "react";
import { useAppState } from "../lib/state-context";
import {
  BookOpen,
  UploadCloud,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  FileText,
  Trash2,
  Sparkles
} from "lucide-react";

export default function Sidebar() {
  const {
    documents,
    selectedDocumentId,
    activeTab,
    setTab,
    selectDocument,
    deleteDocument
  } = useAppState();

  interface MenuItem {
    id: "overview" | "upload" | "quiz" | "chat" | "guide";
    label: string;
    icon: any;
    disabled?: boolean;
  }

  const menuItems: MenuItem[] = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "upload", label: "Upload PDF", icon: UploadCloud },
    { id: "quiz", label: "Adaptive Quiz", icon: BrainCircuit, disabled: !selectedDocumentId },
    { id: "chat", label: "Interactive Chat", icon: MessageSquare, disabled: !selectedDocumentId },
    { id: "guide", label: "Setup Guide", icon: HelpCircle },
  ];

  const activeDoc = documents.find(d => d.id === selectedDocumentId);

  return (
    <aside className="w-80 bg-[#0A0A0A] text-white border-r border-[#222] flex flex-col h-full select-none" id="sidebar-container">
      {/* Brand Header */}
      <div className="p-8 border-b border-[#222] flex flex-col gap-1.5">
        <div className="logo font-black text-xl tracking-tighter uppercase text-[#00FF66] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#00FF66]" />
          <span>PDF Scholar RAG</span>
        </div>
        <p className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
          V-ENGINE OPERATIONAL
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-6 py-8 space-y-4 overflow-y-auto">
        <div className="text-[10px] font-mono tracking-wider text-zinc-600 uppercase font-black">
          Navigation
        </div>
        
        <div className="flex flex-col gap-3.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.disabled;

            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && setTab(item.id)}
                disabled={isDisabled}
                id={`nav-btn-${item.id}`}
                className={`w-full flex items-center justify-between py-1 transition-all text-xs font-black uppercase tracking-wider text-left ${
                  isActive
                    ? "text-[#00FF66] border-l-2 border-[#00FF66] pl-3"
                    : isDisabled
                    ? "text-zinc-800 cursor-not-allowed"
                    : "text-zinc-500 hover:text-white hover:pl-1.5 border-l-2 border-transparent pl-0"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#00FF66]" : "text-zinc-600"}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === "quiz" && selectedDocumentId && (
                  <span className="text-[9px] font-black bg-[#00FF66] text-black px-1.5 py-0.5 rounded-xs">
                    READY
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Document Section */}
        <div className="pt-10">
          <div className="text-[10px] font-mono tracking-wider text-zinc-600 uppercase font-black mb-3 flex items-center justify-between">
            <span>Active Target</span>
            {selectedDocumentId && (
              <span className="badge-local bg-[#FF5F00] text-black text-[9px] font-black px-1.5 py-0.5 rounded-xs">
                ACTIVE
              </span>
            )}
          </div>

          {activeDoc ? (
            <div className="p-4 bg-[#111] border border-[#222] rounded-xs flex flex-col gap-3 relative group/doc">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black uppercase tracking-wide text-zinc-200 truncate" title={activeDoc.name}>
                    {activeDoc.name}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-1">
                    {activeDoc.pageCount} Pages • {activeDoc.chunkCount} Chunks
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setTab("chat")}
                  className="flex-1 text-center bg-[#00FF66] hover:bg-[#00e55b] text-black font-black text-[10px] uppercase tracking-wider py-1.5 rounded-xs transition-colors"
                >
                  Start Chat
                </button>
                <button
                  onClick={() => deleteDocument(activeDoc.id)}
                  title="Delete Document"
                  className="p-1.5 bg-[#111] hover:bg-red-950/40 hover:text-red-400 border border-[#222] hover:border-red-900/40 rounded-xs text-zinc-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-zinc-600 p-4 border border-dashed border-[#222] rounded-xs text-center uppercase">
              No Document Activated
            </div>
          )}
        </div>

        {/* Document Switcher List */}
        {documents.length > 1 && (
          <div className="pt-8">
            <div className="text-[10px] font-mono tracking-wider text-zinc-600 uppercase font-black mb-3">
              Switch Target Document
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {documents.map(doc => {
                if (doc.id === selectedDocumentId) return null;
                return (
                  <button
                    key={doc.id}
                    onClick={() => selectDocument(doc.id)}
                    className="w-full text-left p-2.5 bg-[#111]/30 hover:bg-[#111] border border-transparent hover:border-[#222] transition-all text-[11px] text-zinc-400 hover:text-white uppercase font-black tracking-wide truncate flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    <span className="truncate flex-1">{doc.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Powered Footer */}
      <div className="p-6 border-t border-[#222] flex items-center justify-between text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
          <span>Local Fallback Core</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#00FF66] shadow-md shadow-[#00FF66]/50 animate-pulse" />
      </div>
    </aside>
  );
}
