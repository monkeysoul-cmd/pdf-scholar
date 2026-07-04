import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "./lib/splitter.js";
import { LocalVectorDB } from "./lib/local-vector-db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request size limits for handling base64 PDFs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper: safe embedding generator
async function generateChunkEmbedding(text: string): Promise<number[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  const response = (await ai.models.embedContent({
    model: "gemini-embedding-2-preview",
    contents: text,
  })) as any;

  // Handles both single embedding object and plural embeddings array in standard/custom SDK builds
  const values = response.embedding?.values || (Array.isArray(response.embeddings) ? response.embeddings[0]?.values : undefined);

  if (!values) {
    throw new Error("Failed to retrieve embeddings from API.");
  }
  return values;
}

// API Routes
// 1. Get List of Ingested Documents
app.get("/api/documents", (req, res) => {
  try {
    const db = LocalVectorDB.get();
    res.json({ documents: db.documents });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch documents" });
  }
});

// 2. Delete Document
app.delete("/api/documents/:id", (req, res) => {
  try {
    const { id } = req.params;
    LocalVectorDB.deleteDocument(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete document" });
  }
});

// 3. Upload & Ingest PDF Document
app.post("/api/ingest", async (req, res) => {
  try {
    const { pdfBase64, filename, size } = req.body;
    if (!pdfBase64 || !filename) {
      res.status(400).json({ error: "Missing pdfBase64 or filename parameter." });
      return;
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(pdfBase64, "base64");

    // Parse PDF text and meta
    let text = "";
    let pageCount = 1;
    try {
      const parser = new PDFParse({ data: buffer });
      const parsedPdf = await parser.getText();
      text = parsedPdf.text || "";
      pageCount = parsedPdf.pages.length || parsedPdf.total || 1;
      await parser.destroy();
    } catch (parseErr: any) {
      console.error("PDF Parsing Error:", parseErr);
      res.status(400).json({ error: `Failed to parse PDF document. Ensure it's not corrupt or password-protected. Error: ${parseErr.message}` });
      return;
    }

    if (!text.trim()) {
      res.status(400).json({ error: "The uploaded PDF appears to have no extractable text." });
      return;
    }

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 200,
    });
    const rawChunks = splitter.splitText(text);

    if (rawChunks.length === 0) {
      res.status(400).json({ error: "Failed to split text into readable chunks." });
      return;
    }

    // Create Document ID and Metadata
    const docId = `doc_${Date.now()}`;
    const docMeta = {
      id: docId,
      name: filename,
      pageCount,
      chunkCount: rawChunks.length,
      uploadedAt: new Date().toISOString(),
      size: size || buffer.length,
    };

    // Generate Embeddings for Chunks (limit parallel embedding calls to prevent rate limiting)
    const chunkRecords = [];
    console.log(`Generating embeddings for ${rawChunks.length} chunks of document "${filename}"...`);

    for (let i = 0; i < rawChunks.length; i++) {
      const chunkText = rawChunks[i];
      try {
        const embedding = await generateChunkEmbedding(chunkText);
        // Estimate page index based on proportional text offset
        const pageIndex = Math.min(
          pageCount,
          Math.max(1, Math.ceil((i / rawChunks.length) * pageCount))
        );

        chunkRecords.push({
          documentId: docId,
          documentName: filename,
          text: chunkText,
          embedding,
          pageIndex,
        });
      } catch (embedError: any) {
        console.error(`Embedding failed at chunk ${i}:`, embedError);
        res.status(500).json({ error: `Embedding generation failed: ${embedError.message}` });
        return;
      }
    }

    // Save to Local DB
    LocalVectorDB.addDocument(docMeta, chunkRecords);

    res.json({
      success: true,
      document: docMeta,
    });
  } catch (error: any) {
    console.error("Ingestion Endpoint Error:", error);
    res.status(500).json({ error: error.message || "Internal server error during PDF ingestion." });
  }
});

// 4. RAG Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { documentId, message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Missing message parameter." });
      return;
    }

    // 1. Generate query embedding
    let queryEmbedding;
    try {
      queryEmbedding = await generateChunkEmbedding(message);
    } catch (embedError: any) {
      res.status(500).json({ error: `Embedding query failed: ${embedError.message}` });
      return;
    }

    // 2. Search local DB for similar chunks
    const searchResults = LocalVectorDB.similaritySearch(queryEmbedding, 3, documentId);

    if (searchResults.length === 0) {
      res.json({
        text: "I couldn't find any documents or chunks to base my answer on. Please upload a PDF first.",
        sources: [],
      });
      return;
    }

    // 3. Assemble document context
    const contextText = searchResults
      .map((r, i) => `[Source ${i + 1}] (Page ${r.chunk.pageIndex}):\n${r.chunk.text}`)
      .join("\n\n");

    const systemInstruction = `You are PDF Scholar, an advanced RAG academic assistant. You answer user questions strictly based on the provided PDF context excerpts.

If the provided context does not contain enough information to answer the question, or is completely unrelated, you MUST reply exactly with: "I'm sorry, but the provided document does not contain enough information to answer this question." Do not fabricate information, make up references, or use outside knowledge.

Be concise, clear, and perfectly grounded. Always cite your sources by mentioning source index (e.g., [Source 1], [Source 2]) where appropriate.

Here is the Ground-Truth Document Context:
${contextText}`;

// 4. Format chat history for Gemini
    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.text }],
    }));

    // 5. Query Gemini 3.5 Flash (default model for basic text/summarization tasks as per skill)
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] },
      ],
      config: {
        systemInstruction,
        temperature: 0.1, // low temperature for strict factual grounding
      },
    });

    res.json({
      text: response.text || "No response received from model.",
      sources: searchResults,
    });
  } catch (error: any) {
    console.error("Chat Endpoint Error:", error);
    res.status(500).json({ error: error.message || "Internal server error during chat." });
  }
});

// 5. Generate Interactive Quiz Endpoint
app.post("/api/quiz", async (req, res) => {
  try {
    const { documentId, count = 5 } = req.body;
    if (!documentId) {
      res.status(400).json({ error: "Missing documentId parameter." });
      return;
    }

    // Load document chunks
    const db = LocalVectorDB.get();
    const doc = db.documents.find(d => d.id === documentId);
    if (!doc) {
      res.status(404).json({ error: "Document not found." });
      return;
    }

    const docChunks = db.chunks.filter(c => c.documentId === documentId);
    if (docChunks.length === 0) {
      res.status(400).json({ error: "No chunks found for this document." });
      return;
    }

    // Join a representative subset of chunks (e.g., first 6 chunks) to keep token size reasonable but comprehensive
    const contentSample = docChunks
      .slice(0, 10)
      .map(c => c.text)
      .join("\n\n");

    const prompt = `Based strictly on the following excerpt from the document "${doc.name}", generate an interactive quiz of exactly ${count} questions.
Include a mix of multiple-choice (with 4 options) and short-answer questions.
For multiple-choice: provide an options array, the correctAnswer (which MUST match one of the options exactly), and an explanation.
For short-answer: leave options empty, provide the correctAnswer as the key criteria/rubric, and an explanation of the concept.

Document Excerpt:
${contentSample}`;

    const quizResponseSchema = {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "A unique sequential ID, e.g. q1, q2" },
              type: { type: Type.STRING, description: "Must be exactly 'multiple-choice' or 'short-answer'" },
              question: { type: Type.STRING, description: "The quiz question text." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 4 options for multiple-choice. Keep empty for short-answer."
              },
              correctAnswer: { type: Type.STRING, description: "For multiple-choice, the exact correct option string. For short-answer, a concise list of key terms/rubric that should be in the answer." },
              explanation: { type: Type.STRING, description: "Detailed explanation of why this is correct, referencing the content." }
            },
            required: ["id", "type", "question", "correctAnswer", "explanation"]
          }
        }
      },
      required: ["questions"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizResponseSchema,
        temperature: 0.3,
      },
    });

    const quizData = JSON.parse(response.text || '{"questions":[]}');
    res.json(quizData);
  } catch (error: any) {
    console.error("Quiz Endpoint Error:", error);
    res.status(500).json({ error: error.message || "Internal server error during quiz generation." });
  }
});

// Vite Middleware & Static Asset Serving Setup
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PDF Scholar Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

start();
