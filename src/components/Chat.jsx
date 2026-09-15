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
  User
} from "lucide-react";
import VectorAIIcon from "./VectorAIIcon";
import { motion, AnimatePresence } from "motion/react";

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

    const userMessage = inputText.trim();
    setInputText("");
    setIsSending(true);

    // 1. Instantly render user message
    addMessage(selectedDocumentId, "user", userMessage);

    // 2. Add placeholder assistant message for instant streaming typing
    addMessage(selectedDocumentId, "assistant", "", []);

    try {
      const currentHistory = chatHistory[selectedDocumentId] || [];
      const historyPayload = [
        ...currentHistory,
        { role: "user", text: userMessage }
      ];

      const res = await authenticatedFetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          message: userMessage,
          history: historyPayload,
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
                  updateLastMessage(selectedDocumentId, msg => ({
                    ...msg,
                    sources: currentSources
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
        }
      } else {
        // Fallback for non-streaming response
        const data = await res.json();
        if (res.ok && data.text) {
          updateLastMessage(selectedDocumentId, msg => ({
            ...msg,
            text: data.text,
            sources: data.sources || []
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
      <div className="flex-1 pt-16 md:pt-0 px-4 sm:px-8 bg-dot-grid flex flex-col items-center justify-center min-h-0 relative select-none z-0" id="chat-view">
        <div className="ambient-glow ambient-glow-green w-[400px] h-[400px] animate-float-slow" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm glass-tile bg-noise p-10 rounded-2xl shadow-2xl relative z-10 border border-white/10"
        >
          <div className="specular-highlight" />
          <div className="w-16 h-16 bg-white/5 border border-white/10 text-[#00FF66] rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <MessageSquare className="w-8 h-8 drop-shadow-sm" />
          </div>
          <h3 className="font-extrabold text-white text-lg uppercase tracking-wider">No Document Selected</h3>
          <p className="text-xs text-zinc-400 font-mono uppercase mt-2 mb-6 leading-relaxed">
            Select a document from the sidebar or upload a PDF to begin interactive chat sessions.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-dot-grid flex flex-col min-h-0 h-full select-text-content relative pt-14 md:pt-0 z-0" id="chat-view">
      {/* Ambient Glow */}
      <div className="ambient-glow ambient-glow-green w-[500px] h-[500px] top-[20%] right-[-100px] animate-float-slow" />
      
      {/* Thread Header */}
      <div className="p-3 sm:p-4 px-4 sm:px-6 bg-white/[0.04] backdrop-blur-2xl border-b border-white/10 flex items-center justify-between shadow-lg shrink-0 z-10 relative">
        <div className="specular-highlight" />
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66] animate-pulse" />
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Interactive Q&A Session</h3>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono mt-1 max-w-[200px] sm:max-w-lg truncate uppercase" title={activeDoc?.name}>
            Active Document: <strong className="text-[#00FF66]">"{activeDoc?.name}"</strong>
          </p>
        </div>

        {messages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => clearChat(selectedDocumentId)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
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
            <h4 className="font-extrabold text-white text-base uppercase tracking-wider">Discuss Your Document</h4>
            <p className="text-zinc-400 text-xs mt-2 max-w-xs font-mono uppercase leading-relaxed">
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
                  onClick={() => setInputText(suggestion)}
                  className="p-3.5 text-xs font-bold glass-tile glass-tile-interactive text-zinc-300 hover:text-white rounded-xl transition-all uppercase tracking-wide text-left shadow-md border border-white/10 hover:border-[#00FF66]/40 cursor-pointer"
                >
                  {suggestion}
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
                    {/* Speaker Label */}
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase px-1 tracking-wider">
                      {isUser ? <User className="w-3 h-3 text-zinc-400" /> : <VectorAIIcon className="w-3.5 h-3.5 text-[#00FF66]" />}
                      <span>{isUser ? "You" : <span><strong className="text-[#00FF66]">PDF</strong> Scholar AI</span>}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4.5 text-xs leading-relaxed shadow-2xl border relative overflow-hidden select-text ${
                        isUser
                          ? "bg-gradient-to-br from-[#00FF66]/25 via-[#00FF66]/10 to-transparent backdrop-blur-xl border-[#00FF66]/40 text-white shadow-[0_8px_32px_rgba(0,255,102,0.18)]"
                          : "glass-tile text-zinc-100 border border-white/10 shadow-2xl"
                      }`}
                    >
                      <div className="specular-highlight" />
                      {/* Accent bar for user */}
                      {isUser && <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />}
                      
                      {!isUser && !msg.text ? (
                        <div className="flex items-center gap-2 text-zinc-400 py-1">
                          <Loader2 className="w-3.5 h-3.5 text-[#00FF66] animate-spin" />
                          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">Analyzing pages & streaming answer...</span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap font-sans text-sm">{msg.text}</p>
                      )}

                      {/* Collapsible Source Citation List */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="border-t border-white/10 mt-4 pt-3.5 space-y-2">
                          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2">
                            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Matching Sections ({msg.sources.length})</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((src, srcIdx) => {
                              const sourceId = `${msg.id}_src_${srcIdx}`;
                              const isExpanded = expandedSourceId === sourceId;
                              const scorePercent = Math.round(src.score * 100);

                              return (
                                <div
                                  key={srcIdx}
                                  className="w-full glass-tile border border-white/10 rounded-xl overflow-hidden text-[10px]"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleSource(sourceId)}
                                    className="w-full flex items-center justify-between p-3 font-bold text-zinc-300 hover:text-white transition-colors uppercase font-mono cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="bg-white/5 border border-white/10 text-[#00FF66] px-2 py-0.5 rounded-md font-mono text-[9px]">
                                        Section {srcIdx + 1}
                                      </span>
                                      <span>Page {src.chunk.pageIndex}</span>
                                      <span className="text-zinc-600">•</span>
                                      <span className="font-mono text-[9px] text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/20 px-2 py-0.5 rounded-md">
                                        Relevance: {scorePercent}%
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
                                        className="p-3.5 bg-black/60 border-t border-white/5 text-zinc-300 font-sans text-xs leading-relaxed"
                                      >
                                        <p className="italic">"{src.chunk.text}"</p>
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
                        <div className="mt-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] flex items-start gap-2 font-mono uppercase">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-extrabold text-white block mb-0.5 tracking-wider">Note on Source Content</strong>
                            <p className="text-zinc-400 leading-relaxed font-sans normal-case">
                              We couldn't find explicit coverage for this question directly in the document text.
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
      <div className="p-3 sm:p-4 px-4 sm:px-6 bg-white/[0.04] backdrop-blur-2xl border-t border-white/10 shrink-0 relative z-10 shadow-2xl" id="chat-input-bar">
        <div className="specular-highlight" />
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            placeholder={`Query document context... (e.g. "Summarize core findings")`}
            className="flex-1 text-xs p-3.5 px-4 border border-white/10 hover:border-[#00FF66]/40 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 rounded-xl transition-all bg-black/30 backdrop-blur-md text-white font-mono placeholder-zinc-500 outline-none shadow-inner"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-3.5 bg-gradient-to-r from-[#00FF66] to-[#00E55B] hover:from-[#00E55B] hover:to-[#00CC55] disabled:opacity-30 disabled:cursor-not-allowed text-black rounded-xl shadow-[0_0_20px_rgba(0,255,102,0.35)] transition-all cursor-pointer relative group"
          >
            <Send className="w-4 h-4 text-black" />
          </motion.button>
        </form>
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 mt-2 font-mono uppercase tracking-widest">
          <span>Target Context Discussion</span>
          <span>•</span>
          <span className="text-[#00FF66]">Grounded in Uploaded Pages</span>
        </div>
      </div>
    </div>
  );
}
