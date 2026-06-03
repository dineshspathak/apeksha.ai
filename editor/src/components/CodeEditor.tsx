"use client";

import { useState, useRef, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useEditorStore } from "@/store/editorStore";
import { InlineEdit } from "./InlineEdit";

export function CodeEditor() {
  const { activeFile, fileContents, updateFileContent } = useEditorStore();
  const [showInlineEdit, setShowInlineEdit] = useState(false);
  const [inlineEditPos, setInlineEditPos] = useState({ top: 0, left: 0 });
  const [selectedCode, setSelectedCode] = useState("");
  const [selectionRange, setSelectionRange] = useState<any>(null);
  const editorRef = useRef<any>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Cmd+K / Ctrl+K for inline AI edit
    editor.addAction({
      id: "apeksha-inline-edit",
      label: "Apeksha: Edit with AI",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
      run: () => {
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          const model = editor.getModel();
          if (model) {
            const text = model.getValueInRange(selection);
            setSelectedCode(text);
            setSelectionRange(selection);

            // Get position for inline widget
            const pos = editor.getScrolledVisiblePosition(selection.getStartPosition());
            if (pos) {
              setInlineEditPos({ top: pos.top + 30, left: pos.left });
            }
            setShowInlineEdit(true);
          }
        } else {
          // No selection - show at cursor
          const pos = editor.getPosition();
          if (pos) {
            const scrollPos = editor.getScrolledVisiblePosition(pos);
            if (scrollPos) {
              setInlineEditPos({ top: scrollPos.top + 30, left: scrollPos.left });
            }
          }
          setSelectedCode("");
          setSelectionRange(null);
          setShowInlineEdit(true);
        }
      },
    });

    // Cmd+L / Ctrl+L for AI chat focus
    editor.addAction({
      id: "apeksha-focus-chat",
      label: "Apeksha: Focus AI Chat",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL],
      run: () => {
        useEditorStore.getState().toggleChat();
      },
    });
  };

  const handleInlineEditSubmit = async (instruction: string) => {
    setShowInlineEdit(false);

    if (!editorRef.current || !activeFile) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    // Call Apeksha backend for AI edit
    try {
      const prompt = selectedCode
        ? `Edit this code according to the instruction. Only return the modified code, no explanations.\n\nInstruction: ${instruction}\n\nCode:\n${selectedCode}`
        : `Generate code for the following instruction. Only return the code, no explanations.\n\nInstruction: ${instruction}`;

      const res = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();
      let newCode = data.response || "";

      // Clean up markdown code blocks if present
      newCode = newCode.replace(/^```[\w]*\n?/gm, "").replace(/\n?```$/gm, "").trim();

      if (selectionRange) {
        // Replace selection
        editorRef.current.executeEdits("apeksha-ai", [
          {
            range: selectionRange,
            text: newCode,
          },
        ]);
      } else {
        // Insert at cursor
        const pos = editorRef.current.getPosition();
        if (pos) {
          editorRef.current.executeEdits("apeksha-ai", [
            {
              range: {
                startLineNumber: pos.lineNumber,
                startColumn: pos.column,
                endLineNumber: pos.lineNumber,
                endColumn: pos.column,
              },
              text: newCode,
            },
          ]);
        }
      }

      // Update store
      const updatedContent = model.getValue();
      updateFileContent(activeFile, updatedContent);
    } catch (error) {
      console.error("Inline edit failed:", error);
    }
  };

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-editor-bg">
        <div className="text-center text-gray-500">
          <p className="text-4xl mb-4"></p>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">
            Apeksha AI Editor
          </h2>
          <p className="text-sm">Open a file from the sidebar to start editing</p>
          <div className="mt-6 text-xs text-gray-600 space-y-1">
            <p><kbd className="px-1.5 py-0.5 bg-editor-sidebar rounded text-gray-400">⌘K</kbd> AI Inline Edit</p>
            <p><kbd className="px-1.5 py-0.5 bg-editor-sidebar rounded text-gray-400">⌘L</kbd> Toggle AI Chat</p>
          </div>
        </div>
      </div>
    );
  }

  const content = fileContents[activeFile] || "";
  const language = getLanguage(activeFile);

  return (
    <div className="h-full relative">
      <Editor
        height="100%"
        language={language}
        value={content}
        theme="vs-dark"
        onMount={handleEditorMount}
        onChange={(value) => {
          if (value !== undefined) {
            updateFileContent(activeFile, value);
          }
        }}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'SF Mono', 'JetBrains Mono', monospace",
          fontLigatures: true,
          minimap: { enabled: true, scale: 1 },
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          lineNumbers: "on",
          renderLineHighlight: "line",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          autoIndent: "full",
          formatOnPaste: true,
          wordWrap: "off",
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
        }}
      />

      {/* Inline Edit Widget */}
      {showInlineEdit && (
        <InlineEdit
          position={inlineEditPos}
          selectedCode={selectedCode}
          onSubmit={handleInlineEditSubmit}
          onCancel={() => setShowInlineEdit(false)}
        />
      )}
    </div>
  );
}

function getLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
    yml: "yaml",
    yaml: "yaml",
    sh: "shell",
    bash: "shell",
    rs: "rust",
    go: "go",
    java: "java",
    cpp: "cpp",
    c: "c",
    rb: "ruby",
    php: "php",
    sql: "sql",
    dockerfile: "dockerfile",
  };
  return langMap[ext || ""] || "plaintext";
}
