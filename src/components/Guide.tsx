import React, { useState } from "react";
import {
  HelpCircle,
  Database,
  Layers,
  Cpu,
  ArrowRight,
  Clipboard,
  Check,
  Award,
  ExternalLink,
  BookOpen
} from "lucide-react";

export default function Guide() {
  const [copied, setCopied] = useState(false);

  const supabaseSQL = `-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table for metadata
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  page_count INT NOT NULL,
  chunk_count INT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  size INT NOT NULL
);

-- Create the document chunks table with pgvector column
CREATE TABLE IF NOT EXISTS document_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  embedding vector(768), -- Dimension size of gemini-embedding-2-preview
  page_index INT NOT NULL
);

-- Create an HNSW index for high-speed similarity search
CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- Create the similarity search function for RAG lookups
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(768),
  match_threshold FLOAT,
  match_count INT,
  filter_document_id TEXT
)
RETURNS TABLE (
  id TEXT,
  document_id TEXT,
  text TEXT,
  page_index INT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.text,
    dc.page_index,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.document_id = filter_document_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(supabaseSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resumePoints = [
    {
      title: "Full-Stack TypeScript RAG Pipeline",
      desc: "Architected a full-stack Retrieval-Augmented Generation (RAG) educational suite utilizing Express, React, and TypeScript, enabling instant processing of multi-page academic papers."
    },
    {
      title: "Recursive Splitter & Semantic Chunking",
      desc: "Authored custom RecursiveCharacterTextSplitter for logical, boundary-safe structural chunking (800-char sizes with 200-char overlaps) to prevent content fragmentation."
    },
    {
      title: "Gemini Vector Embedding Matrices",
      desc: "Engineered deep vector lookups on the server via gemini-embedding-2-preview (768-dimensions), keeping secret keys completely secure and away from client-side bundles."
    },
    {
      title: "Deterministic Grounding Guardrails",
      desc: "Designed low-temperature generative prompting with Gemini 3.5 Flash to enforce strict factual grounding, introducing auto-activated guardrails that safely block hallucinations."
    }
  ];

  return (
    <div className="flex-1 p-8 bg-[#0A0A0A] overflow-y-auto" id="guide-view">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#222] pb-6">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">Guide & Setup Instructions</h2>
          <p className="text-[11px] text-[#00FF66] font-mono uppercase mt-1">
            Understand the architectural layout of this RAG pipeline and learn how to scale it to production databases.
          </p>
        </div>

        {/* 1. Interactive Diagram */}
        <div className="bg-[#111] border border-[#222] rounded-xs p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-[#00FF66]" />
            <h3 className="font-black text-white text-sm uppercase tracking-wider">Core RAG Dataflow Pipeline</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 text-center select-none" id="rag-diagram">
            <div className="bg-black border border-[#222] p-4 rounded-xs">
              <span className="text-[9px] font-mono font-bold text-[#00FF66] block mb-1 uppercase tracking-widest">Step 1</span>
              <strong className="text-xs font-black text-white block uppercase">Academic PDF</strong>
              <span className="text-[9px] text-zinc-500 block font-mono mt-1 uppercase">Buffer decode</span>
            </div>

            <div className="hidden md:flex justify-center text-zinc-600">
              <ArrowRight className="w-5 h-5 animate-pulse text-[#00FF66]" />
            </div>

            <div className="bg-black border border-[#222] p-4 rounded-xs">
              <span className="text-[9px] font-mono font-bold text-[#00FF66] block mb-1 uppercase tracking-widest">Step 2</span>
              <strong className="text-xs font-black text-white block uppercase">Recursive split</strong>
              <span className="text-[9px] text-zinc-500 block font-mono mt-1 uppercase">800/200 Overlaps</span>
            </div>

            <div className="hidden md:flex justify-center text-zinc-600">
              <ArrowRight className="w-5 h-5 animate-pulse text-[#00FF66]" />
            </div>

            <div className="bg-black border border-[#222] p-4 rounded-xs">
              <span className="text-[9px] font-mono font-bold text-[#00FF66] block mb-1 uppercase tracking-widest">Step 3</span>
              <strong className="text-xs font-black text-white block uppercase">Gemini Embed</strong>
              <span className="text-[9px] text-zinc-500 block font-mono mt-1 uppercase">768 Dim Vector</span>
            </div>
          </div>
        </div>

        {/* 2. Supabase pgvector Setup */}
        <div className="bg-[#111] border border-[#222] rounded-xs p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#00FF66]" />
              <h3 className="font-black text-white text-sm uppercase tracking-wider">Production Migration: Supabase pgvector</h3>
            </div>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#222] bg-black hover:bg-[#111] text-zinc-400 hover:text-white rounded-xs text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00FF66]" />
                  <span className="text-[#00FF66]">Copied SQL!</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 font-mono uppercase leading-relaxed">
            The application is configured to run out-of-the-box using an autonomous local JSON file. To scale this system to production, execute the following script inside the Supabase SQL Editor and declare your database credentials in your env.
          </p>

          <pre className="bg-black text-zinc-300 text-xs p-4.5 rounded-xs border border-[#222] overflow-x-auto max-h-72 font-mono leading-relaxed select-text">
            {supabaseSQL}
          </pre>
        </div>

        {/* 3. Resume Points */}
        <div className="bg-[#111] border border-[#222] rounded-xs p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-[#00FF66]" />
            <h3 className="font-black text-white text-sm uppercase tracking-wider">Resume Talking Points & Metrics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resumePoints.map((point, i) => (
              <div key={i} className="bg-black border border-[#222] p-5 rounded-xs relative">
                <span className="absolute top-4 right-4 text-[9px] font-mono font-black text-zinc-600 tracking-widest uppercase">
                  METRIC {i + 1}
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
