"use client";

import { useState, useEffect } from "react";
import {
  File,
  Folder,
  FolderOpen,
  FolderPlus,
  FilePlus,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEditorStore, FileNode } from "@/store/editorStore";

const API_URL = "http://127.0.0.1:5000";

export function Sidebar() {
  const { files, setFiles, openFile, activeFile, updateFileContent } = useEditorStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FileNode[]>([]);

  // Fetch file tree on mount
  useEffect(() => {
    fetchFileTree();
  }, []);

  const fetchFileTree = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/files/tree`);
      const data = await res.json();
      setFiles(data.tree || []);
    } catch (error) {
      // Use demo files if backend not available
      setFiles(DEMO_FILES);
    }
    setLoading(false);
  };

  const handleFileClick = async (path: string) => {
    openFile(path);

    // Fetch file content from backend
    try {
      const res = await fetch(`${API_URL}/api/files/read?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.content !== undefined) {
        updateFileContent(path, data.content);
      }
    } catch {
      // If backend unavailable, check demo files
      const demoContent = findDemoContent(path, DEMO_FILES);
      if (demoContent !== null) {
        updateFileContent(path, demoContent);
      }
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/files/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    }
  };

  return (
    <div className="w-60 bg-editor-sidebar border-r border-editor-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
          Explorer
        </span>
        <div className="flex gap-1">
          <button
            onClick={fetchFileTree}
            className="p-1 rounded hover:bg-editor-active text-gray-500 hover:text-gray-300"
            title="Refresh"
          >
            <RefreshCw size={12} />
          </button>
          <button
            className="p-1 rounded hover:bg-editor-active text-gray-500 hover:text-gray-300"
            title="New File"
          >
            <FilePlus size={12} />
          </button>
          <button
            className="p-1 rounded hover:bg-editor-active text-gray-500 hover:text-gray-300"
            title="New Folder"
          >
            <FolderPlus size={12} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-editor-bg rounded border border-editor-border focus-within:border-editor-accent transition">
          <Search size={12} className="text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search files..."
            className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 outline-none"
          />
        </div>
      </div>

      {/* File Tree or Search Results */}
      <div className="flex-1 overflow-y-auto px-1 pb-4">
        {loading ? (
          <div className="px-4 py-8 text-xs text-gray-600 text-center">
            Loading files...
          </div>
        ) : searchQuery ? (
          searchResults.length > 0 ? (
            searchResults.map((result) => (
              <div
                key={result.path}
                className="flex items-center gap-1 px-3 py-1 rounded cursor-pointer text-sm text-gray-400 hover:bg-editor-active hover:text-gray-200"
                onClick={() => handleFileClick(result.path)}
              >
                <File size={14} className="text-gray-500 shrink-0" />
                <span className="truncate">{result.name}</span>
                <span className="text-[10px] text-gray-600 truncate ml-auto">
                  {result.path}
                </span>
              </div>
            ))
          ) : (
            <div className="px-4 py-4 text-xs text-gray-600 text-center">
              No files found
            </div>
          )
        ) : files.length > 0 ? (
          files.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              depth={0}
              onFileClick={handleFileClick}
              activeFile={activeFile}
            />
          ))
        ) : (
          <div className="px-4 py-8 text-xs text-gray-600 text-center">
            <p>No files in workspace</p>
            <p className="mt-1">Use AI chat to create a project!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FileTreeNode({
  node,
  depth,
  onFileClick,
  activeFile,
}: {
  node: FileNode;
  depth: number;
  onFileClick: (path: string) => void;
  activeFile: string | null;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const isActive = activeFile === node.path;

  if (node.type === "folder") {
    return (
      <div>
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer hover:bg-editor-active text-sm text-gray-300"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronDown size={14} className="text-gray-500 shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-gray-500 shrink-0" />
          )}
          {expanded ? (
            <FolderOpen size={14} className="text-yellow-500 shrink-0" />
          ) : (
            <Folder size={14} className="text-yellow-500 shrink-0" />
          )}
          <span className="ml-1 truncate">{node.name}</span>
        </div>
        {expanded &&
          node.children?.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileClick={onFileClick}
              activeFile={activeFile}
            />
          ))}
      </div>
    );
  }

  const icon = getFileIcon(node.name);

  return (
    <div
      className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer text-sm transition ${
        isActive
          ? "bg-editor-active text-white"
          : "text-gray-400 hover:bg-editor-active hover:text-gray-200"
      }`}
      style={{ paddingLeft: `${depth * 12 + 22}px` }}
      onClick={() => onFileClick(node.path)}
    >
      <File size={14} className={`shrink-0 ${icon.color}`} />
      <span className="ml-1 truncate">{node.name}</span>
    </div>
  );
}

function getFileIcon(filename: string): { color: string } {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const colors: Record<string, string> = {
    js: "text-yellow-400",
    jsx: "text-blue-400",
    ts: "text-blue-500",
    tsx: "text-blue-400",
    py: "text-green-400",
    html: "text-orange-400",
    css: "text-purple-400",
    json: "text-yellow-300",
    md: "text-gray-400",
    rs: "text-orange-500",
    go: "text-cyan-400",
  };
  return { color: colors[ext] || "text-gray-500" };
}

function findDemoContent(path: string, nodes: FileNode[]): string | null {
  for (const node of nodes) {
    if (node.path === path && node.content !== undefined) return node.content;
    if (node.children) {
      const found = findDemoContent(path, node.children);
      if (found !== null) return found;
    }
  }
  return null;
}

// Fallback demo files when backend isn't running
const DEMO_FILES: FileNode[] = [
  {
    name: "src",
    path: "src",
    type: "folder",
    children: [
      { name: "index.html", path: "src/index.html", type: "file", content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <h1>Hello Apeksha!</h1>\n</body>\n</html>' },
      { name: "app.js", path: "src/app.js", type: "file", content: '// Built with Apeksha AI\nconsole.log("Hello, World!");' },
      { name: "style.css", path: "src/style.css", type: "file", content: 'body {\n  background: #0f0f0f;\n  color: #e8e8e8;\n  font-family: system-ui;\n}' },
    ],
  },
  { name: "README.md", path: "README.md", type: "file", content: "# My Project\n\nBuilt with Apeksha AI Editor." },
  { name: "package.json", path: "package.json", type: "file", content: '{\n  "name": "my-project",\n  "version": "1.0.0"\n}' },
];
