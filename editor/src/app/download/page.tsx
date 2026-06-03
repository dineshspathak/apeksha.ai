"use client";

import { useState } from "react";

type Platform = "mac" | "windows" | "linux";

export default function DownloadPage() {
  const [platform, setPlatform] = useState<Platform>("mac");
  const [copied, setCopied] = useState(false);

  const commands: Record<Platform, { install: string; label: string }> = {
    mac: {
      install: `curl -fsSL https://raw.githubusercontent.com/dineshspathak/apeksha.ai/main/install.sh | bash`,
      label: "macOS (Apple Silicon & Intel)",
    },
    linux: {
      install: `curl -fsSL https://raw.githubusercontent.com/dineshspathak/apeksha.ai/main/install-linux.sh | bash`,
      label: "Linux (Ubuntu, Fedora, Arch)",
    },
    windows: {
      install: `powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/dineshspathak/apeksha.ai/main/install-windows.bat' -OutFile 'install.bat'; .\\install.bat"`,
      label: "Windows 10/11",
    },
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(commands[platform].install);
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
        <p className="text-gray-400 mb-10 text-center">
          One command. Everything installs automatically.
        </p>

        {/* Platform Selector */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setPlatform("mac")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              platform === "mac"
                ? "bg-[#7c5cfc] text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            🍎 macOS
          </button>
          <button
            onClick={() => setPlatform("windows")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              platform === "windows"
                ? "bg-[#7c5cfc] text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            🪟 Windows
          </button>
          <button
            onClick={() => setPlatform("linux")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              platform === "linux"
                ? "bg-[#7c5cfc] text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            🐧 Linux
          </button>
        </div>

        {/* Install Command */}
        <div className="bg-[#111] border-2 border-[#7c5cfc]/30 rounded-xl p-6 mb-8">
          <p className="text-sm text-[#7c5cfc] font-medium mb-1">
            {commands[platform].label}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            {platform === "mac"
              ? "Open Terminal and paste:"
              : platform === "linux"
              ? "Open Terminal and paste:"
              : "Open PowerShell (as Admin) and paste:"}
          </p>
          <div className="flex items-start gap-2 bg-black rounded-lg p-4">
            <code className="flex-1 text-xs md:text-sm text-green-400 break-all font-mono leading-relaxed">
              {commands[platform].install}
            </code>
            <button
              onClick={copyCommand}
              className="shrink-0 px-3 py-1.5 bg-[#7c5cfc] rounded text-xs font-medium hover:bg-[#9b7fff] transition"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            This downloads and runs the installer. Takes 5-10 min on first install.
          </p>
        </div>

        {/* What happens */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-4">The installer automatically:</h3>
          <ol className="space-y-2.5 text-sm text-gray-400">
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">✓</span>
              <span>Installs Ollama (local AI engine — free)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">✓</span>
              <span>Downloads the AI model (Llama 3.1, ~4GB)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">✓</span>
              <span>Installs Python &amp; Node.js (if not present)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">✓</span>
              <span>Sets up the code editor and all dependencies</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0">✓</span>
              <span>
                {platform === "mac"
                  ? "Creates an app in ~/Applications — just double-click to start"
                  : platform === "windows"
                  ? "Creates a desktop shortcut — just double-click to start"
                  : "Adds Apeksha to your app menu — just click to start"}
              </span>
            </li>
          </ol>
        </div>

        {/* ZIP Alternative */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-3">Prefer manual install?</h3>
          <a
            href="https://github.com/dineshspathak/apeksha.ai/archive/refs/heads/main.zip"
            className="inline-block px-5 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-sm"
          >
            ⬇️ Download ZIP
          </a>
          <p className="text-xs text-gray-500 mt-2">
            Unzip → Open Terminal in that folder → Run{" "}
            <code className="text-gray-400">
              {platform === "windows" ? "install-windows.bat" : platform === "linux" ? "./install-linux.sh" : "./install.sh"}
            </code>
          </p>
        </div>

        {/* Requirements */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-3">Requirements</h3>
          <ul className="space-y-1.5 text-sm text-gray-400">
            {platform === "mac" && (
              <>
                <li>✓ macOS 12 or later (Monterey+)</li>
                <li>✓ Apple Silicon (M1/M2/M3) or Intel</li>
              </>
            )}
            {platform === "windows" && (
              <>
                <li>✓ Windows 10 or 11</li>
                <li>✓ 64-bit processor</li>
              </>
            )}
            {platform === "linux" && (
              <>
                <li>✓ Ubuntu 20.04+, Fedora 35+, or Arch Linux</li>
                <li>✓ x86_64 or ARM64</li>
              </>
            )}
            <li>✓ 8GB RAM minimum (16GB recommended)</li>
            <li>✓ 5GB free disk space</li>
            <li>✓ Internet (first-time download only)</li>
          </ul>
        </div>

        {/* After install */}
        <div className="mt-12 text-center">
          <h3 className="font-semibold mb-2">After installation</h3>
          <p className="text-sm text-gray-500">
            {platform === "mac"
              ? 'Double-click "Apeksha AI" in ~/Applications'
              : platform === "windows"
              ? 'Double-click "Apeksha AI" on your Desktop'
              : 'Find "Apeksha AI" in your application menu'}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            No internet needed after first install. Everything runs locally.
          </p>
        </div>
      </div>
    </div>
  );
}
