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
  Check,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";
import { playClick, playChime } from "../lib/sound-effects";

export default function Upload() {
  const { fetchDocuments, selectDocument, setTab, authenticatedFetch } = useAppState();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  const steps = [
    { title: "Reading PDF", desc: "Extracting text and structure", icon: FileText },
    { title: "Page-aware chunking", desc: "Dividing content into semantic sections", icon: Layers },
    { title: "Indexing vectors", desc: "Computing embeddings for hybrid search", icon: Cloud },
    { title: "Ready", desc: "Document ready for search and discussion", icon: Check },
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

  const fileToBase64 = (fileToConvert) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileToConvert);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (uploadedFile) => {
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf" && !uploadedFile.name.toLowerCase().endsWith(".pdf")) {
      setStatus("error");
      setErrorMessage("Please select a valid PDF file.");
      return;
    }

    if (uploadedFile.size > 20 * 1024 * 1024) {
      setStatus("error");
      setErrorMessage("File exceeds 20MB limit. Please upload a smaller document.");
      return;
    }

    playClick();
    setFile(uploadedFile);
    setStatus("reading");
    setCurrentStep(0);
    setErrorMessage("");

    try {
      const base64Data = await fileToBase64(uploadedFile);
      setStatus("processing");
      setCurrentStep(1);

      const stepTimer1 = setTimeout(() => setCurrentStep(2), 600);
      const stepTimer2 = setTimeout(() => setCurrentStep(3), 1200);

      const response = await authenticatedFetch("/api/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfBase64: base64Data,
          filename: uploadedFile.name,
          size: uploadedFile.size,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process document.");
      }

      setCurrentStep(3);
      setStatus("success");
      playChime();

      await fetchDocuments();
      if (data.document?.id) {
        selectDocument(data.document.id);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred during processing.");
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
    <div className="flex-1 pt-16 md:pt-0 px-4 sm:px-8 pb-8 bg-[#07080B] overflow-y-auto min-h-0 flex flex-col items-center justify-center relative select-text-content z-0" id="upload-view">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-xl w-full bg-[#0B0D13] border border-white/[0.08] rounded-xl p-6 sm:p-8 relative z-10 my-auto shadow-xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Upload Document
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Upload research papers, textbooks, or study notes to index them for search and questions.
          </p>
        </div>

        {/* Upload Drop Zone */}
        {status === "idle" && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-colors relative overflow-hidden group ${
              dragActive
                ? "border-[#00FF66] bg-[#00FF66]/5"
                : "border-white/15 hover:border-white/30 bg-black/30 hover:bg-white/[0.02]"
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
            <div className="w-12 h-12 bg-white/[0.04] border border-white/10 text-[#00FF66] flex items-center justify-center mx-auto mb-3 rounded-lg group-hover:border-[#00FF66]/40 transition-colors">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-zinc-200">
              Drag and drop your PDF here, or <span className="text-[#00FF66] hover:underline">browse files</span>
            </p>
            <p className="text-zinc-500 text-xs mt-1.5 font-mono">
              PDF documents up to 20MB
            </p>
          </div>
        )}

        {/* Stepper Progress */}
        {(status === "reading" || status === "processing") && (
          <div className="space-y-4" id="progress-stepper">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3.5 flex items-center gap-3.5">
              <Loader2 className="w-4 h-4 text-[#00FF66] animate-spin shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-white block truncate">
                  Processing: {file?.name}
                </span>
                <span className="text-[11px] text-zinc-400">
                  Extracting text and generating vector embeddings...
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isCompleted
                        ? "bg-white/[0.02] border-white/10 text-white"
                        : isActive
                        ? "bg-white/[0.04] border-[#00FF66]/30 text-white"
                        : "bg-transparent border-white/5 opacity-40"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? "bg-[#00FF66] text-black"
                        : isActive
                        ? "bg-white/[0.1] text-white"
                        : "bg-zinc-900 text-zinc-600"
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${isCompleted ? "text-[#00FF66]" : "text-zinc-200"}`}>
                          {step.title}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {isCompleted ? "Done" : isActive ? "Working" : "Queued"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Success Screen */}
        {status === "success" && (
          <div className="text-center py-4" id="upload-success">
            <div className="w-12 h-12 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center justify-center mx-auto mb-3.5 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white text-base">
              Document indexed successfully
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              "{file?.name}" is ready for research questions and practice quizzes.
            </p>
            
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={() => setTab("chat")}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#00FF66] hover:bg-[#1aff75] text-black font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Start Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTab("quiz")}
                className="w-full sm:w-auto px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] text-white font-medium text-xs rounded-lg transition-colors border border-white/10 cursor-pointer"
              >
                Generate Quiz
              </button>
              <button
                onClick={resetUploader}
                className="w-full sm:w-auto px-3 py-2.5 text-zinc-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Upload another
              </button>
            </div>
          </div>
        )}

        {/* Error Screen */}
        {status === "error" && (
          <div className="text-center py-4" id="upload-error">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto mb-3.5 rounded-xl">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white text-base">Upload failed</h3>
            <div className="bg-black/50 text-red-400 border border-red-500/20 rounded-lg p-3 text-xs mt-3 max-w-md mx-auto text-left font-mono break-words">
              {errorMessage}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                onClick={resetUploader}
                className="px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Try again
              </button>
              <button
                onClick={() => setTab("overview")}
                className="px-4 py-2.5 text-zinc-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Go to Overview
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
