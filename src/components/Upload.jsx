import React, { useState, useRef } from "react";
import { useAppState } from "../lib/state-context";
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Layers,
  Cloud,
  Smile,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Upload() {
  const { fetchDocuments, selectDocument, setTab, authenticatedFetch } = useAppState();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  const steps = [
    { title: "Opening PDF file", desc: "Reading the contents of your document", icon: FileText },
    { title: "Splitting into Pages", desc: "Preparing text chunks for vector processing", icon: Layers },
    { title: "Saving to Cloud Storage", desc: "Storing document safely in MongoDB Atlas", icon: Cloud },
    { title: "Finalizing AI Index", desc: "Setting up your academic discussion partner", icon: Smile },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const showError = (msg) => {
    setStatus("error");
    setErrorMessage(msg);
  };

  const handleUpload = async (pdfFile) => {
    if (pdfFile.type !== "application/pdf") {
      showError("Invalid file format. Please upload a PDF document.");
      return;
    }

    setFile(pdfFile);
    setStatus("reading");
    setCurrentStep(0);
    setErrorMessage("");

    try {
      const base64Promise = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
          } else {
            reject(new Error("Failed to read file buffer"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(pdfFile);
      });

      const base64Str = await base64Promise;
      
      setCurrentStep(1);
      setStatus("processing");

      const response = await authenticatedFetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfBase64: base64Str,
          filename: pdfFile.name,
          size: pdfFile.size,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to ingest document.");
      }

      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 600));
      setCurrentStep(4);
      setStatus("success");

      await fetchDocuments();
      if (data.document && data.document.id) {
        selectDocument(data.document.id);
      }
    } catch (err) {
      console.error(err);
      showError(err.message || "An unexpected error occurred during ingestion.");
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const resetUploader = () => {
    setFile(null);
    setStatus("idle");
    setCurrentStep(0);
    setErrorMessage("");
  };

  return (
    <div className="flex-1 p-8 bg-[#080808] overflow-y-auto min-h-0 flex flex-col items-center justify-center relative select-none" id="upload-view">
      {/* Glow Backdrop */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00FF66]/5 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-2xl w-full bg-[#101010] border border-zinc-800/80 rounded-2xl p-8 md:p-12 shadow-2xl relative z-10 my-auto overflow-hidden"
      >
        {/* Top Glow Accent */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00FF66]/40 to-transparent" />

        {/* Header */}
        <div className="text-center mb-9">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FF66]/10 border border-[#00FF66]/20 text-[#00FF66] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3" /> Vector Ingestion Engine
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
            Add Study Document
          </h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto uppercase font-mono mt-2">
            Upload textbook chapters, articles, or notes for AI discussion.
          </p>
        </div>

        {/* Upload Drop Zone */}
        {status === "idle" && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-[#00FF66] bg-[#00FF66]/10 shadow-[0_0_30px_rgba(0,255,102,0.15)]"
                : "border-zinc-800 hover:border-[#00FF66]/60 hover:bg-zinc-900/60"
            }`}
            id="drop-zone"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept="application/pdf"
              className="hidden"
            />
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-zinc-900 border border-zinc-800 text-[#00FF66] flex items-center justify-center mx-auto mb-4 rounded-2xl shadow-lg"
            >
              <UploadCloud className="w-8 h-8" />
            </motion.div>
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
              Select or Drop PDF File
            </h3>
            <p className="text-zinc-500 text-[10px] mt-2 font-mono uppercase">
              Max Size: 10MB • Format: PDF Only
            </p>
          </motion.div>
        )}

        {/* Stepper Progress */}
        {(status === "reading" || status === "processing") && (
          <div className="space-y-6" id="progress-stepper">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
              <Loader2 className="w-5 h-5 text-[#00FF66] animate-spin shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate uppercase tracking-wider">
                  Processing: {file?.name}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono uppercase">
                  Embedding PDF chunks... Please wait
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      isCompleted
                        ? "bg-[#00FF66]/5 border-[#00FF66]/30 text-white"
                        : isActive
                        ? "bg-zinc-900 border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.1)]"
                        : "bg-transparent border-zinc-800/40 opacity-40"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isCompleted
                        ? "bg-[#00FF66] text-black"
                        : isActive
                        ? "bg-white text-black animate-pulse"
                        : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-bold uppercase tracking-wider ${
                          isCompleted ? "text-[#00FF66]" : isActive ? "text-white" : "text-zinc-500"
                        }`}>
                          {step.title}
                        </h4>
                        {isCompleted && (
                          <span className="text-[9px] bg-[#00FF66] text-black px-2 py-0.5 rounded-full font-black tracking-widest">
                            DONE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono uppercase mt-0.5">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Success Screen */}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
            id="upload-success"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center justify-center mx-auto mb-5 rounded-2xl shadow-[0_0_30px_rgba(0,255,102,0.2)]"
            >
              <CheckCircle className="w-8 h-8" />
            </motion.div>
            <h3 className="font-black text-white text-xl uppercase tracking-wide">
              Document Ingested Successfully!
            </h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto uppercase font-mono">
              Target <strong className="text-[#00FF66] font-bold">"{file?.name}"</strong> is indexed and ready for discussion.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTab("chat")}
                className="w-full sm:w-auto px-6 py-3 bg-[#00FF66] hover:bg-[#00e55b] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)] flex items-center justify-center gap-1.5"
              >
                <span>Start Chat Q&A</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTab("quiz")}
                className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Generate Quiz
              </motion.button>
              <button
                onClick={resetUploader}
                className="w-full sm:w-auto px-4 py-3 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Upload Another
              </button>
            </div>
          </motion.div>
        )}

        {/* Error Screen */}
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
            id="upload-error"
          >
            <div className="w-16 h-16 bg-red-950/40 text-red-400 border border-red-800/40 flex items-center justify-center mx-auto mb-5 rounded-2xl">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="font-black text-white text-lg uppercase tracking-wide">Ingestion Failed</h3>
            <div className="bg-zinc-950 text-red-400 border border-red-900/40 rounded-xl p-4 text-[11px] mt-4 max-w-md mx-auto text-left font-mono break-words uppercase">
              {errorMessage}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={resetUploader}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Try Again
              </motion.button>
              <button
                onClick={() => setTab("overview")}
                className="px-5 py-3 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
