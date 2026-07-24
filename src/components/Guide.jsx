import React, { useState } from "react";
import {
  Layers,
  ArrowRight,
  Clipboard,
  Check,
  Award,
  Cloud
} from "lucide-react";

export default function Guide() {
  const [copied, setCopied] = useState(false);

  const mongoIndexJSON = `{
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
    navigator.clipboard.writeText(mongoIndexJSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resumePoints = [
    {
      title: "Full-Stack Study Platform",
      desc: "Architected a full-stack study partner tool utilizing Express and React, enabling instant reading and processing of uploaded PDF files."
    },
    {
      title: "Text Splitting & Preparation",
      desc: "Implemented logical, sentence-safe boundaries to split documents into readable sections, preventing cut-off sentences."
    },
    {
      title: "AI Embedding Database",
      desc: "Structured secure database lookup via deep text matching, keeping security credentials hidden on the backend."
    },
    {
      title: "Grounded Safe Answers",
      desc: "Designed query filters to make sure the assistant answers strictly based on the text of your document, preventing guesses."
    }
  ];

  return (
    <div className="flex-1 p-8 bg-[#0A0A0A] overflow-y-auto min-h-0" id="guide-view">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#222] pb-6">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">How to Use & System Overview</h2>
          <p className="text-[11px] text-[#00FF66] font-mono uppercase mt-1">
            Understand how your documents are stored in the cloud database and how the search functions.
          </p>
        </div>

        {/* 1. Interactive Diagram */}
        <div className="bg-[#111] border border-[#222] rounded-xs p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-[#00FF66]" />
            <h3 className="font-black text-white text-sm uppercase tracking-wider">Document Processing Steps</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 text-center select-none" id="rag-diagram">
            <div className="bg-black border border-[#222] p-4 rounded-xs">
              <span className="text-[9px] font-mono font-bold text-[#00FF66] block mb-1 uppercase tracking-widest">Step 1</span>
              <strong className="text-xs font-black text-white block uppercase">Upload PDF</strong>
              <span className="text-[9px] text-zinc-500 block font-mono mt-1 uppercase">Read document</span>
            </div>

            <div className="hidden md:flex justify-center text-zinc-600">
              <ArrowRight className="w-5 h-5 animate-pulse text-[#00FF66]" />
            </div>

            <div className="bg-black border border-[#222] p-4 rounded-xs">
              <span className="text-[9px] font-mono font-bold text-[#00FF66] block mb-1 uppercase tracking-widest">Step 2</span>
              <strong className="text-xs font-black text-white block uppercase">Prepare Text</strong>
              <span className="text-[9px] text-zinc-500 block font-mono mt-1 uppercase">Split to sections</span>
            </div>

            <div className="hidden md:flex justify-center text-zinc-600">
              <ArrowRight className="w-5 h-5 animate-pulse text-[#00FF66]" />
            </div>

            <div className="bg-black border border-[#222] p-4 rounded-xs">
              <span className="text-[9px] font-mono font-bold text-[#00FF66] block mb-1 uppercase tracking-widest">Step 3</span>
              <strong className="text-xs font-black text-white block uppercase">Save to Cloud</strong>
              <span className="text-[9px] text-zinc-500 block font-mono mt-1 uppercase">MongoDB Atlas</span>
            </div>
          </div>
        </div>

        {/* 2. MongoDB Atlas Search Index Setup */}
        <div className="bg-[#111] border border-[#222] rounded-xs p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-[#00FF66]" />
              <h3 className="font-black text-white text-sm uppercase tracking-wider">Production Integration: MongoDB Atlas Search Index</h3>
            </div>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#222] bg-black hover:bg-[#111] text-zinc-400 hover:text-white rounded-xs text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
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
            The application is connected to MongoDB Atlas. To activate high-speed Vector Search, open your MongoDB Atlas Console, navigate to your cluster, go to "Search Indexes", click "Create Search Index", select the JSON Editor, name the index "vector_index" on the "chunks" collection, and paste the configuration below:
          </p>

          <pre className="bg-black text-zinc-300 text-xs p-4.5 rounded-xs border border-[#222] overflow-x-auto max-h-72 font-mono leading-relaxed select-text text-left">
            {mongoIndexJSON}
          </pre>
        </div>

        {/* 3. Resume Points */}
        <div className="bg-[#111] border border-[#222] rounded-xs p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-[#00FF66]" />
            <h3 className="font-black text-white text-sm uppercase tracking-wider">Study Milestones</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resumePoints.map((point, i) => (
              <div key={i} className="bg-black border border-[#222] p-5 rounded-xs relative">
                <span className="absolute top-4 right-4 text-[9px] font-mono font-black text-zinc-600 tracking-widest uppercase">
                  SECTION {i + 1}
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
