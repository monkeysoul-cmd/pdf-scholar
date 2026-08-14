import React from "react";
import { StateProvider, useAppState } from "./lib/state-context";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import Upload from "./components/Upload";
import Quiz from "./components/Quiz";
import Chat from "./components/Chat";
import Auth from "./components/Auth";
import { motion, AnimatePresence } from "motion/react";

function AppContent() {
  const { token, activeTab } = useAppState();

  if (!token) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dot-grid font-sans text-white relative" id="main-app-container">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10 bg-noise overflow-hidden">
        {/* Top Gradient Overlay for smooth edge */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-20" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            {activeTab === "overview" && <Overview />}
            {activeTab === "upload" && <Upload />}
            {activeTab === "quiz" && <Quiz />}
            {activeTab === "chat" && <Chat />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StateProvider>
      <AppContent />
    </StateProvider>
  );
}
