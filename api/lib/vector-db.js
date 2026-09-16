import { MongoClient } from "mongodb";

// Global singleton connections
let client = null;
let db = null;

// LRU Embedding Cache (query string -> Float32Array)
class LRUCache {
  constructor(maxSize = 300) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    // Refresh position
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

// In-Memory Document Vector & BM25 Store
class InMemoryDocStore {
  constructor() {
    // Map: `${userId}:${documentId}` -> { doc, chunks, floatVectors, bm25Index, avgDocLen, lastAccessed }
    this.stores = new Map();
    this.maxDocs = 50; // Keep up to 50 active documents in RAM
  }

  getKey(userId, documentId) {
    return `${userId || "anon"}:${documentId || "all"}`;
  }

  has(userId, documentId) {
    return this.stores.has(this.getKey(userId, documentId));
  }

  get(userId, documentId) {
    const key = this.getKey(userId, documentId);
    const store = this.stores.get(key);
    if (store) {
      store.lastAccessed = Date.now();
      return store;
    }
    return null;
  }

  set(userId, documentId, docData) {
    if (this.stores.size >= this.maxDocs) {
      // Evict least recently accessed document
      let oldestKey = null;
      let oldestTime = Infinity;
      for (const [k, v] of this.stores.entries()) {
        if (v.lastAccessed < oldestTime) {
          oldestTime = v.lastAccessed;
          oldestKey = k;
        }
      }
      if (oldestKey) this.stores.delete(oldestKey);
    }

    const key = this.getKey(userId, documentId);
    this.stores.set(key, {
      ...docData,
      lastAccessed: Date.now(),
    });
  }

  delete(userId, documentId) {
    const key = this.getKey(userId, documentId);
    this.stores.delete(key);
  }

  clearUser(userId) {
    for (const key of this.stores.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.stores.delete(key);
      }
    }
  }
}

// Global in-memory vector cache & query caches
const memoryDocStore = new InMemoryDocStore();
const queryEmbeddingCache = new LRUCache(500);
const queryResultCache = new LRUCache(200);

// Basic English stop words for BM25
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
  "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
  "during", "each", "few", "for", "from", "further", "had", "hadn't", "has",
  "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
  "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
  "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
  "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
  "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
  "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
  "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
  "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
  "they're", "they've", "this", "those", "through", "to", "too", "under", "until",
  "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
  "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves"
]);

/**
 * Tokenizes text into lowercase words, stripping non-alphanumeric chars and stop words.
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

/**
 * Builds BM25 Inverted Index from chunks
 */
function buildBM25Index(chunks) {
  const N = chunks.length;
  if (N === 0) return { invertedIndex: new Map(), docLengths: [], avgDocLen: 0 };

  const invertedIndex = new Map(); // term -> Map(chunkIndex, termFreq)
  const docLengths = new Array(N);
  let totalLength = 0;

  for (let i = 0; i < N; i++) {
    const tokens = tokenize(chunks[i].text);
    docLengths[i] = tokens.length;
    totalLength += tokens.length;

    for (const token of tokens) {
      if (!invertedIndex.has(token)) {
        invertedIndex.set(token, new Map());
      }
      const postings = invertedIndex.get(token);
      postings.set(i, (postings.get(i) || 0) + 1);
    }
  }

  const avgDocLen = totalLength / N || 1;
  return { invertedIndex, docLengths, avgDocLen };
}

/**
 * Score chunks using BM25 for a query string
 */
function scoreBM25(queryText, chunks, bm25Data, k1 = 1.2, b = 0.75) {
  const { invertedIndex, docLengths, avgDocLen } = bm25Data;
  const queryTokens = tokenize(queryText);
  const N = chunks.length;
  const scores = new Float32Array(N);

  if (queryTokens.length === 0 || N === 0) return scores;

  for (const token of queryTokens) {
    const postings = invertedIndex.get(token);
    if (!postings) continue;

    const n = postings.size; // Document frequency
    // Standard Lucene/BM25 IDF
    const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));

    for (const [chunkIdx, tf] of postings.entries()) {
      const docLen = docLengths[chunkIdx];
      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + b * (docLen / avgDocLen));
      scores[chunkIdx] += idf * (numerator / denominator);
    }
  }

  return scores;
}

/**
 * Normalize array to unit length (L2 norm) for fast dot product similarity
 */
function normalizeVector(vec) {
  const f32 = new Float32Array(vec);
  let norm = 0;
  for (let i = 0; i < f32.length; i++) {
    norm += f32[i] * f32[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    const inv = 1 / norm;
    for (let i = 0; i < f32.length; i++) {
      f32[i] *= inv;
    }
  }
  return f32;
}

/**
 * Compute dot product of two pre-normalized Float32Array vectors
 */
function fastDotProduct(a, b) {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

export class VectorDB {
  /**
   * Connect to MongoDB Atlas with resilient options
   */
  static async connect() {
    if (db && client) {
      try {
        await db.command({ ping: 1 });
        return db;
      } catch (e) {
        console.warn("MongoDB connection stale or dropped, reconnecting...", e.message);
        client = null;
        db = null;
      }
    }

    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL;
    if (!uri) {
      console.warn("MONGODB_URI is not set. Operating in in-memory fallback mode.");
      return null;
    }

    try {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        retryWrites: true,
      });
      await client.connect();
      db = client.db();
      console.log("Connected successfully to MongoDB Atlas Vector Store");
      return db;
    } catch (err) {
      client = null;
      db = null;
      console.warn(`MongoDB connection failed (${err.message}). VectorDB will operate with in-memory persistence.`);
      return null;
    }
  }

  static async getDb() {
    return await this.connect();
  }

  /**
   * Caching helper for query embeddings
   */
  static getCachedEmbedding(text) {
    return queryEmbeddingCache.get(text.trim().toLowerCase());
  }

  static setCachedEmbedding(text, embedding) {
    queryEmbeddingCache.set(text.trim().toLowerCase(), normalizeVector(embedding));
  }

  /**
   * Fetch documents and chunks for a user
   */
  static async get(userId) {
    const database = await this.getDb();
    if (!database) {
      return { documents: [], chunks: [] };
    }
    const documents = await database.collection("documents").find({ userId }).toArray();
    const chunks = await database.collection("chunks").find({ userId }).toArray();
    return { documents, chunks };
  }

  static async getDocument(docId, userId) {
    const database = await this.getDb();
    if (!database) return null;
    return await database.collection("documents").findOne({ id: docId, userId });
  }

  static async getDocumentChunks(docId, userId, limit = 0) {
    const database = await this.getDb();
    if (!database) return [];
    const query = { documentId: docId, userId };
    if (limit > 0) {
      return await database.collection("chunks").find(query).limit(limit).toArray();
    }
    return await database.collection("chunks").find(query).toArray();
  }

  /**
   * Add / overwrite a document and index its chunks into both In-Memory Vector Store and MongoDB Atlas
   */
  static async addDocument(doc, chunks, userId) {
    const docWithUser = { ...doc, userId };

    // 1. Prepare normalized Float32 vectors & BM25 index in RAM
    const normalizedChunks = chunks.map((c, i) => {
      const rawEmbedding = c.embedding || [];
      const normVec = normalizeVector(rawEmbedding);
      return {
        ...c,
        userId,
        id: c.id || `${doc.id}_chunk_${i}`,
        normalizedEmbedding: normVec,
      };
    });

    const bm25Data = buildBM25Index(normalizedChunks);

    // Store in active in-memory cache for instant zero-latency retrieval
    memoryDocStore.set(userId, doc.id, {
      doc: docWithUser,
      chunks: normalizedChunks,
      bm25Data,
    });

    // Invalidate query result cache
    queryResultCache.clear();

    // 2. Persist to MongoDB Atlas asynchronously or synchronously
    const database = await this.getDb();
    if (database) {
      try {
        await database.collection("documents").deleteOne({ id: doc.id, userId });
        await database.collection("chunks").deleteMany({ documentId: doc.id, userId });

        await database.collection("documents").insertOne(docWithUser);

        const chunkRecords = normalizedChunks.map(c => {
          // Remove internal Float32Array before persisting to Mongo, keep regular embedding array
          const { normalizedEmbedding, ...mongoRecord } = c;
          return mongoRecord;
        });

        if (chunkRecords.length > 0) {
          await database.collection("chunks").insertMany(chunkRecords);
        }
      } catch (err) {
        console.error("MongoDB Atlas persistence error:", err.message);
      }
    }
  }

  /**
   * Delete document from memory store and MongoDB Atlas
   */
  static async deleteDocument(docId, userId) {
    memoryDocStore.delete(userId, docId);
    queryResultCache.clear();

    const database = await this.getDb();
    if (database) {
      try {
        await database.collection("documents").deleteOne({ id: docId, userId });
        await database.collection("chunks").deleteMany({ documentId: docId, userId });
      } catch (err) {
        console.error("MongoDB Atlas delete error:", err.message);
      }
    }
  }

  /**
   * Ensure document is hydrated in memory from MongoDB
   */
  static async ensureDocHydrated(documentId, userId) {
    if (documentId && memoryDocStore.has(userId, documentId)) {
      return memoryDocStore.get(userId, documentId);
    }

    // Hydrate from MongoDB Atlas
    const database = await this.getDb();
    if (!database) return null;

    const query = { userId };
    if (documentId) query.documentId = documentId;

    const rawChunks = await database.collection("chunks").find(query).toArray();
    if (!rawChunks || rawChunks.length === 0) return null;

    const normalizedChunks = rawChunks.map(c => ({
      ...c,
      normalizedEmbedding: normalizeVector(c.embedding || []),
    }));

    const bm25Data = buildBM25Index(normalizedChunks);
    const storeData = {
      chunks: normalizedChunks,
      bm25Data,
    };

    if (documentId) {
      memoryDocStore.set(userId, documentId, storeData);
    }

    return storeData;
  }

  /**
   * Mathematical cosine similarity fallback
   */
  static cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Ultra-Fast Hybrid Similarity Search
   * Combines Dense Float32Array Cosine Similarity with Sparse BM25 via Reciprocal Rank Fusion (RRF).
   * Returns top matching chunks with confidence scores and telemetry.
   */
  static async similaritySearch(queryEmbedding, topK = 4, documentId, userId, options = {}) {
    const startTime = Date.now();
    const queryText = options.queryText || "";
    const denseWeight = options.denseWeight ?? 0.7;
    const sparseWeight = options.sparseWeight ?? 0.3;

    // Check query result cache
    const cacheKey = `${userId}:${documentId || "all"}:${queryText}`;
    if (queryText && queryResultCache.get(cacheKey)) {
      const cached = queryResultCache.get(cacheKey);
      return {
        ...cached,
        retrievalTimeMs: Math.max(1, Date.now() - startTime),
        cached: true,
      };
    }

    // Pre-normalize query embedding
    const normQueryVec = normalizeVector(queryEmbedding);

    // 1. Check in-memory store (0ms latency tier)
    let store = await this.ensureDocHydrated(documentId, userId);

    if (!store || !store.chunks || store.chunks.length === 0) {
      return {
        results: [],
        retrievalTimeMs: Date.now() - startTime,
        method: "empty",
      };
    }

    const { chunks, bm25Data } = store;
    const N = chunks.length;

    // 2. Compute Dense Vector Similarity (Float32Array Dot Product)
    const denseScores = new Array(N);
    for (let i = 0; i < N; i++) {
      const chunkVec = chunks[i].normalizedEmbedding;
      const sim = chunkVec ? fastDotProduct(normQueryVec, chunkVec) : 0;
      denseScores[i] = { index: i, score: sim };
    }

    // Sort dense rankings
    denseScores.sort((a, b) => b.score - a.score);

    // 3. Compute Sparse BM25 Scores if query text is available
    let bm25Scores = null;
    let sparseRankings = null;

    if (queryText && bm25Data) {
      bm25Scores = scoreBM25(queryText, chunks, bm25Data);
      sparseRankings = new Array(N);
      for (let i = 0; i < N; i++) {
        sparseRankings[i] = { index: i, score: bm25Scores[i] };
      }
      sparseRankings.sort((a, b) => b.score - a.score);
    }

    // 4. Reciprocal Rank Fusion (RRF)
    // RRF Score = (denseWeight / (k + denseRank)) + (sparseWeight / (k + sparseRank))
    const K_RRF = 60;
    const rrfScores = new Float32Array(N);

    // Assign dense rank contributions
    for (let rank = 0; rank < N; rank++) {
      const idx = denseScores[rank].index;
      rrfScores[idx] += denseWeight / (K_RRF + (rank + 1));
    }

    // Assign sparse rank contributions if BM25 was executed
    if (sparseRankings && bm25Scores) {
      for (let rank = 0; rank < N; rank++) {
        const idx = sparseRankings[rank].index;
        // Only give sparse credit if term actually matched
        if (sparseRankings[rank].score > 0) {
          rrfScores[idx] += sparseWeight / (K_RRF + (rank + 1));
        }
      }
    }

    // 5. Build final scored list
    const finalCandidates = [];
    for (let i = 0; i < N; i++) {
      const chunk = chunks[i];
      const { normalizedEmbedding, embedding, ...cleanChunk } = chunk;

      const denseSim = denseScores.find(d => d.index === i)?.score || 0;
      const bm25Sim = bm25Scores ? bm25Scores[i] : 0;
      const rrf = rrfScores[i];

      // Normalized confidence score (0 to 1)
      const confidenceScore = Math.min(1, Math.max(0, (denseSim * 0.75) + (bm25Sim > 0 ? 0.25 : 0)));

      finalCandidates.push({
        chunk: cleanChunk,
        score: confidenceScore,
        rawDenseScore: denseSim,
        bm25Score: bm25Sim,
        rrfScore: rrf,
      });
    }

    // Sort by RRF score descending
    finalCandidates.sort((a, b) => b.rrfScore - a.rrfScore);

    // Select topK
    const results = finalCandidates.slice(0, topK);

    const retrievalTimeMs = Math.max(1, Date.now() - startTime);
    const payload = {
      results,
      retrievalTimeMs,
      method: sparseRankings ? "Hybrid (Dense Vector + BM25 Lexical)" : "Dense Vector (Cosine)",
      count: results.length,
    };

    if (queryText) {
      queryResultCache.set(cacheKey, payload);
    }

    return payload;
  }
}

// Backward compatibility alias
export const LocalVectorDB = VectorDB;
