"use client";

import { useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
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

      if (isMod && e.key === "p") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (isMod && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
      if (isMod && e.key === "l") {
        e.preventDefault();
        toggleChat();
      }
      if (isMod && e.key === "`") {
        e.preventDefault();
        toggleTerminal();
      }
      if (e.key === "Escape") {
        setShowCommandPalette(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleChat, toggleTerminal, toggleSidebar]);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />

      <PanelGroup direction="horizontal" className="flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <>
            <Panel defaultSize={15} minSize={10} maxSize={30}>
              <Sidebar />
            </Panel>
            <PanelResizeHandle className="w-1 bg-editor-border hover:bg-editor-accent transition cursor-col-resize" />
          </>
        )}

        {/* Editor + Terminal */}
        <Panel defaultSize={showChat ? 55 : 85} minSize={30}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={showTerminal ? 70 : 100} minSize={30}>
              <div className="h-full flex flex-col">
                <EditorTabs />
                <div className="flex-1 overflow-hidden">
                  <CodeEditor />
                </div>
              </div>
            </Panel>

            {showTerminal && (
              <>
                <PanelResizeHandle className="h-1 bg-editor-border hover:bg-editor-accent transition cursor-row-resize" />
                <Panel defaultSize={30} minSize={10} maxSize={60}>
                  <Terminal />
                </Panel>
              </>
            )}
          </PanelGroup>
        </Panel>

        {/* AI Chat */}
        {showChat && (
          <>
            <PanelResizeHandle className="w-1 bg-editor-border hover:bg-editor-accent transition cursor-col-resize" />
            <Panel defaultSize={30} minSize={15} maxSize={50}>
              <AIChat />
            </Panel>
          </>
        )}
      </PanelGroup>

      <StatusBar />

      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}
    </div>
  );
}
