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
import { VectorDB, LocalVectorDB } from "./lib/vector-db.js";
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

// Middleware to normalize URL paths if rewritten
app.use((req, res, next) => {
  if (req.url.startsWith("/api/index.js")) {
    req.url = req.url.replace("/api/index.js", "/api");
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

// Helper: safe embedding generator with model fallbacks & cache
async function generateChunkEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing in Vercel deployment settings.");
  }

  // Check in-memory query embedding cache (0ms instant retrieval)
  const cached = VectorDB.getCachedEmbedding(text);
  if (cached) return Array.from(cached);

  const ai = getAIClient();
  const embeddingModels = ["gemini-embedding-2-preview", "gemini-embedding-2", "gemini-embedding-001"];
  let lastErr = null;

  for (const model of embeddingModels) {
    try {
      const response = await ai.models.embedContent({
        model,
        contents: text,
      });

      const values = response.embedding?.values || 
                     (Array.isArray(response.embeddings) && response.embeddings[0]?.values ? response.embeddings[0].values : undefined);
      if (values && values.length > 0) {
        VectorDB.setCachedEmbedding(text, values);
        return values;
      }
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error("Failed to retrieve embeddings from Gemini API.");
}

// Helper: safe content generator with fallback models (fastest first: gemini-flash-lite-latest)
async function generateContentWithFallback(params, initialModel = "gemini-flash-lite-latest") {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing in Vercel deployment settings.");
  }

  const ai = getAIClient();
  const models = [
    initialModel,
    "gemini-flash-lite-latest",
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-flash-latest"
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

// Helper: safe streaming content generator with fallback models
async function generateContentStreamWithFallback(params, initialModel = "gemini-flash-lite-latest") {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing in Vercel deployment settings.");
  }

  const ai = getAIClient();
  const models = [
    initialModel,
    "gemini-flash-lite-latest",
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-flash-latest"
  ];
  const uniqueModels = [...new Set(models)];

  let lastError = null;

  for (const model of uniqueModels) {
    try {
      console.log(`Attempting content stream using model: ${model}...`);
      const stream = await ai.models.generateContentStream({
        ...params,
        model,
      });
      console.log(`Successfully opened stream with model: ${model}`);
      return stream;
    } catch (error) {
      lastError = error;
      console.warn(`Model stream ${model} failed: ${error.message || error}. Trying next fallback...`);
    }
  }

  throw lastError || new Error("All fallback streaming models failed.");
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

    // Parse PDF text and meta with page-aware extraction
    let text = "";
    let pageCount = 1;
    let extractedPages = [];
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
        const pageTextList = [];
        const options = {
          pagerender: function (pageData) {
            return pageData.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false })
              .then(function (textContent) {
                let lastY, pageText = "";
                for (let item of textContent.items) {
                  if (lastY === item.transform[5] || !lastY) {
                    pageText += item.str;
                  } else {
                    pageText += "\n" + item.str;
                  }
                  lastY = item.transform[5];
                }
                pageTextList.push({
                  pageIndex: pageData.pageIndex + 1,
                  text: pageText,
                });
                return pageText;
              });
          }
        };

        let parsed;
        try {
          parsed = await pdf(buffer, options);
        } catch (renderErr) {
          console.warn("Custom page rendering fallback:", renderErr.message);
          parsed = await pdf(buffer);
        }

        text = parsed.text || "";
        pageCount = parsed.numpages || pageTextList.length || 1;
        extractedPages = pageTextList.sort((a, b) => a.pageIndex - b.pageIndex);
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

    // Split text into chunks using page-aware splitting
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 150,
    });

    let rawChunksWithPages = [];
    if (extractedPages.length > 0) {
      rawChunksWithPages = splitter.splitPages(extractedPages);
    }

    // Graceful fallback if page extraction yielded no items
    if (rawChunksWithPages.length === 0) {
      const plainChunks = splitter.splitText(text);
      rawChunksWithPages = plainChunks.map((chunkText, idx) => ({
        text: chunkText,
        pageIndex: Math.min(pageCount, Math.max(1, Math.ceil((idx / plainChunks.length) * pageCount)))
      }));
    }

    if (rawChunksWithPages.length === 0) {
      res.status(400).json({ error: "Failed to split text into readable chunks." });
      return;
    }

    // Create Document ID and Metadata
    const docId = `doc_${Date.now()}`;
    const docMeta = {
      id: docId,
      name: filename,
      pageCount,
      chunkCount: rawChunksWithPages.length,
      uploadedAt: new Date().toISOString(),
      size: size || buffer.length,
    };

    const chunkRecords = [];
    console.log(`Generating embeddings for ${rawChunksWithPages.length} chunks of document "${filename}"...`);

    // Process chunk embeddings with concurrency batching
    const BATCH_SIZE = 8;
    for (let i = 0; i < rawChunksWithPages.length; i += BATCH_SIZE) {
      const batch = rawChunksWithPages.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (item, batchIdx) => {
          const actualIndex = i + batchIdx;
          const embedding = await generateChunkEmbedding(item.text);
          return {
            documentId: docId,
            documentName: filename,
            text: item.text,
            embedding,
            pageIndex: item.pageIndex,
          };
        })
      );
      chunkRecords.push(...batchResults);
    }

    // Save to Vector DB (In-Memory Index + MongoDB Atlas)
    await VectorDB.addDocument(docMeta, chunkRecords, req.user.id);

    res.json({
      success: true,
      document: docMeta,
    });
  } catch (error) {
    console.error("Ingestion Endpoint Error:", error);
    res.status(500).json({ error: error.message || "Internal server error during PDF ingestion." });
  }
});

// 4. RAG Chat Endpoint (with Hybrid Vector Retrieval & Fast Streaming)
app.post("/api/chat", authenticateToken, async (req, res) => {
  try {
    const { documentId, message, history, stream: shouldStream } = req.body;
    if (!message) {
      res.status(400).json({ error: "Missing message parameter." });
      return;
    }

    // 1. Generate query embedding (cached if repeated)
    let queryEmbedding;
    try {
      queryEmbedding = await generateChunkEmbedding(message);
    } catch (embedError) {
      res.status(500).json({ error: `Embedding query failed: ${embedError.message}` });
      return;
    }

    // 2. High-Performance Hybrid Similarity Search (Dense Vector + BM25 Lexical)
    const searchResult = await VectorDB.similaritySearch(
      queryEmbedding,
      4,
      documentId,
      req.user.id,
      { queryText: message }
    );
    const searchResults = searchResult.results || [];
    const retrievalTimeMs = searchResult.retrievalTimeMs || 1;
    const retrievalMethod = searchResult.method || "Hybrid Vector Search";

    // Check if client requested streaming
    const isStream = shouldStream === true || req.headers.accept?.includes("text/event-stream");

    if (searchResults.length === 0) {
      const emptyMsg = "I couldn't find any documents or chunks to base my answer on. Please upload a PDF first.";
      if (isStream) {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        });
        res.write(`data: ${JSON.stringify({ type: "sources", sources: [], retrievalTimeMs, retrievalMethod })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: "token", text: emptyMsg })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();
        return;
      }
      res.json({
        text: emptyMsg,
        sources: [],
        retrievalTimeMs,
        retrievalMethod,
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

    // 5. Handle streaming vs non-streaming responses
    if (isStream) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      });

      // Send matching source citations with retrieval telemetry immediately!
      res.write(`data: ${JSON.stringify({
        type: "sources",
        sources: searchResults,
        retrievalTimeMs,
        retrievalMethod,
      })}\n\n`);

      try {
        const stream = await generateContentStreamWithFallback({
          contents: [
            ...formattedHistory,
            { role: "user", parts: [{ text: message }] },
          ],
          config: {
            systemInstruction,
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }, "gemini-flash-lite-latest");

        for await (const chunk of stream) {
          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ type: "token", text: chunk.text })}\n\n`);
          }
        }

        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();
        return;
      } catch (streamErr) {
        console.error("Chat streaming error:", streamErr);
        res.write(`data: ${JSON.stringify({ type: "error", error: streamErr.message || "Error generating response." })}\n\n`);
        res.end();
        return;
      }
    }

    // Non-streaming fallback path (high-speed gemini-flash-lite-latest)
    const response = await generateContentWithFallback({
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] },
      ],
      config: {
        systemInstruction,
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    }, "gemini-flash-lite-latest");

    const replyText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from model.";
    res.json({
      text: replyText,
      sources: searchResults,
      retrievalTimeMs,
      retrievalMethod,
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

    const questionCount = Math.min(20, Math.max(1, parseInt(count) || 5));

    // Load document & chunks efficiently
    const doc = await LocalVectorDB.getDocument(documentId, req.user.id);
    if (!doc) {
      res.status(404).json({ error: "Document not found." });
      return;
    }

    const docChunks = await LocalVectorDB.getDocumentChunks(documentId, req.user.id, 20);
    if (!docChunks || docChunks.length === 0) {
      res.status(400).json({ error: "No chunks found for this document." });
      return;
    }

    // Join chunks to cover context for questions
    const contentSample = docChunks
      .map(c => c.text)
      .join("\n\n");

    const prompt = `Based strictly on the following excerpt from the document "${doc.name}", generate an interactive quiz of exactly ${questionCount} questions.
Include a mix of multiple-choice (with 4 options) and short-answer questions.
Assign point values: 10 points for multiple-choice questions, and 15 points for short-answer questions.
For multiple-choice: provide an options array, the correctAnswer (which MUST match one of the options exactly), points (10), and an explanation.
For short-answer: leave options empty, provide the correctAnswer as the key criteria/rubric, points (15), and an explanation of the concept.

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
              points: { type: Type.INTEGER, description: "Points value for this question (10 for multiple choice, 15 for short answer)" },
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

    let rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '{"questions":[]}';
    rawText = rawText.trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    }
    const quizData = JSON.parse(rawText);
    res.json(quizData);
  } catch (error) {
    console.error("Quiz Endpoint Error:", error);
    res.status(500).json({ error: error.message || "Internal server error during quiz generation." });
  }
});

// 404 handler for unmatched API routes — always returns JSON for /api/*
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.path} not found.` });
});
app.all("/api", (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.path} not found.` });
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
    } catch (viteErr) {
      console.warn("Vite dev server middleware could not be loaded:", viteErr.message);
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global 404 handler for any other unhandled routes
  app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
  });

  return new Promise((resolve) => {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`PDF Scholar Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
      resolve(server);
    });
  });
}

app.ready = start();

export default app;
