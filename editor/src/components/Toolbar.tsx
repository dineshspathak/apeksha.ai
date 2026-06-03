"use client";

import { useState } from "react";
import {
  PanelLeft,
  MessageSquare,
  Terminal,
  Settings as SettingsIcon,
  Save,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { Settings } from "./Settings";

export function Toolbar() {
  const { toggleSidebar, toggleChat, toggleTerminal, activeFile, fileContents } =
    useEditorStore();
  const [showSettings, setShowSettings] = useState(false);

  const handleSave = async () => {
    if (!activeFile) return;
    const content = fileContents[activeFile];
    if (content === undefined) return;

    try {
      await fetch("http://127.0.0.1:5000/api/files/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: activeFile, content }),
      });
    } catch (e) {
      console.error("Save failed:", e);
    }
  };

  return (
    <>
      <div className="h-10 bg-editor-sidebar border-b border-editor-border flex items-center px-4 justify-between">
        {/* Left - Brand */}
        <div className="flex items-center gap-2">
          <span className="text-editor-accent font-semibold text-sm">Apeksha</span>
          <span className="text-xs text-gray-500">AI Editor</span>
        </div>

        {/* Center - Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded hover:bg-editor-active text-gray-400 hover:text-white transition"
            title="Toggle Sidebar (⌘B)"
          >
            <PanelLeft size={16} />
          </button>
          <button
            onClick={toggleTerminal}
            className="p-1.5 rounded hover:bg-editor-active text-gray-400 hover:text-white transition"
            title="Toggle Terminal (⌘`)"
          >
            <Terminal size={16} />
          </button>
          <button
            onClick={toggleChat}
            className="p-1.5 rounded hover:bg-editor-active text-gray-400 hover:text-white transition"
            title="Toggle AI Chat (⌘L)"
          >
            <MessageSquare size={16} />
          </button>
          <div className="w-px h-4 bg-editor-border mx-1" />
          <button
            onClick={handleSave}
            className="p-1.5 rounded hover:bg-editor-active text-gray-400 hover:text-white transition"
            title="Save File (⌘S)"
          >
            <Save size={16} />
          </button>
        </div>

        {/* Right - Settings */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded hover:bg-editor-active text-gray-400 hover:text-white transition"
            title="Settings"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </>
  );
}
