"use client";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🙏</span>
          <span className="font-bold text-lg">Apeksha AI</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-400">
          <a href="#features" className="hidden md:block hover:text-white transition">Features</a>
          <a href="#pricing" className="hidden md:block hover:text-white transition">Pricing</a>
          <a
            href="/download"
            className="px-4 py-2 bg-[#7c5cfc] rounded-lg hover:bg-[#9b7fff] transition font-medium text-white"
          >
            Download Free
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 md:px-8 py-16 md:py-24 max-w-4xl mx-auto">
        <div className="inline-block px-3 py-1 rounded-full text-xs bg-[#7c5cfc]/10 text-[#7c5cfc] border border-[#7c5cfc]/20 mb-6">
          100% Local · Free · Private — Your data never leaves your machine
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          AI Code Editor That{" "}
          <span className="text-[#7c5cfc]">Builds Software</span>
          {" "}For You
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Apeksha is a local AI-powered code editor. Tell it what to build —
          it writes the code, runs it, fixes errors, and ships. No cloud. No API keys. Just works.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <a
            href="/download"
            className="w-full md:w-auto px-8 py-3 bg-[#7c5cfc] rounded-lg hover:bg-[#9b7fff] transition font-semibold text-lg text-center"
          >
            Download Free →
          </a>
          <a
            href="https://github.com"
            className="w-full md:w-auto px-8 py-3 border border-gray-700 rounded-lg hover:border-gray-500 transition text-gray-300 text-center"
          >
            ⭐ Star on GitHub
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-600">
          Works on macOS, Windows, and Linux · Requires 8GB RAM
        </p>
      </section>

      {/* Demo Screenshot */}
      <section className="px-6 md:px-8 py-8 max-w-5xl mx-auto">
        <div className="rounded-xl border border-gray-800 bg-[#1e1e1e] overflow-hidden shadow-2xl">
          <div className="h-8 bg-[#252526] flex items-center gap-2 px-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28ca42]" />
            </div>
            <span className="text-xs text-gray-500 ml-2">Apeksha AI Editor</span>
          </div>
          <div className="grid grid-cols-12 h-64 md:h-80">
            {/* Sidebar */}
            <div className="col-span-2 bg-[#252526] border-r border-gray-700 p-2">
              <p className="text-[10px] text-gray-500 uppercase mb-2">Explorer</p>
              <div className="space-y-1 text-[10px] text-gray-400">
                <p>📁 src/</p>
                <p className="pl-3">📄 app.js</p>
                <p className="pl-3">📄 index.html</p>
                <p className="pl-3">📄 style.css</p>
                <p>📄 package.json</p>
              </div>
            </div>
            {/* Editor */}
            <div className="col-span-6 bg-[#1e1e1e] p-3 font-mono text-[10px] md:text-xs text-gray-300">
              <p><span className="text-purple-400">function</span> <span className="text-yellow-300">buildApp</span>() {"{"}</p>
              <p className="pl-4"><span className="text-purple-400">const</span> app = <span className="text-yellow-300">express</span>();</p>
              <p className="pl-4">app.<span className="text-blue-300">get</span>(<span className="text-green-400">&apos;/&apos;</span>, (req, res) =&gt; {"{"}</p>
              <p className="pl-8">res.<span className="text-blue-300">json</span>({"{"} <span className="text-green-400">status</span>: <span className="text-green-400">&apos;ok&apos;</span> {"}"});</p>
              <p className="pl-4">{"})"}</p>
              <p className="pl-4">app.<span className="text-blue-300">listen</span>(<span className="text-orange-300">3000</span>);</p>
              <p>{"}"}</p>
            </div>
            {/* AI Chat */}
            <div className="col-span-4 bg-[#0f0f0f] border-l border-gray-700 p-3">
              <p className="text-[10px] text-[#7c5cfc] font-medium mb-2">✨ Apeksha AI</p>
              <div className="space-y-2">
                <div className="bg-[#1a1a2e] rounded p-2 text-[10px] text-gray-300">
                  Build a REST API with Express that has user auth
                </div>
                <div className="bg-[#252526] rounded p-2 text-[10px] text-gray-400">
                  🔧 Creating project structure...<br/>
                  ✅ Created 5 files<br/>
                  🔧 Installing dependencies...<br/>
                  ✅ Server running on port 3000
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-8 py-16 md:py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Why developers love Apeksha
        </h2>
        <p className="text-center text-gray-500 mb-12 md:mb-16">
          Professional AI coding that respects your privacy.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-5 md:p-6 rounded-xl border border-gray-800 bg-[#111] hover:border-[#7c5cfc]/30 transition"
            >
              <span className="text-2xl md:text-3xl mb-3 md:mb-4 block">{f.icon}</span>
              <h3 className="font-semibold text-base md:text-lg mb-2">{f.title}</h3>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="px-6 md:px-8 py-16 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-[#7c5cfc]/10 flex items-center justify-center mx-auto mb-4 text-lg font-bold text-[#7c5cfc]">1</div>
              <h3 className="font-semibold mb-2">Install & Run</h3>
              <p className="text-sm text-gray-500">Download, unzip, run one command. AI starts in seconds.</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-[#7c5cfc]/10 flex items-center justify-center mx-auto mb-4 text-lg font-bold text-[#7c5cfc]">2</div>
              <h3 className="font-semibold mb-2">Tell It What to Build</h3>
              <p className="text-sm text-gray-500">Type in plain English. Apeksha writes the code, creates files, installs dependencies.</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-[#7c5cfc]/10 flex items-center justify-center mx-auto mb-4 text-lg font-bold text-[#7c5cfc]">3</div>
              <h3 className="font-semibold mb-2">Ship It</h3>
              <p className="text-sm text-gray-500">Run, test, and deploy — all from within the editor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-center text-gray-500 mb-12">
            Free forever. Pay only if you want extra features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="p-6 md:p-8 rounded-xl border border-gray-800 bg-[#111]">
              <h3 className="font-semibold text-lg">Free</h3>
              <p className="text-3xl md:text-4xl font-bold mt-2">₹0</p>
              <p className="text-sm text-gray-500 mt-1">forever</p>
              <ul className="mt-6 space-y-2 text-sm text-gray-400">
                <li>✓ Full code editor</li>
                <li>✓ AI assistant (local Ollama)</li>
                <li>✓ Build any project</li>
                <li>✓ Terminal, file explorer</li>
                <li>✓ Web search</li>
                <li>✓ Unlimited local use</li>
              </ul>
              <a href="/download" className="block w-full mt-8 py-2.5 border border-gray-700 rounded-lg hover:bg-gray-800 transition text-sm text-center">
                Download Free
              </a>
            </div>

            {/* Pro */}
            <div className="p-6 md:p-8 rounded-xl border-2 border-[#7c5cfc] bg-[#111] relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#7c5cfc] text-xs rounded-full font-medium">
                Best Value
              </span>
              <h3 className="font-semibold text-lg text-[#7c5cfc]">Pro</h3>
              <p className="text-3xl md:text-4xl font-bold mt-2">₹999</p>
              <p className="text-sm text-gray-500 mt-1">one-time payment</p>
              <ul className="mt-6 space-y-2 text-sm text-gray-300">
                <li>✓ Everything in Free</li>
                <li>✓ AI autocomplete (ghost text)</li>
                <li>✓ Long-term memory</li>
                <li>✓ Knowledge base (learn from docs)</li>
                <li>✓ All AI models supported</li>
                <li>✓ Priority email support</li>
                <li>✓ Lifetime updates</li>
              </ul>
              <a href="#" className="block w-full mt-8 py-2.5 bg-[#7c5cfc] rounded-lg hover:bg-[#9b7fff] transition text-sm font-medium text-center">
                Buy Pro License
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-8 py-16 bg-[#0d0d0d]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">FAQ</h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-gray-800 pb-4">
                <h3 className="font-medium text-gray-200 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-8 py-16 md:py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Start building with Apeksha</h2>
        <p className="text-gray-500 mb-8">Free, local, and private. Download in 30 seconds.</p>
        <a
          href="/download"
          className="inline-block px-8 py-3 bg-[#7c5cfc] rounded-lg hover:bg-[#9b7fff] transition font-semibold text-lg"
        >
          Download Free →
        </a>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-8 py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🙏</span>
            <span className="font-semibold">Apeksha AI</span>
            <span className="text-xs text-gray-600">— Hope that thinks.</span>
          </div>
          <div className="text-xs text-gray-600">
            Made with ❤️ in India · © 2024 Apeksha AI
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "🧠",
    title: "AI That Codes",
    description: "Tell it what to build. It writes complete working code, creates files, installs packages, and runs everything.",
  },
  {
    icon: "🔒",
    title: "100% Private",
    description: "Runs entirely on your machine. Zero data sent anywhere. No API keys, no accounts, no tracking.",
  },
  {
    icon: "⚡",
    title: "⌘K Inline Edit",
    description: "Select any code, press ⌘K, describe the change in English. AI rewrites it instantly.",
  },
  {
    icon: "💾",
    title: "Long-Term Memory",
    description: "Remembers your preferences, project details, and past conversations across sessions.",
  },
  {
    icon: "📚",
    title: "Learns Your Docs",
    description: "Feed it PDFs, code, docs. It builds a knowledge base and answers from your own data.",
  },
  {
    icon: "🌐",
    title: "Web Search",
    description: "Search the web for docs, solutions, and latest information — all from within the editor.",
  },
  {
    icon: "🖥️",
    title: "Full IDE",
    description: "Monaco Editor (same as VS Code), file explorer, terminal, tabs. Everything you expect.",
  },
  {
    icon: "🆓",
    title: "Free & Open Source",
    description: "Core editor is free forever. Self-host, modify, or contribute. MIT licensed.",
  },
  {
    icon: "🇮🇳",
    title: "Made in India",
    description: "Built with pride in India. Named 'Apeksha' (अपेक्षा) — meaning hope and expectation.",
  },
];

const faqs = [
  { q: "Is it really free?", a: "Yes. The core editor with AI is completely free. Pro features like memory and autocomplete are optional paid upgrades." },
  { q: "Does my code go to any server?", a: "No. Everything runs 100% on your local machine. The AI model (Ollama) runs locally too. Zero data leaves your computer." },
  { q: "What computer do I need?", a: "Any Mac, Windows, or Linux with 8GB RAM. 16GB recommended for larger AI models. Works on both Intel and Apple Silicon." },
  { q: "Which AI models does it support?", a: "Llama 3.1, DeepSeek Coder, Qwen 2.5, Mistral, CodeLlama, and any model available on Ollama." },
  { q: "How is this different from Cursor/Copilot?", a: "Apeksha runs 100% locally (no cloud dependency), is free/open source, and you own all your data. No monthly subscription needed for basic use." },
  { q: "Can it build full applications?", a: "Yes. Tell it 'build a React todo app' or 'create a Flask API' and it scaffolds the entire project, installs dependencies, and runs it." },
];
