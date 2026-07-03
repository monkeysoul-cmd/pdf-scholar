import React, { useState, useRef } from "react";
import { useAppState } from "../lib/state-context";
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Cpu,
  Layers,
  Database,
  Search
} from "lucide-react";

export default function Upload() {
  const { fetchDocuments, selectDocument, setTab } = useAppState();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "reading" | "processing" | "success" | "error">("idle");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { title: "Reading PDF file", desc: "Accessing content buffer on client", icon: FileText },
    { title: "Extracting & Splitting Text", desc: "Running recursive chunking parsing", icon: Layers },
    { title: "Generating Vector Embeddings", desc: "Sending chunks to Gemini embedding models", icon: Cpu },
    { title: "Ingesting to Vector Database", desc: "Writing index matrices to Local storage", icon: Database },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        startIngestion(droppedFile);
      } else {
        showError("Invalid file format. Please upload a PDF document.");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        startIngestion(selectedFile);
      } else {
        showError("Invalid file format. Please upload a PDF document.");
      }
    }
  };

  const showError = (msg: string) => {
    setStatus("error");
    setErrorMessage(msg);
  };

  const startIngestion = async (pdfFile: File) => {
    setStatus("reading");
    setCurrentStep(0);
    setErrorMessage("");

    try {
      // Step 1: Read PDF base64 on client
      const base64Promise = new Promise<string>((resolve, reject) => {
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
      
      // Delay to show step completion visually
      setCurrentStep(1);
      setStatus("processing");

      // Step 2-4 handled by the backend
      const response = await fetch("/api/ingest", {
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

      setCurrentStep(3); // Completing embedding
      
      // Artificial slight delay to let user see "Ingesting to Database" step complete
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentStep(4);
      setStatus("success");

      // Refresh documents list and select the newly uploaded doc
      await fetchDocuments();
      if (data.document && data.document.id) {
        selectDocument(data.document.id);
      }
    } catch (err: any) {
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
    <div className="flex-1 p-8 bg-[#0A0A0A] overflow-y-auto flex flex-col justify-center items-center" id="upload-view">
      <div className="max-w-2xl w-full bg-[#111] border border-[#222] rounded-xs p-8 md:p-12 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-tight text-white uppercase mb-2">Ingest Academic Target</h2>
          <p className="text-xs text-zinc-500 max-w-md mx-auto uppercase font-mono">
            Deploy textbook chapters, scientific papers, or core PDFs to index similarity matrices in our RAG system.
          </p>
        </div>

        {/* Upload Drop Zone / Active steps */}
        {status === "idle" && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-xs p-12 text-center cursor-pointer transition-all select-none ${
              dragActive
                ? "border-[#00FF66] bg-[#00FF66]/5"
                : "border-[#222] hover:border-[#00FF66] hover:bg-black"
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
            <div className="w-16 h-16 bg-[#0A0A0A] border border-[#222] text-[#00FF66] flex items-center justify-center mx-auto mb-4 rounded-xs">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="font-black text-white text-xs uppercase tracking-wider">Select or Drop PDF Document</h3>
            <p className="text-zinc-500 text-[10px] mt-1.5 font-mono uppercase">Max Size: 10MB • format: PDF only</p>
          </div>
        )}

        {/* Stepper Progress */}
        {(status === "reading" || status === "processing") && (
          <div className="space-y-6" id="progress-stepper">
            <div className="bg-black border border-[#222] rounded-xs p-5 flex items-center gap-4">
              <Loader2 className="w-5 h-5 text-[#00FF66] animate-spin shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-white block truncate uppercase tracking-wider">
                  Ingesting: {file?.name}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono uppercase">
                  Running sequential chunk indexes... Please wait
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-4 p-4 rounded-xs border transition-all ${
                      isCompleted
                        ? "bg-[#00FF66]/5 border-[#00FF66]/20"
                        : isActive
                        ? "bg-black border-white"
                        : "bg-transparent border-[#222] opacity-30"
                    }`}
                  >
                    <div className={`p-2 rounded-xs shrink-0 ${
                      isCompleted
                        ? "bg-[#00FF66] text-black"
                        : isActive
                        ? "bg-white text-black animate-pulse"
                        : "bg-[#0A0A0A] text-zinc-600 border border-[#222]"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-black uppercase tracking-wider ${
                          isCompleted ? "text-[#00FF66]" : isActive ? "text-white" : "text-zinc-500"
                        }`}>
                          {step.title}
                        </h4>
                        {isCompleted && (
                          <span className="text-[9px] bg-[#00FF66] text-black px-1.5 py-0.2 rounded-xs font-black tracking-widest">
                            DONE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Success Screen */}
        {status === "success" && (
          <div className="text-center py-6" id="upload-success">
            <div className="w-16 h-16 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 flex items-center justify-center mx-auto mb-5 rounded-xs">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-black text-white text-lg uppercase tracking-wide">Document Ingested Successfully!</h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto uppercase font-mono">
              The target <strong className="text-white font-black">"{file?.name}"</strong> is indexed into vector space.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setTab("chat")}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#00FF66] hover:bg-[#00e55b] text-black font-black text-xs uppercase tracking-wider rounded-xs transition-colors"
              >
                Start Chat Q&A
              </button>
              <button
                onClick={() => setTab("quiz")}
                className="w-full sm:w-auto px-5 py-2.5 bg-transparent hover:bg-black text-white border border-[#222] font-black text-xs uppercase tracking-wider rounded-xs transition-colors"
              >
                Generate Quiz
              </button>
              <button
                onClick={resetUploader}
                className="w-full sm:w-auto px-5 py-2.5 text-zinc-500 hover:text-white font-black text-xs uppercase tracking-wider transition-colors"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}

        {/* Error Screen */}
        {status === "error" && (
          <div className="text-center py-6" id="upload-error">
            <div className="w-16 h-16 bg-red-950/20 text-red-500 border border-red-900/30 flex items-center justify-center mx-auto mb-5 rounded-xs">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="font-black text-white text-lg uppercase tracking-wide">Ingestion Failed</h3>
            <div className="bg-black text-red-400 border border-red-900/40 rounded-xs p-4 text-[11px] mt-4 max-w-md mx-auto text-left font-mono break-words uppercase">
              {errorMessage}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={resetUploader}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xs transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => setTab("overview")}
                className="px-5 py-2.5 text-zinc-500 hover:text-white font-black text-xs uppercase tracking-wider transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
