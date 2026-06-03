"use client";

import { useState } from "react";

export default function DownloadPage() {
  const [copied, setCopied] = useState(false);

  const installCommand = `curl -fsSL https://raw.githubusercontent.com/dineshspathak/apeksha.ai/main/install.sh | bash`;

  const copyCommand = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">🙏</span>
          <span className="font-bold text-lg">Apeksha AI</span>
        </a>
        <a href="/" className="text-sm text-gray-400 hover:text-white">← Back</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Install Apeksha AI</h1>
        <p className="text-gray-400 mb-12 text-center">
          One command. Everything installs automatically.
        </p>

        {/* One-Command Install */}
        <div className="bg-[#111] border-2 border-[#7c5cfc]/30 rounded-xl p-6 mb-8">
          <p className="text-sm text-[#7c5cfc] font-medium mb-3">
            Paste this in your Terminal:
          </p>
          <div className="flex items-center gap-2 bg-black rounded-lg p-4">
            <code className="flex-1 text-sm text-green-400 break-all">
              {installCommand}
            </code>
            <button
              onClick={copyCommand}
              className="shrink-0 px-3 py-1.5 bg-[#7c5cfc] rounded text-xs font-medium hover:bg-[#9b7fff] transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Works on macOS (Apple Silicon & Intel). Requires ~5GB free space.
          </p>
        </div>

        {/* What it does */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-4">What this does automatically:</h3>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-3">
              <span className="text-[#7c5cfc] font-bold shrink-0">1.</span>
              <span>Installs Ollama (local AI engine) — if not already installed</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#7c5cfc] font-bold shrink-0">2.</span>
              <span>Downloads the AI model (Llama 3.1, ~4GB one-time download)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#7c5cfc] font-bold shrink-0">3.</span>
              <span>Sets up the code editor and all dependencies</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#7c5cfc] font-bold shrink-0">4.</span>
              <span>Creates an app icon in your Applications folder</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#7c5cfc] font-bold shrink-0">5.</span>
              <span>Opens Apeksha in your browser — ready to use!</span>
            </li>
          </ol>
        </div>

        {/* Alternative: ZIP download */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-3">Or download manually:</h3>
          <a
            href="https://github.com/dineshspathak/apeksha.ai/archive/refs/heads/main.zip"
            className="inline-block px-6 py-2.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-sm"
          >
            ⬇️ Download ZIP
          </a>
          <p className="text-xs text-gray-500 mt-2">
            After unzipping, open Terminal in that folder and run: <code className="text-gray-400">./install.sh</code>
          </p>
        </div>

        {/* Requirements */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-3">Requirements</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>✓ macOS 12+ (Apple Silicon or Intel)</li>
            <li>✓ 8GB RAM minimum (16GB recommended)</li>
            <li>✓ 5GB free disk space</li>
            <li>✓ Internet connection (for first-time download only)</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-600">
              Windows & Linux support coming soon.
              <a href="https://github.com/dineshspathak/apeksha.ai" className="text-[#7c5cfc] ml-1 hover:underline">
                Follow on GitHub
              </a>
            </p>
          </div>
        </div>

        {/* After install */}
        <div className="mt-12 text-center">
          <h3 className="font-semibold mb-2">After installation</h3>
          <p className="text-sm text-gray-500">
            Just double-click <strong className="text-gray-300">"Apeksha AI"</strong> in your Applications folder.
            <br />
            Or run <code className="text-gray-400 bg-black px-1.5 py-0.5 rounded text-xs">./launch.sh</code> in the terminal.
          </p>
        </div>
      </div>
    </div>
  );
}
