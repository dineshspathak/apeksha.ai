"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X } from "lucide-react";

interface InlineEditProps {
  position: { top: number; left: number };
  selectedCode: string;
  onSubmit: (instruction: string) => void;
  onCancel: () => void;
}

export function InlineEdit({
  position,
  selectedCode,
  onSubmit,
  onCancel,
}: InlineEditProps) {
  const [instruction, setInstruction] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && instruction.trim()) {
      onSubmit(instruction);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      className="absolute z-50 shadow-2xl"
      style={{ top: `${position.top}px`, left: "20px", right: "20px" }}
    >
      <div className="bg-[#1a1a2e] border border-editor-accent/50 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-editor-accent/10 border-b border-editor-accent/30">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-editor-accent" />
            <span className="text-xs text-editor-accent font-medium">
              {selectedCode ? "Apeksha: Edit Selection" : "Apeksha: Generate Code"}
            </span>
          </div>
          <button
            onClick={onCancel}
            className="p-0.5 rounded hover:bg-white/10 text-gray-400"
          >
            <X size={12} />
          </button>
        </div>

        {/* Selected code preview */}
        {selectedCode && (
          <div className="px-3 py-1.5 bg-black/20 border-b border-editor-border">
            <p className="text-[10px] text-gray-500 mb-0.5">Selected code:</p>
            <pre className="text-xs text-gray-400 truncate max-h-12 overflow-hidden font-mono">
              {selectedCode.substring(0, 200)}
            </pre>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-2">
          <input
            ref={inputRef}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedCode
                ? "Tell Apeksha how to edit this code..."
                : "Tell Apeksha what code to generate..."
            }
            className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 border-none outline-none"
          />
          <button
            onClick={() => instruction.trim() && onSubmit(instruction)}
            disabled={!instruction.trim()}
            className="px-2 py-1 text-xs bg-editor-accent hover:bg-editor-accent-hover disabled:opacity-40 text-white rounded transition"
          >
            Apply
          </button>
        </div>

        {/* Hints */}
        <div className="px-3 py-1 border-t border-editor-border/50">
          <p className="text-[10px] text-gray-600">
            Enter to apply · Esc to cancel
          </p>
        </div>
      </div>
    </div>
  );
}
