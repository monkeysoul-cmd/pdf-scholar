export interface DocumentMetadata {
  id: string;
  name: string;
  pageCount: number;
  chunkCount: number;
  uploadedAt: string;
  size: number;
}

export interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "short-answer";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ChunkSource {
  chunk: {
    documentId: string;
    documentName: string;
    text: string;
    pageIndex: number;
  };
  score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  sources?: ChunkSource[];
}

export interface AppState {
  documents: DocumentMetadata[];
  selectedDocumentId: string | null;
  quizQuestions: QuizQuestion[];
  chatHistory: { [docId: string]: ChatMessage[] };
  activeTab: "overview" | "upload" | "quiz" | "chat" | "guide";
}
