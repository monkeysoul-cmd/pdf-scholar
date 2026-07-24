import { MongoClient } from "mongodb";

let client = null;
let db = null;

export class LocalVectorDB {
  static async connect() {
    if (db) return db;
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is missing.");
    }
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log("Connected successfully to MongoDB Atlas");
    return db;
  }

  static async getDb() {
    if (!db) {
      await this.connect();
    }
    return db;
  }

  static async get(userId) {
    const database = await this.getDb();
    const documents = await database.collection("documents").find({ userId }).toArray();
    const chunks = await database.collection("chunks").find({ userId }).toArray();
    return { documents, chunks };
  }

  static async addDocument(doc, chunks, userId) {
    const database = await this.getDb();
    
    // Tag doc with owner's user ID
    const docWithUser = { ...doc, userId };

    // Remove existing if any (override)
    await database.collection("documents").deleteOne({ id: doc.id, userId });
    await database.collection("chunks").deleteMany({ documentId: doc.id, userId });

    await database.collection("documents").insertOne(docWithUser);

    const chunkRecords = chunks.map((c, i) => ({
      ...c,
      userId,
      id: `${doc.id}_chunk_${i}`
    }));

    if (chunkRecords.length > 0) {
      await database.collection("chunks").insertMany(chunkRecords);
    }
  }

  static async deleteDocument(docId, userId) {
    const database = await this.getDb();
    await database.collection("documents").deleteOne({ id: docId, userId });
    await database.collection("chunks").deleteMany({ documentId: docId, userId });
  }

  static cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    
    if (vecA.length !== vecB.length) {
      return 0; // Dimension mismatch
    }

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  static async similaritySearch(queryEmbedding, topK = 3, documentId, userId) {
    const database = await this.getDb();
    
    // Hybrid Vector Search approach:
    // 1. Try to use MongoDB Atlas Vector Search ($vectorSearch).
    try {
      console.log("Attempting MongoDB Atlas Vector Search...");
      const vectorSearchStage = {
        index: "vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: topK * 3 // Pull a few more for matching/filtering
      };
      
      const pipeline = [
        { $vectorSearch: vectorSearchStage }
      ];
      
      const matchFilter = { userId };
      if (documentId) {
        matchFilter.documentId = documentId;
      }
      pipeline.push({ $match: matchFilter });
      
      pipeline.push({
        $project: {
          embedding: 0,
          score: { $meta: "vectorSearchScore" }
        }
      });
      
      pipeline.push({
        $limit: topK
      });
      
      const results = await database.collection("chunks").aggregate(pipeline).toArray();
      
      if (results && results.length > 0) {
        console.log(`Atlas Vector Search succeeded returning ${results.length} chunks.`);
        return results.map(r => {
          const { score, ...chunk } = r;
          return { chunk, score };
        });
      }
    } catch (vectorSearchError) {
      console.warn("Atlas Vector Search failed or index not configured. Falling back to local cosine similarity...");
    }
    
    // 2. Fallback: Fetch candidate chunks and calculate cosine similarity in-memory
    console.log("Running fallback local similarity search...");
    const query = { userId };
    if (documentId) {
      query.documentId = documentId;
    }
    const candidateChunks = await database.collection("chunks").find(query).toArray();

    const scored = candidateChunks.map(chunk => {
      const score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      const { embedding, ...chunkWithoutEmbedding } = chunk;
      return {
        chunk: chunkWithoutEmbedding,
        score
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
  }
}
