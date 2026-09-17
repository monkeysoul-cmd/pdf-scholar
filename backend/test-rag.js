import { VectorDB } from "./lib/vector-db.js";
import { RecursiveCharacterTextSplitter } from "./lib/splitter.js";

async function runTests() {
  console.log("=== RAG & Vector Database Test Suite ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // Test 1: Page-Aware Chunking
  console.log("\n1. Testing Page-Aware PDF Splitter...");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 20,
  });

  const mockPages = [
    { pageIndex: 1, text: "Introduction to Artificial Intelligence and Machine Learning. Neural networks learn representations." },
    { pageIndex: 2, text: "Retrieval Augmented Generation combines vector search with language models for grounding." },
    { pageIndex: 3, text: "Vector databases store high-dimensional embeddings and compute cosine similarity efficiently." }
  ];

  const chunks = splitter.splitPages(mockPages);
  assert(chunks.length >= 3, `Generated ${chunks.length} chunks from 3 pages.`);
  assert(chunks[0].pageIndex === 1, `Chunk 1 correctly attributed to Page 1.`);
  assert(chunks[1].pageIndex === 2, `Chunk 2 correctly attributed to Page 2.`);
  assert(chunks[2].pageIndex === 3, `Chunk 3 correctly attributed to Page 3.`);

  // Test 2: Embedding LRU Cache
  console.log("\n2. Testing LRU Embedding Cache...");
  const sampleQuery = "What is Retrieval Augmented Generation?";
  const sampleVector = [0.1, 0.2, 0.3, 0.4, 0.5];
  VectorDB.setCachedEmbedding(sampleQuery, sampleVector);
  const cachedVec = VectorDB.getCachedEmbedding(sampleQuery);
  assert(cachedVec !== null, "Successfully retrieved cached embedding.");
  assert(cachedVec.length === sampleVector.length, "Cached embedding dimension matches.");

  // Test 3: Document Vector Index & In-Memory Hybrid Search
  console.log("\n3. Testing In-Memory Vector Index & Hybrid Search (Vector + BM25)...");
  const testDocId = "doc_test_123";
  const testUserId = "user_test_abc";
  const docMeta = {
    id: testDocId,
    name: "Test Paper on RAG.pdf",
    pageCount: 3,
    chunkCount: 3,
  };

  // Generate mock normalized embeddings (3 chunks)
  // Chunk 0: AI/ML
  const vec0 = [0.9, 0.1, 0.0, 0.0, 0.0];
  // Chunk 1: RAG & retrieval
  const vec1 = [0.0, 0.9, 0.2, 0.0, 0.0];
  // Chunk 2: Vector databases
  const vec2 = [0.0, 0.1, 0.9, 0.1, 0.0];

  const docChunks = [
    {
      id: `${testDocId}_0`,
      documentId: testDocId,
      documentName: docMeta.name,
      text: "Introduction to Artificial Intelligence and Machine Learning with deep transformers.",
      embedding: vec0,
      pageIndex: 1,
    },
    {
      id: `${testDocId}_1`,
      documentId: testDocId,
      documentName: docMeta.name,
      text: "Retrieval Augmented Generation combines dense vector retrieval with LLMs to eliminate hallucinations.",
      embedding: vec1,
      pageIndex: 2,
    },
    {
      id: `${testDocId}_2`,
      documentId: testDocId,
      documentName: docMeta.name,
      text: "Vector databases index embeddings using HNSW graphs for ultra-low latency similarity queries.",
      embedding: vec2,
      pageIndex: 3,
    }
  ];

  await VectorDB.addDocument(docMeta, docChunks, testUserId);

  // Query specifically targeting Chunk 1 ("Retrieval Augmented Generation")
  const queryVec = [0.05, 0.88, 0.15, 0.0, 0.0];
  const searchStartTime = Date.now();
  const searchResponse = await VectorDB.similaritySearch(
    queryVec,
    2,
    testDocId,
    testUserId,
    { queryText: "Retrieval Augmented Generation with LLMs" }
  );
  const searchTime = Date.now() - searchStartTime;

  assert(searchResponse.results.length === 2, `Top-K search returned ${searchResponse.results.length} items.`);
  assert(searchResponse.results[0].chunk.pageIndex === 2, `Top match is Page 2 (RAG chunk).`);
  assert(searchResponse.results[0].score > 0.6, `Top match score is high confidence: ${(searchResponse.results[0].score * 100).toFixed(1)}%.`);
  assert(searchResponse.retrievalTimeMs >= 0, `Search retrieval time reported: ${searchResponse.retrievalTimeMs}ms.`);
  assert(searchResponse.method.includes("Hybrid"), `Search method used: "${searchResponse.method}".`);
  console.log(`  Retrieval execution completed in ${searchTime}ms.`);

  // Test 4: Fast Cache Retrieval
  console.log("\n4. Testing Second-Query Cache Performance...");
  const cachedSearchStart = Date.now();
  const cachedResponse = await VectorDB.similaritySearch(
    queryVec,
    2,
    testDocId,
    testUserId,
    { queryText: "Retrieval Augmented Generation with LLMs" }
  );
  const cachedTime = Date.now() - cachedSearchStart;
  assert(cachedResponse.cached === true, "Repeated query resolved from in-memory query cache.");
  console.log(`  Cached retrieval time: ${cachedTime}ms.`);

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
