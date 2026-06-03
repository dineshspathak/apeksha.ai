"use client";

import { X } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

export function EditorTabs() {
  const { openFiles, activeFile, setActiveFile, closeFile } = useEditorStore();

  if (openFiles.length === 0) return null;

  return (
    <div className="h-9 bg-editor-sidebar border-b border-editor-border flex items-center overflow-x-auto">
      {openFiles.map((file) => {
        const fileName = file.split("/").pop();
        const isActive = file === activeFile;

        return (
          <div
            key={file}
            className={`flex items-center gap-2 px-3 h-full cursor-pointer text-sm border-r border-editor-border transition ${
              isActive
                ? "bg-editor-bg text-white border-t-2 border-t-editor-accent"
                : "text-gray-500 hover:text-gray-300 bg-editor-sidebar"
            }`}
            onClick={() => setActiveFile(file)}
          >
            <span>{fileName}</span>
            <button
              className="p-0.5 rounded hover:bg-editor-active opacity-0 group-hover:opacity-100 hover:opacity-100 transition"
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file);
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
