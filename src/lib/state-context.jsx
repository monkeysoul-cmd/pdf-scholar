import React, { createContext, useContext, useState, useEffect } from "react";

const StateContext = createContext(undefined);

export function StateProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [chatHistory, setChatHistory] = useState(() => {
    // Load chat history from localStorage if present
    try {
      const saved = localStorage.getItem("pdf_scholar_chat_history");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Sync chat history to localStorage
  useEffect(() => {
    localStorage.setItem("pdf_scholar_chat_history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
        // If there is only one document and none is selected, auto-select it
        if (data.documents.length > 0 && !selectedDocumentId) {
          setSelectedDocumentId(data.documents[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const selectDocument = (docId) => {
    setSelectedDocumentId(docId);
    // Clear current quiz questions when changing documents
    setQuizQuestions([]);
  };

  const deleteDocument = async (docId) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        if (selectedDocumentId === docId) {
          setSelectedDocumentId(null);
        }
        // Delete history
        setChatHistory(prev => {
          const updated = { ...prev };
          delete updated[docId];
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const addMessage = (docId, role, text, sources) => {
    const newMessage = {
      id: `msg_${Date.now()}`,
      role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sources,
    };

    setChatHistory(prev => {
      const currentDocHistory = prev[docId] || [];
      return {
        ...prev,
        [docId]: [...currentDocHistory, newMessage],
      };
    });
  };

  const setQuestions = (questions) => {
    setQuizQuestions(questions);
  };

  const clearChat = (docId) => {
    setChatHistory(prev => {
      const updated = { ...prev };
      delete updated[docId];
      return updated;
    });
  };

  return (
    <StateContext.Provider
      value={{
        documents,
        selectedDocumentId,
        quizQuestions,
        chatHistory,
        activeTab,
        isLoadingDocs,
        setTab: setActiveTab,
        selectDocument,
        fetchDocuments,
        deleteDocument,
        addMessage,
        setQuestions,
        clearChat,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useAppState must be used within a StateProvider");
  }
  return context;
}
