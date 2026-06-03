"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { EditorTabs } from "./EditorTabs";
import { CodeEditor } from "./CodeEditor";
import { AIChat } from "./AIChat";
import { Terminal } from "./Terminal";
import { StatusBar } from "./StatusBar";
import { Toolbar } from "./Toolbar";
import { CommandPalette } from "./CommandPalette";
import { useEditorStore } from "@/store/editorStore";

export function EditorLayout() {
  const { showSidebar, showChat, showTerminal, toggleChat, toggleTerminal, toggleSidebar } =
    useEditorStore();
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd+P: Command palette (file search)
      if (isMod && e.key === "p") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Cmd+Shift+P: Command mode
      if (isMod && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Cmd+B: Toggle sidebar
      if (isMod && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
      // Cmd+L: Toggle chat
      if (isMod && e.key === "l") {
        e.preventDefault();
        toggleChat();
      }
      // Cmd+`: Toggle terminal
      if (isMod && e.key === "`") {
        e.preventDefault();
        toggleTerminal();
      }
      // Escape: Close command palette
      if (e.key === "Escape") {
        setShowCommandPalette(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleChat, toggleTerminal, toggleSidebar]);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (File Explorer) */}
        {showSidebar && <Sidebar />}

        {/* Editor + Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Tabs */}
          <EditorTabs />

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor />
          </div>

          {/* Terminal Panel */}
          {showTerminal && (
            <div className="h-48 border-t border-editor-border">
              <Terminal />
            </div>
          )}
        </div>

        {/* AI Chat Panel */}
        {showChat && (
          <div className="w-96 border-l border-editor-border flex flex-col">
            <AIChat />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Command Palette (Modal) */}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}
    </div>
  );
}
