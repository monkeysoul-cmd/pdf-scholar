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
  Info,
  Sparkles,
  Bot,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Chat() {
  const { documents, selectedDocumentId, chatHistory, addMessage, clearChat, authenticatedFetch } = useAppState();
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

    addMessage(selectedDocumentId, "user", userMessage);

    try {
      const currentHistory = chatHistory[selectedDocumentId] || [];
      const historyPayload = [
        ...currentHistory,
        { role: "user", text: userMessage }
      ];

      const res = await authenticatedFetch("/api/chat", {
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
    } catch (err) {
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

  const toggleSource = (sourceId) => {
    if (expandedSourceId === sourceId) {
      setExpandedSourceId(null);
    } else {
      setExpandedSourceId(sourceId);
    }
  };

  if (!selectedDocumentId) {
    return (
      <div className="flex-1 p-8 bg-[#080808] flex flex-col items-center justify-center min-h-0 relative select-none" id="chat-view">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm border border-zinc-800 bg-[#101010] p-10 rounded-2xl shadow-2xl my-auto"
        >
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 text-[#00FF66] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-white text-lg uppercase tracking-wider">No Active Target</h3>
          <p className="text-xs text-zinc-400 font-mono uppercase mt-2 mb-6 leading-relaxed">
            Select a document from the sidebar or upload a PDF to begin interactive chat sessions.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#080808] flex flex-col min-h-0 h-full select-none relative" id="chat-view">
      {/* Thread Header */}
      <div className="p-4 px-6 bg-[#0E0E0E] border-b border-zinc-800/80 flex items-center justify-between shadow-md shrink-0 z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66] animate-pulse" />
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Interactive Q&A Session</h3>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono mt-1 max-w-lg truncate uppercase" title={activeDoc?.name}>
            Active Document: <strong className="text-[#00FF66]">"{activeDoc?.name}"</strong>
          </p>
        </div>

        {messages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => clearChat(selectedDocumentId)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/40 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </motion.button>
        )}
      </div>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-zinc-900 border border-zinc-800 text-[#00FF66] rounded-2xl flex items-center justify-center mb-5 shadow-xl"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <h4 className="font-extrabold text-white text-base uppercase tracking-wider">Discuss Your Document</h4>
            <p className="text-zinc-400 text-xs mt-2 max-w-xs font-mono uppercase leading-relaxed">
              Ask questions directly based on the indexed content.
            </p>
            <div className="grid grid-cols-1 gap-2.5 mt-8 w-full text-left">
              {[
                "Summarize the main core findings of this document.",
                "What is the overall goal or methodology used?",
                "Provide a structured summary of the conclusions."
              ].map((suggestion, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.01, x: 4, borderColor: "#00FF66" }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setInputText(suggestion)}
                  className="p-3.5 text-xs font-bold bg-[#121212] border border-zinc-800/80 text-zinc-300 hover:text-white rounded-xl transition-all uppercase tracking-wide text-left shadow-sm"
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
                    transition={{ duration: 0.3 }}
                    className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
                  >
                    {/* Speaker Label */}
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase px-1 tracking-wider">
                      {isUser ? <User className="w-3 h-3 text-zinc-400" /> : <Bot className="w-3 h-3 text-[#00FF66]" />}
                      <span>{isUser ? "You" : "PDF Scholar AI"}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4.5 text-xs leading-relaxed shadow-xl border ${
                        isUser
                          ? "bg-[#00FF66] border-[#00FF66] text-black font-extrabold shadow-[0_0_15px_rgba(0,255,102,0.15)]"
                          : "bg-[#121212] border-zinc-800 text-zinc-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-sans text-sm">{msg.text}</p>

                      {/* Collapsible Source Citation List */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="border-t border-zinc-800/80 mt-4 pt-3.5 space-y-2">
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
                                  className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl overflow-hidden text-[10px]"
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleSource(sourceId)}
                                    className="w-full flex items-center justify-between p-3 font-bold text-zinc-300 hover:text-white transition-colors uppercase font-mono"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="bg-[#141414] border border-zinc-800 text-[#00FF66] px-2 py-0.5 rounded-md font-mono text-[9px]">
                                        Section {srcIdx + 1}
                                      </span>
                                      <span>Page {src.chunk.pageIndex}</span>
                                      <span className="text-zinc-700">•</span>
                                      <span className="font-mono text-[9px] text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/20 px-2 py-0.5 rounded-full">
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
                                        className="p-3.5 border-t border-zinc-800 bg-[#060606] text-zinc-300 italic leading-relaxed text-[11px] font-sans break-words select-text"
                                      >
                                        "{src.chunk.text}"
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Grounding Fallback Notice */}
                      {isGroundedFallback && (
                        <div className="flex items-start gap-2.5 bg-amber-950/30 text-amber-400 border border-amber-800/40 rounded-xl p-3.5 mt-4 text-[10px] font-mono uppercase">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-extrabold text-white block mb-0.5 tracking-wider">Note on Source Content</strong>
                            <p className="text-zinc-400 leading-relaxed font-sans normal-case">
                              We couldn't find information for this question in the document itself.
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

        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-1.5 items-start max-w-4xl mx-auto"
            id="chat-thinking-bubble"
          >
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase px-1 tracking-wider">
              <Bot className="w-3 h-3 text-[#00FF66]" />
              <span>Study Assistant Thinking...</span>
            </div>
            <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 text-zinc-300 flex items-center gap-3 text-xs shadow-xl font-mono uppercase">
              <Loader2 className="w-4 h-4 text-[#00FF66] animate-spin" />
              <span>Searching document sections & crafting answer...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Area */}
      <div className="p-4 px-6 bg-[#0E0E0E] border-t border-zinc-800/80 shrink-0" id="chat-input-bar">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            placeholder={`Query document context... (e.g. "Summarize core findings")`}
            className="flex-1 text-xs p-3.5 px-4 border border-zinc-800 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 rounded-xl transition-all bg-[#141414] text-white font-mono uppercase placeholder-zinc-600 outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-3.5 bg-[#00FF66] hover:bg-[#00e55b] disabled:opacity-30 disabled:cursor-not-allowed text-black rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            <Send className="w-4.5 h-4.5" />
          </motion.button>
        </form>
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 mt-2 font-mono uppercase tracking-widest">
          <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span>Factual Grounding Guardrails Active</span>
        </div>
      </div>
    </div>
  );
}
