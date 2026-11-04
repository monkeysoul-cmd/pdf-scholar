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
  Bot,
  User,
  Clock
} from "lucide-react";
import VectorAIIcon from "./VectorAIIcon";
import { motion, AnimatePresence } from "motion/react";
import { playClick, playBlip, playChime } from "../lib/sound-effects";

export default function Chat() {
  const { documents, selectedDocumentId, chatHistory, addMessage, updateLastMessage, clearChat, authenticatedFetch } = useAppState();
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [expandedSourceId, setExpandedSourceId] = useState(null);
  const messagesEndRef = useRef(null);

  const activeDoc = documents.find(d => d.id === selectedDocumentId);
  const messages = selectedDocumentId ? chatHistory[selectedDocumentId] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedDocumentId || isSending) return;

    playClick();
    const userMessage = inputText.trim();
    setInputText("");
    setIsSending(true);

    // 1. Instantly render user message
    addMessage(selectedDocumentId, "user", userMessage);

    // 2. Add placeholder assistant message for instant streaming typing
    addMessage(selectedDocumentId, "assistant", "", []);

    try {
      const currentHistory = chatHistory[selectedDocumentId] || [];

      const res = await authenticatedFetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          message: userMessage,
          history: currentHistory,
          stream: true
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedText = "";
        let currentSources = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              try {
                const eventData = JSON.parse(trimmed.slice(6));
                if (eventData.type === "sources") {
                  currentSources = eventData.sources || [];
                  const retrievalTimeMs = eventData.retrievalTimeMs;
                  const retrievalMethod = eventData.retrievalMethod;
                  updateLastMessage(selectedDocumentId, msg => ({
                    ...msg,
                    sources: currentSources,
                    retrievalTimeMs,
                    retrievalMethod,
                  }));
                } else if (eventData.type === "token") {
                  accumulatedText += eventData.text;
                  updateLastMessage(selectedDocumentId, msg => ({
                    ...msg,
                    text: accumulatedText,
                    sources: currentSources
                  }));
                } else if (eventData.type === "error") {
                  accumulatedText = eventData.error || "Failed to generate response.";
                  updateLastMessage(selectedDocumentId, msg => ({
                    ...msg,
                    text: accumulatedText
                  }));
                }
              } catch (parseErr) {
                // Ignore SSE framing differences
              }
            }
          }
        }

        if (buffer.trim().startsWith("data: ")) {
          try {
            const eventData = JSON.parse(buffer.trim().slice(6));
            if (eventData.type === "token") {
              accumulatedText += eventData.text;
              updateLastMessage(selectedDocumentId, msg => ({
                ...msg,
                text: accumulatedText
              }));
            }
          } catch {}
        }

        if (!accumulatedText.trim()) {
          updateLastMessage(selectedDocumentId, msg => ({
            ...msg,
            text: msg.text || "No answer returned. Please try again."
          }));
        } else {
          playChime();
        }
      } else {
        // Fallback for non-streaming response
        const data = await res.json();
        if (res.ok && data.text) {
          playChime();
          updateLastMessage(selectedDocumentId, msg => ({
            ...msg,
            text: data.text,
            sources: data.sources || [],
            retrievalTimeMs: data.retrievalTimeMs,
            retrievalMethod: data.retrievalMethod,
          }));
        } else {
          updateLastMessage(selectedDocumentId, msg => ({
            ...msg,
            text: data.error || "Failed to fetch response. Please try again."
          }));
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      updateLastMessage(selectedDocumentId, msg => ({
        ...msg,
        text: err.message || "Network connection failed. Make sure your server is online."
      }));
    } finally {
      setIsSending(false);
    }
  };

  const toggleSource = (sourceId) => {
    if (expandedSourceId === sourceId) {
      setExpandedSourceId(null);
    } else {
      setExpandedSourceId(sourceId);
    }
  };

  if (!selectedDocumentId) {
    return (
      <div className="flex-1 pt-16 md:pt-0 px-4 sm:px-8 bg-tactical-grid flex flex-col items-center justify-center min-h-0 relative select-none z-0" id="chat-view">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm bg-[#0B0D13] border border-white/10 bg-noise p-8 sm:p-10 rounded-xl shadow-sm relative z-10"
        >
          <div className="specular-highlight" />
          <div className="w-14 h-14 bg-white/[0.04] border border-white/10 text-[#00FF66] rounded-lg flex items-center justify-center mx-auto mb-4 shadow-inner">
            <MessageSquare className="w-7 h-7 drop-shadow-sm" />
          </div>
          <h3 className="text-base font-semibold text-white tracking-tight">No document selected</h3>
          <p className="text-xs text-zinc-400 mt-2 mb-6 leading-relaxed">
            Select a document from the sidebar or upload a PDF to begin chatting.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-tactical-grid flex flex-col min-h-0 h-full select-text-content relative pt-14 md:pt-0 z-0" id="chat-view">
      {/* Thread Header */}
      <div className="p-3 sm:p-4 px-4 sm:px-6 bg-[#090A0F] border-b border-white/[0.08] flex items-center justify-between shadow-lg shrink-0 z-10 relative">
        <div className="specular-highlight" />
        <div>
          <div className="flex items-center gap-2">
            <span className="status-led-green" />
            <h3 className="text-xs font-semibold text-white">Document Chat</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-[200px] sm:max-w-lg truncate" title={activeDoc?.name}>
            Document: <strong className="text-zinc-200 font-medium">"{activeDoc?.name}"</strong>
          </p>
        </div>

        {messages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => clearChat(selectedDocumentId)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear chat</span>
          </motion.button>
        )}
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative z-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-white/5 border border-white/10 text-[#00FF66] rounded-full flex items-center justify-center mb-5 shadow-inner"
            >
              <VectorAIIcon className="w-8 h-8 text-[#00FF66]" />
            </motion.div>
            <h4 className="font-semibold text-white text-base tracking-tight">Discuss your document</h4>
            <p className="text-zinc-400 text-xs mt-1.5 max-w-xs leading-relaxed">
              Ask questions directly based on the indexed content.
            </p>
            <div className="grid grid-cols-1 gap-2.5 mt-8 w-full text-left">
              {[
                "Summarize the core findings of this document.",
                "What is the main goal or methodology used?",
                "Provide a structured summary of the key takeaways."
              ].map((suggestion, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.01, x: 3 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    playClick();
                    setInputText(suggestion);
                  }}
                  className="p-3 text-xs font-sans text-zinc-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] rounded-lg transition-all text-left border border-white/[0.08] hover:border-white/20 cursor-pointer flex items-center justify-between group"
                >
                  <span>{suggestion}</span>
                  <kbd className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">TAB</kbd>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const isGroundedFallback =
                  !isUser &&
                  msg.text.includes("I'm sorry, but the provided document does not contain enough information");

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
                  >
                    {/* Speaker Label & High-Precision Telemetry Timestamp */}
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase px-1 tracking-wider">
                      {isUser ? <User className="w-3 h-3 text-zinc-400" /> : <VectorAIIcon className="w-3.5 h-3.5 text-[#00FF66]" />}
                      <span>{isUser ? "You" : <span>PDF Scholar</span>}</span>
                      <span>•</span>
                      <span>{msg.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-lg p-4 text-xs leading-relaxed border relative overflow-hidden select-text ${
                        isUser ? "bg-white/[0.06] border-white/10 text-zinc-100 shadow-sm" : "bg-[#0B0D13] border-white/[0.08] text-zinc-100 shadow-sm"
                      }`}
                    >
                      <div className="specular-highlight" />
                      
                      {!isUser && !msg.text ? (
                        <div className="flex items-center gap-2 text-zinc-400 py-1">
                          <Loader2 className="w-3.5 h-3.5 text-[#00FF66] animate-spin" />
                          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">Searching document and generating answer...</span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap font-sans text-sm">{msg.text}</p>
                      )}

                      {/* Collapsible Source Citation List */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="border-t border-white/[0.08] mt-4 pt-3 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-[#00FF66]" />
                              <span>Sources ({msg.sources.length})</span>
                            </div>
                            {(msg.retrievalTimeMs !== undefined || msg.retrievalMethod) && (
                              <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/20 px-1.5 py-0.5 rounded">
                                <span>{msg.retrievalTimeMs || 1}ms</span>
                                <span>//</span>
                                <span>{msg.retrievalMethod ? "Hybrid search" : "Vector search"}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, srcIdx) => {
                              const sourceId = `${msg.id}_src_${srcIdx}`;
                              const isExpanded = expandedSourceId === sourceId;
                              const scorePercent = Math.round(src.score * 100);

                              return (
                                <div
                                  key={srcIdx}
                                  className="w-full bg-[#08090D] border border-white/[0.08] rounded-md overflow-hidden text-[10px]"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleSource(sourceId)}
                                    className="w-full flex items-center justify-between p-2.5 font-bold text-zinc-300 hover:text-white transition-colors uppercase font-mono cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="bg-white/5 border border-white/10 text-[#00FF66] px-1.5 py-0.5 rounded font-mono text-[9px]">
                                        CHUNK #{srcIdx + 1}
                                      </span>
                                      <span>PAGE {src.chunk.pageIndex}</span>
                                      <span className="text-zinc-600">//</span>
                                      <span className="font-mono text-[9px] text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/20 px-1.5 py-0.5 rounded">
                                        Match: {scorePercent}%
                                      </span>
                                    </div>
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                                    )}
                                  </button>
                                  
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 bg-black/60 border-t border-white/5 text-zinc-300 font-sans text-xs leading-relaxed"
                                      >
                                        <p className="italic font-mono text-[11px]">"{src.chunk.text}"</p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Low Groundedness Flag */}
                      {isGroundedFallback && (
                        <div className="mt-3.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] flex items-start gap-2 font-mono uppercase">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-medium text-amber-300 block mb-0.5">Low confidence match</strong>
                            <p className="text-zinc-400 leading-relaxed font-sans normal-case">
                              The document does not appear to contain relevant context for this question.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 sm:p-4 px-4 sm:px-6 bg-[#090A0F] border-t border-white/[0.08] shrink-0 relative z-10 shadow-2xl" id="chat-input-bar">
        <div className="specular-highlight" />
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            placeholder="Ask a question about this document..."
            className="flex-1 text-xs p-3 px-4 border border-white/10 hover:border-[#00FF66]/40 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 rounded-lg transition-all bg-black/50 text-white font-mono placeholder-zinc-500 outline-none shadow-inner"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-3 bg-[#00FF66] hover:bg-[#1aff75] disabled:opacity-30 disabled:cursor-not-allowed text-black rounded-lg shadow-sm transition-all cursor-pointer relative font-mono font-bold"
          >
            <Send className="w-4 h-4 text-black" />
          </motion.button>
        </form>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] text-zinc-500 mt-2.5 px-1 font-sans">
          <div className="flex items-center gap-2">
            <span>Press <kbd className="kbd-badge text-[9px]">Enter</kbd> to send, <kbd className="kbd-badge text-[9px]">Esc</kbd> to clear</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
            <span>Hybrid vector search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
