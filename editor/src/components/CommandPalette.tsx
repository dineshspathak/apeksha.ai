"use client";

import { useState, useEffect, useRef } from "react";
import { Search, File, Command } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

const API_URL = "http://127.0.0.1:5000";

interface CommandPaletteProps {
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openFile, updateFileContent, toggleChat, toggleTerminal, toggleSidebar } =
    useEditorStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(getDefaultCommands());
      return;
    }

    if (query.startsWith(">")) {
      // Command mode
      const cmdQuery = query.slice(1).toLowerCase();
      const commands = getDefaultCommands().filter((c) =>
        c.label.toLowerCase().includes(cmdQuery)
      );
      setResults(commands);
    } else {
      // File search
      searchFiles(query);
    }
    setSelectedIndex(0);
  }, [query]);

  const searchFiles = async (q: string) => {
    try {
      const res = await fetch(`${API_URL}/api/files/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(
        (data.results || []).map((f: any) => ({
          type: "file",
          label: f.name,
          detail: f.path,
          action: () => handleOpenFile(f.path),
        }))
      );
    } catch {
      setResults([]);
    }
  };

  const handleOpenFile = async (path: string) => {
    openFile(path);
    try {
      const res = await fetch(`${API_URL}/api/files/read?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.content !== undefined) {
        updateFileContent(path, data.content);
      }
    } catch {}
    onClose();
  };

  const getDefaultCommands = () => [
    { type: "command", label: "Toggle AI Chat", detail: "⌘L", action: () => { toggleChat(); onClose(); } },
    { type: "command", label: "Toggle Terminal", detail: "⌘`", action: () => { toggleTerminal(); onClose(); } },
    { type: "command", label: "Toggle Sidebar", detail: "⌘B", action: () => { toggleSidebar(); onClose(); } },
    { type: "command", label: "New File", detail: "", action: () => onClose() },
    { type: "command", label: "Reset AI Chat", detail: "", action: () => { useEditorStore.getState().clearChat(); onClose(); } },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Palette */}
      <div className="relative w-[560px] max-h-[400px] bg-editor-sidebar border border-editor-border rounded-lg shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-editor-border">
          <Search size={16} className="text-gray-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search files or type > for commands..."
            className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none"
          />
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto">
          {results.map((result, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer ${
                i === selectedIndex
                  ? "bg-editor-accent/20 text-white"
                  : "text-gray-400 hover:bg-editor-active"
              }`}
              onClick={() => result.action()}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              {result.type === "file" ? (
                <File size={14} className="text-gray-500 shrink-0" />
              ) : (
                <Command size={14} className="text-editor-accent shrink-0" />
              )}
              <span className="text-sm flex-1 truncate">{result.label}</span>
              {result.detail && (
                <span className="text-xs text-gray-600">{result.detail}</span>
              )}
            </div>
          ))}
          {results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-600">
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
