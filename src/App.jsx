import React from "react";
import { StateProvider, useAppState } from "./lib/state-context";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import Upload from "./components/Upload";
import Quiz from "./components/Quiz";
import Chat from "./components/Chat";
import Guide from "./components/Guide";
import Auth from "./components/Auth";
import { motion, AnimatePresence } from "motion/react";

function AppContent() {
  const { token, activeTab } = useAppState();

  if (!token) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080808] font-sans text-white" id="main-app-container">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Primary content area with animated tab transitions */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative" id="main-content-panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col min-h-0 h-full overflow-hidden"
          >
            {activeTab === "overview" && <Overview />}
            {activeTab === "upload" && <Upload />}
            {activeTab === "quiz" && <Quiz />}
            {activeTab === "chat" && <Chat />}
            {activeTab === "guide" && <Guide />}
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
