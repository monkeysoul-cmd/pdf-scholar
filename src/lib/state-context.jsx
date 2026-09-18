import React, { createContext, useContext, useState, useEffect } from "react";

const StateContext = createContext(undefined);

export function StateProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("pdf_scholar_token") || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("pdf_scholar_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = user?.id
        ? localStorage.getItem(`pdf_scholar_chat_history_${user.id}`) || localStorage.getItem("pdf_scholar_chat_history")
        : localStorage.getItem("pdf_scholar_chat_history");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [quizScores, setQuizScores] = useState(() => {
    try {
      const saved = user?.id
        ? localStorage.getItem(`pdf_scholar_quiz_scores_${user.id}`) || localStorage.getItem("pdf_scholar_quiz_scores")
        : localStorage.getItem("pdf_scholar_quiz_scores");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Switch or reload chat history & quiz scores when active user changes
  useEffect(() => {
    if (user?.id) {
      try {
        const savedHistory = localStorage.getItem(`pdf_scholar_chat_history_${user.id}`) || localStorage.getItem("pdf_scholar_chat_history");
        setChatHistory(savedHistory ? JSON.parse(savedHistory) : {});
      } catch {
        setChatHistory({});
      }

      try {
        const savedScores = localStorage.getItem(`pdf_scholar_quiz_scores_${user.id}`) || localStorage.getItem("pdf_scholar_quiz_scores");
        setQuizScores(savedScores ? JSON.parse(savedScores) : []);
      } catch {
        setQuizScores([]);
      }
    } else {
      setChatHistory({});
      setQuizScores([]);
    }
  }, [user?.id]);

  // Sync quiz scores to localStorage per user
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`pdf_scholar_quiz_scores_${user.id}`, JSON.stringify(quizScores));
    }
  }, [quizScores, user?.id]);

  const saveQuizResult = (result) => {
    const nowIso = new Date().toISOString();
    const newEntry = {
      id: `score_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: nowIso,
      date: nowIso,
      docName: result.documentName || result.docName || "Study Document",
      documentName: result.documentName || result.docName || "Study Document",
      ...result
    };
    setQuizScores(prev => [newEntry, ...prev]);
  };

  // Sync chat history to localStorage per user
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`pdf_scholar_chat_history_${user.id}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, user?.id]);

  const authenticatedFetch = async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, {
      ...options,
      headers
    });
    if (res.status === 401 || res.status === 403) {
      logout();
      throw new Error("Session expired. Please log in again.");
    }
    return res;
  };

  const fetchDocuments = async () => {
    if (!token) return;
    setIsLoadingDocs(true);
    try {
      const res = await authenticatedFetch("/api/documents");
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
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
    if (token) {
      fetchDocuments();
    } else {
      setDocuments([]);
      setSelectedDocumentId(null);
    }
  }, [token]);

  const login = async (username, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server returned non-JSON error (status ${res.status}): ${text.slice(0, 180) || "Check deployment environment variables (MONGODB_URI, GEMINI_API_KEY, JWT_SECRET)."}`);
    }
    if (!res.ok) {
      throw new Error(data.error || `Login failed (status ${res.status}).`);
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("pdf_scholar_token", data.token);
    localStorage.setItem("pdf_scholar_user", JSON.stringify(data.user));
  };

  const register = async (username, password) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server returned non-JSON error (status ${res.status}): ${text.slice(0, 180) || "Check deployment environment variables (MONGODB_URI, GEMINI_API_KEY, JWT_SECRET)."}`);
    }
    if (!res.ok) {
      throw new Error(data.error || `Registration failed (status ${res.status}).`);
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setDocuments([]);
    setSelectedDocumentId(null);
    setQuizQuestions([]);
    setChatHistory({});
    setQuizScores([]);
    localStorage.removeItem("pdf_scholar_token");
    localStorage.removeItem("pdf_scholar_user");
  };

  const selectDocument = (docId) => {
    setSelectedDocumentId(docId);
    setQuizQuestions([]);
  };

  const deleteDocument = async (docId) => {
    try {
      const res = await authenticatedFetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        if (selectedDocumentId === docId) {
          setSelectedDocumentId(null);
        }
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

  const updateLastMessage = (docId, updater) => {
    setChatHistory(prev => {
      const currentDocHistory = prev[docId] || [];
      if (currentDocHistory.length === 0) return prev;
      const lastIndex = currentDocHistory.length - 1;
      const lastMsg = currentDocHistory[lastIndex];
      const updatedMsg = typeof updater === "function" ? updater(lastMsg) : { ...lastMsg, ...updater };
      const updatedHistory = [...currentDocHistory];
      updatedHistory[lastIndex] = updatedMsg;
      return {
        ...prev,
        [docId]: updatedHistory,
      };
    });
  };

  return (
    <StateContext.Provider
      value={{
        token,
        user,
        documents,
        selectedDocumentId,
        quizQuestions,
        chatHistory,
        activeTab,
        isLoadingDocs,
        quizScores,
        saveQuizResult,
        setTab: setActiveTab,
        selectDocument,
        fetchDocuments,
        deleteDocument,
        addMessage,
        updateLastMessage,
        setQuestions,
        clearChat,
        login,
        register,
        logout,
        authenticatedFetch
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
