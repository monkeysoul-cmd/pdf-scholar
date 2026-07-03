import fs from "fs";
import path from "path";

export interface DocumentMetadata {
  id: string;
  name: string;
  pageCount: number;
  chunkCount: number;
  uploadedAt: string;
  size: number;
}

export interface ChunkRecord {
  id: string;
  documentId: string;
  documentName: string;
  text: string;
  embedding: number[];
  pageIndex: number;
}

export interface LocalDBStructure {
  documents: DocumentMetadata[];
  chunks: ChunkRecord[];
}

const DB_FILE_PATH = path.join(process.cwd(), "local_db.json");

export class LocalVectorDB {
  private static ensureFile() {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initial: LocalDBStructure = { documents: [], chunks: [] };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
    }
  }

  public static get(): LocalDBStructure {
    this.ensureFile();
    try {
      const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(content) as LocalDBStructure;
    } catch (e) {
      console.error("Failed to read local DB file, resetting:", e);
      return { documents: [], chunks: [] };
    }
  }

  public static save(db: LocalDBStructure) {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write local DB file:", e);
    }
  }

  public static addDocument(doc: DocumentMetadata, chunks: Omit<ChunkRecord, "id">[]) {
    const db = this.get();
    
    // Remove existing if any (override)
    db.documents = db.documents.filter(d => d.id !== doc.id);
    db.chunks = db.chunks.filter(c => c.documentId !== doc.id);

    db.documents.push(doc);

    const chunkRecords: ChunkRecord[] = chunks.map((c, i) => ({
      ...c,
      id: `${doc.id}_chunk_${i}`
    }));

    db.chunks.push(...chunkRecords);
    this.save(db);
  }

  public static deleteDocument(docId: string) {
    const db = this.get();
    db.documents = db.documents.filter(d => d.id !== docId);
    db.chunks = db.chunks.filter(c => c.documentId !== docId);
    this.save(db);
  }

  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
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

  public static similaritySearch(
    queryEmbedding: number[],
    topK: number = 3,
    documentId?: string
  ): { chunk: Omit<ChunkRecord, "embedding">; score: number }[] {
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
