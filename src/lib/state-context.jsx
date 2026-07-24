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
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed.");
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
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Registration failed.");
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setDocuments([]);
    setSelectedDocumentId(null);
    setQuizQuestions([]);
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
        setTab: setActiveTab,
        selectDocument,
        fetchDocuments,
        deleteDocument,
        addMessage,
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
