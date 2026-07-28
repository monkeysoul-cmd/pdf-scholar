// Global polyfills for PDF parsing in Node.js / Serverless environments
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor(init) {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      if (Array.isArray(init) && init.length >= 6) {
        this.a = init[0]; this.b = init[1]; this.c = init[2];
        this.d = init[3]; this.e = init[4]; this.f = init[5];
      }
    }
    multiply() { return this; }
    translate() { return this; }
    scale() { return this; }
    rotate() { return this; }
    inverse() { return this; }
  };
}
if (typeof globalThis.DOMPoint === "undefined") {
  globalThis.DOMPoint = class DOMPoint {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x; this.y = y; this.z = z; this.w = w;
    }
  };
}

import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { RecursiveCharacterTextSplitter } from "./lib/splitter.js";
import { LocalVectorDB } from "./lib/local-vector-db.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secure-pdf-scholar-hub-secret-key-12345";

// CORS Middleware for Vercel / cross-origin requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Middleware to normalize URL paths for Vercel Serverless Function rewrites
app.use((req, res, next) => {
  if (req.url.startsWith("/api/index.js")) {
    req.url = req.url.replace("/api/index.js", "/api");
  }
  if (!req.url.startsWith("/api") && !req.path.startsWith("/api")) {
    req.url = "/api" + (req.url.startsWith("/") ? "" : "/") + req.url;
  }
  next();
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is missing." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
}

// Increase request size limits for handling base64 PDFs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper: safe AI client getter
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || "dummy-key-for-initialization",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper: safe embedding generator with model fallbacks
async function generateChunkEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing in Vercel deployment settings.");
  }

  const ai = getAIClient();
  const embeddingModels = ["gemini-embedding-2-preview", "text-embedding-004", "embedding-001"];
  let lastErr = null;

  for (const model of embeddingModels) {
    try {
      const response = await ai.models.embedContent({
        model,
        contents: text,
      });

      const values = response.embedding?.values || (Array.isArray(response.embeddings) ? response.embeddings[0]?.values : undefined);
      if (values) return values;
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error("Failed to retrieve embeddings from Gemini API.");
}

// Helper: safe content generator with fallback models
async function generateContentWithFallback(params, initialModel = "gemini-2.5-flash") {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing in Vercel deployment settings.");
  }

  const ai = getAIClient();
  const models = [
    initialModel,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ];
  const uniqueModels = [...new Set(models)];

  let lastError = null;

  for (const model of uniqueModels) {
    try {
      console.log(`Attempting content generation using model: ${model}...`);
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      console.log(`Successfully generated content using model: ${model}`);
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`Model ${model} failed: ${error.message || error}. Trying next fallback...`);
    }
  }

  throw lastError || new Error("All fallback models failed.");
}

// Authentication Routes
// 1. User Registration
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const database = await LocalVectorDB.getDb();
    
    // Check if user already exists
    const existingUser = await database.collection("users").findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await database.collection("users").insertOne({
      username: username.toLowerCase(),
      passwordHash,
      createdAt: new Date()
    });

    res.json({ success: true, message: "Registration successful! Please login." });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: error.message || "Internal registration error." });
  }
});

// 2. User Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const database = await LocalVectorDB.getDb();
    const user = await database.collection("users").findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign({ id: user._id.toString(), username: user.username }, JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        username: user.username
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: error.message || "Internal login error." });
  }
});

// API Routes
// 1. Get List of Ingested Documents
app.get("/api/documents", authenticateToken, async (req, res) => {
  try {
    const db = await LocalVectorDB.get(req.user.id);
    res.json({ documents: db.documents });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch documents" });
  }
});

// 2. Delete Document
app.delete("/api/documents/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await LocalVectorDB.deleteDocument(id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete document" });
  }
});

// 3. Upload & Ingest PDF Document
app.post("/api/ingest", authenticateToken, async (req, res) => {
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
      let pdf;
      try {
        const pdfLib = await import("pdf-parse/lib/pdf-parse.js");
        pdf = pdfLib.default || pdfLib;
      } catch {
        const pdfModule = await import("pdf-parse");
        pdf = pdfModule.default || pdfModule;
      }

      if (typeof pdf === "function") {
        const parsed = await pdf(buffer);
        text = parsed.text || "";
        pageCount = parsed.numpages || 1;
      } else if (pdf && pdf.PDFParse) {
        const parser = new pdf.PDFParse({ data: buffer });
        const parsedPdf = await parser.getText();
        text = parsedPdf.text || "";
        pageCount = parsedPdf.pages?.length || parsedPdf.total || 1;
        if (typeof parser.destroy === "function") await parser.destroy();
      } else {
        throw new Error("Unrecognized pdf-parse export format.");
      }
    } catch (parseErr) {
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

    const chunkRecords = [];
    console.log(`Generating embeddings for ${rawChunks.length} chunks of document "${filename}"...`);

    // Process chunk embeddings in parallel batches of 5 to avoid timeouts
    const BATCH_SIZE = 5;
    for (let i = 0; i < rawChunks.length; i += BATCH_SIZE) {
      const batch = rawChunks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (chunkText, batchIdx) => {
          const actualIndex = i + batchIdx;
          const embedding = await generateChunkEmbedding(chunkText);
          const pageIndex = Math.min(
            pageCount,
            Math.max(1, Math.ceil((actualIndex / rawChunks.length) * pageCount))
          );
          return {
            documentId: docId,
            documentName: filename,
            text: chunkText,
            embedding,
            pageIndex,
          };
        })
      );
      chunkRecords.push(...batchResults);
    }

    // Save to Local DB
    await LocalVectorDB.addDocument(docMeta, chunkRecords, req.user.id);

    res.json({
      success: true,
      document: docMeta,
    });
  } catch (error) {
    console.error("Ingestion Endpoint Error:", error);
    res.status(500).json({ error: error.message || "Internal server error during PDF ingestion." });
  }
});

// 4. RAG Chat Endpoint
app.post("/api/chat", authenticateToken, async (req, res) => {
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
    } catch (embedError) {
      res.status(500).json({ error: `Embedding query failed: ${embedError.message}` });
      return;
    }

    // 2. Search local DB for similar chunks
    const searchResults = await LocalVectorDB.similaritySearch(queryEmbedding, 3, documentId, req.user.id);

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
    const formattedHistory = (history || []).map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.text }],
    }));

    // 5. Query Gemini with fallback support
    const response = await generateContentWithFallback({
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
  } catch (error) {
    console.error("Chat Endpoint Error:", error);
    res.status(500).json({ error: error.message || "Internal server error during chat." });
  }
});

// 5. Generate Interactive Quiz Endpoint
app.post("/api/quiz", authenticateToken, async (req, res) => {
  try {
    const { documentId, count = 5 } = req.body;
    if (!documentId) {
      res.status(400).json({ error: "Missing documentId parameter." });
      return;
    }

    // Load document chunks
    const db = await LocalVectorDB.get(req.user.id);
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

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizResponseSchema,
        temperature: 0.3,
      },
    });

    const quizData = JSON.parse(response.text || '{"questions":[]}');
    res.json(quizData);
  } catch (error) {
    console.error("Quiz Endpoint Error:", error);
    res.status(500).json({ error: error.message || "Internal server error during quiz generation." });
  }
});

// Global 404 handler — always returns JSON
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// Global error handler — always returns JSON (never HTML)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: err.message || "Internal server error." });
});

// Vite Middleware & Static Asset Serving Setup
async function start() {
  if (!process.env.MONGODB_URI) {
    console.warn("WARNING: MONGODB_URI is not set. Database requests will fail.");
  }
  if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set. AI features will be unavailable.");
  }

  // Only skip app.listen if executing as a serverless handler without process.env.PORT
  if (process.env.VERCEL && !process.env.PORT) {
    return;
  }

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch {
      // Ignore if Vite dev server isn't available
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PDF Scholar Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

start();

export default app;
