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

  static async get() {
    const database = await this.getDb();
    const documents = await database.collection("documents").find({}).toArray();
    const chunks = await database.collection("chunks").find({}).toArray();
    return { documents, chunks };
  }

  static async addDocument(doc, chunks) {
    const database = await this.getDb();
    
    // Remove existing if any (override)
    await database.collection("documents").deleteOne({ id: doc.id });
    await database.collection("chunks").deleteMany({ documentId: doc.id });

    await database.collection("documents").insertOne(doc);

    const chunkRecords = chunks.map((c, i) => ({
      ...c,
      id: `${doc.id}_chunk_${i}`
    }));

    if (chunkRecords.length > 0) {
      await database.collection("chunks").insertMany(chunkRecords);
    }
  }

  static async deleteDocument(docId) {
    const database = await this.getDb();
    await database.collection("documents").deleteOne({ id: docId });
    await database.collection("chunks").deleteMany({ documentId: docId });
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

  static async similaritySearch(queryEmbedding, topK = 3, documentId) {
    const database = await this.getDb();
    
    // Hybrid Vector Search approach:
    // 1. Try to use MongoDB Atlas Vector Search ($vectorSearch).
    // This requires a vector index named 'vector_index' on the 'chunks' collection.
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
      
      if (documentId) {
        pipeline.push({
          $match: { documentId }
        });
      }
      
      pipeline.push({
        $project: {
          embedding: 0, // Omit embedding
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
      console.warn("Atlas Vector Search failed or index 'vector_index' is not configured. Falling back to local in-memory cosine similarity... Error:", vectorSearchError.message || vectorSearchError);
    }
    
    // 2. Fallback: Fetch candidate chunks and calculate cosine similarity in-memory
    console.log("Running fallback local similarity search...");
    const query = documentId ? { documentId } : {};
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
