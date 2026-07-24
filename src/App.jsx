import React from "react";
import { StateProvider, useAppState } from "./lib/state-context";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import Upload from "./components/Upload";
import Quiz from "./components/Quiz";
import Chat from "./components/Chat";
import Guide from "./components/Guide";

function AppContent() {
  const { activeTab } = useAppState();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0A0A] font-sans text-white" id="main-app-container">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Primary content area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden" id="main-content-panel">
        {activeTab === "overview" && <Overview />}
        {activeTab === "upload" && <Upload />}
        {activeTab === "quiz" && <Quiz />}
        {activeTab === "chat" && <Chat />}
        {activeTab === "guide" && <Guide />}
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
