import React, { useState } from "react";
import {
  Layers,
  ArrowRight,
  Clipboard,
  Check,
  Award,
  Cloud,
  GraduationCap,
  Sparkles
} from "lucide-react";

export default function Guide() {
  const [copied, setCopied] = useState(false);

  const vectorConfigJSON = `{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(vectorConfigJSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const systemFeatures = [
    {
      title: "Full-Stack PDF Study Platform",
      desc: "Architected a full-stack study partner tool utilizing Express and React, enabling instant reading and processing of uploaded PDF files."
    },
    {
      title: "Text Splitting & Chunking",
      desc: "Implemented logical, sentence-safe boundaries to split documents into readable sections, preventing cut-off sentences."
    },
    {
      title: "AI Quiz Generator & Score Tracking",
      desc: "Synthesizes diagnostic multiple-choice and short-answer questions per document, storing test performance scores for performance tracking."
    },
    {
      title: "Grounded Safe Answers",
      desc: "Designed query filters to make sure the assistant answers strictly based on the text of your document, preventing guesses."
    }
  ];

  return (
    <div className="flex-1 p-8 bg-[#080808] overflow-y-auto min-h-0 select-none" id="guide-view">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#222] pb-6">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">How to Use & System Overview</h2>
          <p className="text-[11px] text-[#00FF66] font-mono uppercase mt-1">
            Learn how PDF documents are processed, indexed, and evaluated with interactive quizzes.
          </p>
        </div>

        {/* 1. Processing Pipeline */}
        <div className="bg-[#101010] border border-[#222] rounded-sm p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-[#00FF66]" />
            <h3 className="font-black text-white text-sm uppercase tracking-wider">Document Processing Pipeline</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 text-center select-none" id="rag-diagram">
            <div className="bg-[#0A0A0A] border border-[#222] p-4 rounded-sm">
              <span className="text-[9px] font-mono font-bold text-[#00FF66] block mb-1 uppercase tracking-widest">Step 1</span>
              <strong className="text-xs font-black text-white block uppercase">Upload PDF</strong>
              <span className="text-[9px] text-zinc-500 block font-mono mt-1 uppercase">Read document</span>
            </div>

            <div className="hidden md:flex justify-center text-zinc-600">
              <ArrowRight className="w-5 h-5 animate-pulse text-[#00FF66]" />
            </div>

            <div className="bg-[#0A0A0A] border border-[#222] p-4 rounded-sm">
              <span className="text-[9px] font-mono font-bold text-[#00FF66] block mb-1 uppercase tracking-widest">Step 2</span>
              <strong className="text-xs font-black text-white block uppercase">Prepare Text</strong>
              <span className="text-[9px] text-zinc-500 block font-mono mt-1 uppercase">Split to sections</span>
            </div>

            <div className="hidden md:flex justify-center text-zinc-600">
              <ArrowRight className="w-5 h-5 animate-pulse text-[#00FF66]" />
            </div>

            <div className="bg-[#0A0A0A] border border-[#222] p-4 rounded-sm">
              <span className="text-[9px] font-mono font-bold text-[#00FF66] block mb-1 uppercase tracking-widest">Step 3</span>
              <strong className="text-xs font-black text-white block uppercase">Vector Search</strong>
              <span className="text-[9px] text-zinc-500 block font-mono mt-1 uppercase">Cloud Vector Engine</span>
            </div>
          </div>
        </div>

        {/* 2. Vector Index Setup */}
        <div className="bg-[#101010] border border-[#222] rounded-sm p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-[#00FF66]" />
              <h3 className="font-black text-white text-sm uppercase tracking-wider">Vector Index Schema & Configuration</h3>
            </div>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#222] bg-black hover:bg-[#141414] text-zinc-400 hover:text-white rounded-sm text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00FF66]" />
                  <span className="text-[#00FF66]">Copied JSON!</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Copy JSON Config</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 font-mono uppercase leading-relaxed text-left">
            High-speed similarity search uses vector embeddings (768 dimensions with cosine similarity) to extract accurate context chunks for AI responses and diagnostic quiz synthesis.
          </p>

          <pre className="bg-black text-zinc-300 text-xs p-4.5 rounded-sm border border-[#222] overflow-x-auto max-h-72 font-mono leading-relaxed select-text text-left">
            {vectorConfigJSON}
          </pre>
        </div>

        {/* 3. System Milestones */}
        <div className="bg-[#101010] border border-[#222] rounded-sm p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-[#00FF66]" />
            <h3 className="font-black text-white text-sm uppercase tracking-wider">Study Engine Highlights</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemFeatures.map((point, i) => (
              <div key={i} className="bg-[#0A0A0A] border border-[#222] p-5 rounded-sm relative">
                <span className="absolute top-4 right-4 text-[9px] font-mono font-black text-zinc-600 tracking-widest uppercase">
                  MODULE {i + 1}
                </span>
                <h4 className="font-black text-white text-xs uppercase tracking-wider mb-2">{point.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
