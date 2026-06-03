"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, X } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

const API_URL = "http://127.0.0.1:5000";

interface TerminalLine {
  type: "input" | "output" | "error" | "info";
  content: string;
}

export function Terminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: "info", content: "🙏 Apeksha Terminal — Run commands directly" },
    { type: "info", content: '   Connected to workspace. Type a command and press Enter.\n' },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const runCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    setCmdHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setHistory((prev) => [...prev, { type: "input", content: `$ ${cmd}` }]);

    // Client-side commands
    if (cmd === "clear") {
      setHistory([]);
      return;
    }

    setRunning(true);

    try {
      const res = await fetch(`${API_URL}/api/terminal/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });

      const data = await res.json();

      if (data.error) {
        setHistory((prev) => [
          ...prev,
          { type: "error", content: data.error },
        ]);
      } else {
        if (data.stdout) {
          setHistory((prev) => [
            ...prev,
            { type: "output", content: data.stdout },
          ]);
        }
        if (data.stderr) {
          setHistory((prev) => [
            ...prev,
            { type: "error", content: data.stderr },
          ]);
        }
        if (!data.stdout && !data.stderr) {
          setHistory((prev) => [
            ...prev,
            { type: "output", content: "(command completed)" },
          ]);
        }
      }
    } catch {
      setHistory((prev) => [
        ...prev,
        {
          type: "error",
          content: "✗ Cannot reach backend. Run: python web_ui.py",
        },
      ]);
    }

    setRunning(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? cmdHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= cmdHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(cmdHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div
      className="h-full flex flex-col bg-[#0d0d0d] font-mono text-sm"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Header */}
      <div className="h-8 flex items-center justify-between px-3 bg-editor-sidebar border-b border-editor-border shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <TerminalIcon size={12} />
          <span>Terminal</span>
        </div>
        <button
          onClick={() => useEditorStore.getState().toggleTerminal()}
          className="p-0.5 rounded hover:bg-editor-active text-gray-500"
        >
          <X size={12} />
        </button>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {history.map((line, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap text-xs ${
              line.type === "input"
                ? "text-green-400"
                : line.type === "error"
                ? "text-red-400"
                : line.type === "info"
                ? "text-blue-400"
                : "text-gray-300"
            }`}
          >
            {line.content}
          </div>
        ))}
        <div ref={bottomRef} />

        {/* Input line */}
        <div className="flex items-center gap-2 text-green-400 text-xs">
          <span>{running ? "⏳" : "$"}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={running}
            className="flex-1 bg-transparent border-none outline-none text-green-400 text-xs disabled:opacity-50"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
