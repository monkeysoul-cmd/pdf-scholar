import React, { useState, useRef, useEffect } from "react";
import { useAppState } from "../lib/state-context";
import {
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info
} from "lucide-react";

export default function Chat() {
  const { documents, selectedDocumentId, chatHistory, addMessage, clearChat } = useAppState();
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeDoc = documents.find(d => d.id === selectedDocumentId);
  const messages = selectedDocumentId ? chatHistory[selectedDocumentId] || [] : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedDocumentId || isSending) return;

    const userMessage = inputText.trim();
    setInputText("");
    setIsSending(true);

    // 1. Add user message locally
    addMessage(selectedDocumentId, "user", userMessage);

    try {
      // 2. Fetch full active history to send to server
      const currentHistory = chatHistory[selectedDocumentId] || [];
      const historyPayload = [
        ...currentHistory,
        { role: "user", text: userMessage }
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          message: userMessage,
          history: historyPayload
        }),
      });

      const data = await res.json();
      if (res.ok && data.text) {
        addMessage(selectedDocumentId, "assistant", data.text, data.sources || []);
      } else {
        addMessage(
          selectedDocumentId,
          "assistant",
          data.error || "Failed to fetch response. Please try again."
        );
      }
    } catch (err: any) {
      console.error(err);
      addMessage(
        selectedDocumentId,
        "assistant",
        "Network connection failed. Make sure your server is online."
      );
    } finally {
      setIsSending(false);
    }
  };

  const toggleSource = (sourceId: string) => {
    if (expandedSourceId === sourceId) {
      setExpandedSourceId(null);
    } else {
      setExpandedSourceId(sourceId);
    }
  };

  if (!selectedDocumentId) {
    return (
      <div className="flex-1 p-8 bg-[#0A0A0A] flex flex-col items-center min-h-0" id="chat-view">
        <div className="text-center max-w-sm border border-[#222] bg-[#111] p-10 rounded-xs shadow-2xl my-auto">
          <MessageSquare className="w-12 h-12 text-[#00FF66] mx-auto mb-4" />
          <h3 className="font-black text-white text-base uppercase tracking-wider">No Active Target</h3>
          <p className="text-[11px] text-zinc-500 font-mono uppercase mt-2 mb-6">
            Select a document from the sidebar or upload a PDF to begin interactive chat sessions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0A0A0A] flex flex-col min-h-0 h-full" id="chat-view">
      {/* Thread Header */}
      <div className="p-4 bg-[#111] border-b border-[#222] flex items-center justify-between shadow-xs shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse" />
            <h3 className="font-black text-white text-xs uppercase tracking-wider">Interactive RAG Session</h3>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono mt-1 max-w-lg truncate uppercase" title={activeDoc?.name}>
            Context Target: <strong className="text-white">"{activeDoc?.name}"</strong>
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => clearChat(selectedDocumentId)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-950/20 text-zinc-500 hover:text-red-500 border border-[#222] hover:border-red-900/30 rounded-xs text-[10px] font-black uppercase tracking-wider transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
            <div className="w-16 h-16 bg-[#111] border border-[#222] text-[#00FF66] rounded-xs flex items-center justify-center mb-5">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h4 className="font-black text-white text-base uppercase tracking-wider">Start PDF Consultation</h4>
            <p className="text-zinc-500 text-[11px] mt-1.5 max-w-xs font-mono uppercase leading-relaxed">
              Ask questions. Our RAG engine will perform vector lookups, pull matching passages, and draft grounded answers.
            </p>
            <div className="grid grid-cols-1 gap-2 mt-8 w-full text-left">
              {[
                "Summarize the main core findings of this document.",
                "What is the overall goal or methodology used?",
                "Provide a structured summary of the conclusions."
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(suggestion)}
                  className="p-3 text-[10px] font-black bg-[#111] border border-[#222] text-zinc-300 hover:text-white hover:border-white rounded-xs transition-all uppercase tracking-wider text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const isGroundedFallback =
                !isUser &&
                msg.text.includes("I'm sorry, but the provided document does not contain enough information");

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
                >
                  {/* Speaker Label */}
                  <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 uppercase px-1 tracking-wider">
                    <span>{isUser ? "You" : "PDF Scholar AI"}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-xs p-4.5 text-xs leading-relaxed shadow-lg border ${
                      isUser
                        ? "bg-[#00FF66] border-[#00FF66] text-black font-black"
                        : "bg-[#111] border-[#222] text-zinc-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap font-sans text-sm">{msg.text}</p>

                    {/* Collapsible Source Citation List */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="border-t border-[#222] mt-4 pt-3.5 space-y-2">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest mb-2">
                          <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Grounded Excerpts ({msg.sources.length})</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((src, srcIdx) => {
                            const sourceId = `${msg.id}_src_${srcIdx}`;
                            const isExpanded = expandedSourceId === sourceId;
                            const scorePercent = Math.round(src.score * 100);

                            return (
                              <div
                                key={srcIdx}
                                className="w-full bg-black border border-[#222] rounded-xs overflow-hidden text-[10px]"
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleSource(sourceId)}
                                  className="w-full flex items-center justify-between p-2.5 font-bold text-zinc-400 hover:text-white transition-colors uppercase font-mono"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="bg-[#111] border border-[#222] text-[#00FF66] px-1.5 py-0.5 rounded-xs font-mono text-[9px]">
                                      Excerpt {srcIdx + 1}
                                    </span>
                                    <span>Page {src.chunk.pageIndex}</span>
                                    <span className="text-zinc-800">•</span>
                                    <span className="font-mono text-[9px] text-[#00FF66] bg-[#00FF66]/5 border border-[#00FF66]/15 px-1.5 py-0.2 rounded-xs">
                                      Match: {scorePercent}%
                                    </span>
                                  </div>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                                  )}
                                </button>
                                
                                {isExpanded && (
                                  <div className="p-3 border-t border-[#222] bg-[#0c0c0c] text-zinc-400 italic leading-relaxed text-[11px] font-sans break-words border-dashed select-text">
                                    "{src.chunk.text}"
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Grounding Fallback Notice */}
                    {isGroundedFallback && (
                      <div className="flex items-start gap-2.5 bg-amber-950/20 text-amber-500 border border-amber-900/30 rounded-xs p-3.5 mt-4 text-[10px] font-mono uppercase">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-black text-white block mb-0.5 tracking-wider">Strict Grounding Activated</strong>
                          <p className="text-zinc-400 leading-relaxed font-sans normal-case">
                            This query fell outside the PDF source text. Hallucination restricted.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isSending && (
          <div className="flex flex-col gap-1.5 items-start max-w-4xl mx-auto" id="chat-thinking-bubble">
            <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 uppercase px-1 tracking-wider">
              <span>PDF Scholar AI</span>
              <span>•</span>
              <span>Thinking...</span>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xs p-4 text-zinc-400 flex items-center gap-2.5 text-xs shadow-lg font-mono uppercase">
              <Loader2 className="w-4 h-4 text-[#00FF66] animate-spin" />
              <span>Analyzing vector chunks and mapping context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Area */}
      <div className="p-4 bg-[#111] border-t border-[#222] shrink-0" id="chat-input-bar">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            placeholder={`Query document context... (e.g. "Summarize results")`}
            className="flex-1 text-xs p-3.5 border border-[#222] rounded-xs focus:outline-hidden focus:border-[#00FF66] focus:bg-black transition-all bg-black text-white font-mono uppercase"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-3.5 bg-[#00FF66] hover:bg-[#00e55b] disabled:opacity-30 disabled:cursor-not-allowed text-black rounded-xs shadow-lg transition-colors cursor-pointer"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-1.5 text-[9px] text-zinc-600 mt-2.5 font-mono uppercase tracking-widest">
          <Info className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span>Factual Grounding Guardrails Active</span>
        </div>
      </div>
    </div>
  );
}
