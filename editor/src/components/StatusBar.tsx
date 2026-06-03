"use client";

import { useEditorStore } from "@/store/editorStore";

export function StatusBar() {
  const { activeFile } = useEditorStore();

  const language = activeFile ? getLanguageLabel(activeFile) : "";

  return (
    <div className="h-6 bg-editor-accent flex items-center justify-between px-3 text-white text-[11px]">
      {/* Left */}
      <div className="flex items-center gap-3">
        <span>Apeksha AI</span>
        <span>⟡ Cloud Mode</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {language && <span>{language}</span>}
        <span>UTF-8</span>
        <span>LF</span>
      </div>
    </div>
  );
}

function getLanguageLabel(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const labels: Record<string, string> = {
    js: "JavaScript",
    jsx: "JavaScript JSX",
    ts: "TypeScript",
    tsx: "TypeScript JSX",
    py: "Python",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    md: "Markdown",
    rs: "Rust",
    go: "Go",
  };
  return labels[ext] || ext.toUpperCase();
}
