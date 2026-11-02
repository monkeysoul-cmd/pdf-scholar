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
  ArrowRight
} from "lucide-react";
import VectorAIIcon from "./VectorAIIcon";
import { motion } from "motion/react";

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
    { title: "Splitting into Pages", desc: "Organizing topics and key concepts", icon: Layers },
    { title: "Saving to Vector Store", desc: "Storing document safely in vector database", icon: Cloud },
    { title: "Getting your study partner ready", desc: "Setting up your academic discussion partner", icon: Smile },
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
    e.target.value = "";
  };

  const showError = (msg) => {
    setStatus("error");
    setErrorMessage(msg);
  };

  const handleUpload = async (pdfFile) => {
    const isPdf = pdfFile.type === "application/pdf" || 
                  pdfFile.type === "application/x-pdf" || 
                  pdfFile.name?.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      showError("Invalid file format. Please upload a PDF document.");
      return;
    }

    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    if (pdfFile.size > MAX_FILE_SIZE) {
      showError("File size exceeds 25MB limit. Please upload a smaller PDF.");
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
    <div className="flex-1 pt-16 md:pt-0 px-4 sm:px-8 pb-8 bg-tactical-grid overflow-y-auto min-h-0 flex flex-col items-center justify-center relative select-text-content z-0" id="upload-view">
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-2xl w-full terminal-panel hud-bracket hud-bracket-accent laser-top bg-noise rounded-xl p-6 sm:p-8 md:p-10 relative z-10 my-auto shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="terminal-badge terminal-badge-green mb-3">
            INGESTION_BAY // PDF_PARSER_v2
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-sm">
            MOUNT TARGET DOCUMENT
          </h2>
          <p className="text-[11px] text-zinc-400 max-w-md mx-auto uppercase font-mono mt-1.5">
            LOAD RESEARCH PAPERS, TEXTBOOKS, OR NOTES INTO THE VECTOR STORE
          </p>
        </div>

        {/* Upload Drop Zone */}
        {status === "idle" && (
          <motion.div
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`hud-bracket border border-dashed rounded-lg p-6 sm:p-10 md:p-12 text-center cursor-pointer transition-all relative overflow-hidden group ${
              dragActive
                ? "border-[#00FF66] bg-[#00FF66]/10 shadow-[0_0_20px_rgba(0,255,102,0.2)]"
                : "border-white/15 hover:border-[#00FF66]/60 bg-black/40 hover:bg-white/[0.02]"
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
            <div className="w-14 h-14 bg-white/[0.04] border border-white/10 text-[#00FF66] flex items-center justify-center mx-auto mb-4 rounded-lg shadow-inner relative z-10 group-hover:border-[#00FF66]/50 transition-colors">
              <UploadCloud className="w-7 h-7 drop-shadow-[0_0_8px_currentColor]" />
            </div>
            <h3 className="font-mono font-bold text-white text-xs sm:text-sm uppercase tracking-wider">
              DRAG & DROP PDF OR [ BROWSE SYSTEM ]
            </h3>
            <p className="text-zinc-500 text-[10px] mt-2 font-mono uppercase tracking-wide">
              MAX_SIZE: 10.0 MB // ENCODING: PDF_STREAMS // 3,072-DIM CHUNKING
            </p>
          </motion.div>
        )}

        {/* Stepper Progress */}
        {(status === "reading" || status === "processing") && (
          <div className="space-y-4" id="progress-stepper">
            <div className="terminal-panel rounded-lg p-4 flex items-center gap-4 border-l-2 border-l-[#00FF66]">
              <Loader2 className="w-5 h-5 text-[#00FF66] animate-spin shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-mono font-bold text-white block truncate uppercase tracking-wider">
                  PARSING // {file?.name}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono uppercase">
                  EXTRACTING VECTOR TOKENS & GENERATING EMBEDDINGS...
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={`flex items-start gap-3.5 p-3.5 rounded-lg border transition-all ${
                      isCompleted
                        ? "bg-white/[0.02] border-white/10 text-white"
                        : isActive
                        ? "terminal-panel border-[#00FF66]/50 shadow-[0_0_15px_rgba(0,255,102,0.1)] border-l-2 border-l-[#00FF66]"
                        : "bg-transparent border-white/5 opacity-40"
                    }`}
                  >
                    <div className={`p-2 rounded shrink-0 font-mono ${
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
                        <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                          isCompleted ? "text-[#00FF66]" : isActive ? "text-white" : "text-zinc-500"
                        }`}>
                          {step.title}
                        </h4>
                        {isCompleted && (
                          <span className="text-[9px] bg-[#00FF66] text-black px-1.5 py-0.5 rounded font-mono font-black tracking-widest">
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
              className="w-14 h-14 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center justify-center mx-auto mb-4 rounded-lg shadow-[0_0_20px_rgba(0,255,102,0.25)]"
            >
              <CheckCircle className="w-7 h-7" />
            </motion.div>
            <h3 className="font-black text-white text-lg sm:text-xl uppercase tracking-wide">
              DOCUMENT MOUNTED TO VECTOR STORE
            </h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto uppercase font-mono">
              TARGET <strong className="text-[#00FF66] font-bold">"{file?.name}"</strong> READY FOR RETRIEVAL & INFERENCE.
            </p>
            
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTab("chat")}
                className="w-full sm:w-auto px-5 py-3 bg-[#00FF66] hover:bg-[#1aff75] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,102,0.25)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>[ INITIALIZE CHAT ]</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTab("quiz")}
                className="w-full sm:w-auto px-5 py-3 terminal-panel hover:bg-white/10 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer border border-white/10"
              >
                [ GENERATE QUIZ ]
              </motion.button>
              <button
                onClick={resetUploader}
                className="w-full sm:w-auto px-4 py-3 text-zinc-400 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                MOUNT ANOTHER
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
            <div className="bg-black/50 text-red-400 border border-red-900/40 rounded-xl p-4 text-xs mt-4 max-w-md mx-auto text-left font-mono break-words normal-case">
              {errorMessage}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={resetUploader}
                className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Try Again
              </motion.button>
              <button
                onClick={() => setTab("overview")}
                className="px-5 py-3 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
