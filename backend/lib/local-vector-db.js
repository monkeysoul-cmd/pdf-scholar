import fs from "fs";
import path from "path";

const DB_FILE_PATH = path.join(process.cwd(), "local_db.json");

export class LocalVectorDB {
  static ensureFile() {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initial = { documents: [], chunks: [] };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
    }
  }

  static get() {
    this.ensureFile();
    try {
      const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to read local DB file, resetting:", e);
      return { documents: [], chunks: [] };
    }
  }

  static save(db) {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write local DB file:", e);
    }
  }

  static addDocument(doc, chunks) {
    const db = this.get();
    
    // Remove existing if any (override)
    db.documents = db.documents.filter(d => d.id !== doc.id);
    db.chunks = db.chunks.filter(c => c.documentId !== doc.id);

    db.documents.push(doc);

    const chunkRecords = chunks.map((c, i) => ({
      ...c,
      id: `${doc.id}_chunk_${i}`
    }));

    db.chunks.push(...chunkRecords);
    this.save(db);
  }

  static deleteDocument(docId) {
    const db = this.get();
    db.documents = db.documents.filter(d => d.id !== docId);
    db.chunks = db.chunks.filter(c => c.documentId !== docId);
    this.save(db);
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

  static similaritySearch(queryEmbedding, topK = 3, documentId) {
    const db = this.get();
    let candidateChunks = db.chunks;

    if (documentId) {
      candidateChunks = candidateChunks.filter(c => c.documentId === documentId);
    }

    const scored = candidateChunks.map(chunk => {
      const score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      // Omit embedding to save network bandwidth and state sizes
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
