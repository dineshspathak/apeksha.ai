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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "p") { e.preventDefault(); setShowCommandPalette(true); }
      if (isMod && e.key === "b") { e.preventDefault(); toggleSidebar(); }
      if (isMod && e.key === "l") { e.preventDefault(); toggleChat(); }
      if (isMod && e.key === "`") { e.preventDefault(); toggleTerminal(); }
      if (e.key === "Escape") { setShowCommandPalette(false); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleChat, toggleTerminal, toggleSidebar]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorTabs />
          <div className="flex-1 overflow-hidden">
            <CodeEditor />
          </div>
          {showTerminal && (
            <div className="h-48 border-t border-editor-border">
              <Terminal />
            </div>
          )}
        </div>

        {showChat && (
          <div className="w-[380px] border-l border-editor-border flex flex-col">
            <AIChat />
          </div>
        )}
      </div>

      <StatusBar />

      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}
    </div>
  );
}
