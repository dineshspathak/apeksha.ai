"use client";

import { useState } from "react";

/**
 * Download page - Users get Apeksha here
 */
export default function DownloadPage() {
  const [email, setEmail] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    // Track download (add analytics later)
    setDownloaded(true);
    // Redirect to GitHub repo (download as ZIP)
    window.open("https://github.com/dineshspathak/apeksha.ai/archive/refs/heads/main.zip", "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">🙏</span>
          <span className="font-bold text-lg">Apeksha</span>
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Download Apeksha AI</h1>
        <p className="text-gray-400 mb-12">
          Free to download. Runs 100% on your machine.
        </p>

        {/* Download Options */}
        <div className="space-y-4 mb-12">
          <button
            onClick={handleDownload}
            className="w-full py-4 bg-[#7c5cfc] rounded-xl hover:bg-[#9b7fff] transition font-semibold text-lg"
          >
            ⬇️ Download for macOS (Apple Silicon)
          </button>
          <button
            onClick={handleDownload}
            className="w-full py-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition font-medium"
          >
            ⬇️ Download for macOS (Intel)
          </button>
          <button
            onClick={handleDownload}
            className="w-full py-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition font-medium"
          >
            ⬇️ Download for Windows
          </button>
          <button
            onClick={handleDownload}
            className="w-full py-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition font-medium"
          >
            ⬇️ Download for Linux
          </button>
        </div>

        {/* Setup Instructions */}
        <div className="text-left bg-[#111] border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Quick Setup (2 minutes)</h3>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-2">
              <span className="text-[#7c5cfc] font-bold">1.</span>
              <div>
                <span className="text-gray-200">Install Ollama</span>
                <br />
                <code className="text-xs bg-black/50 px-2 py-0.5 rounded">
                  brew install ollama
                </code>
              </div>
            </li>
            <li className="flex gap-2">
              <span className="text-[#7c5cfc] font-bold">2.</span>
              <div>
                <span className="text-gray-200">Pull an AI model</span>
                <br />
                <code className="text-xs bg-black/50 px-2 py-0.5 rounded">
                  ollama pull llama3.1
                </code>
              </div>
            </li>
            <li className="flex gap-2">
              <span className="text-[#7c5cfc] font-bold">3.</span>
              <div>
                <span className="text-gray-200">Unzip and run Apeksha</span>
                <br />
                <code className="text-xs bg-black/50 px-2 py-0.5 rounded">
                  ./start.sh
                </code>
              </div>
            </li>
            <li className="flex gap-2">
              <span className="text-[#7c5cfc] font-bold">4.</span>
              <span className="text-gray-200">
                Open{" "}
                <code className="text-xs bg-black/50 px-2 py-0.5 rounded">
                  http://localhost:3000
                </code>
              </span>
            </li>
          </ol>
        </div>

        {/* Email capture */}
        <div className="mt-12 p-6 bg-[#111] border border-gray-800 rounded-xl">
          <p className="text-sm text-gray-400 mb-3">
            Get notified about updates and Pro features:
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded-lg text-sm outline-none focus:border-[#7c5cfc]"
            />
            <button className="px-4 py-2 bg-[#7c5cfc] rounded-lg text-sm font-medium hover:bg-[#9b7fff] transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
