"use client";

import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import { useEditorStore, ChatMessage } from "@/store/editorStore";

export function AIChat() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatMessages, chatLoading, addChatMessage, setChatLoading, clearChat } =
    useEditorStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || chatLoading) return;

    setInput("");

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    addChatMessage(userMsg);
    setChatLoading(true);

    try {
      // Call Apeksha AI backend
      const res = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Sorry, I couldn't process that.",
        tools: data.tools,
        timestamp: Date.now(),
      };
      addChatMessage(assistantMsg);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "⚠️ Cannot reach Apeksha backend. Make sure `python web_ui.py` is running.",
        timestamp: Date.now(),
      };
      addChatMessage(errorMsg);
    }

    setChatLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-editor-bg">
      {/* Header */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-editor-border bg-editor-sidebar">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-editor-accent" />
          <span className="text-sm font-medium text-gray-300">Apeksha AI</span>
        </div>
        <button
          onClick={clearChat}
          className="p-1 rounded hover:bg-editor-active text-gray-500 hover:text-gray-300"
          title="Clear chat"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">🙏</p>
            <p className="text-sm text-gray-500">
              Ask me to write code, explain concepts, or build features.
            </p>
            <div className="mt-4 space-y-2">
              {[
                "Write a function to sort an array",
                "Explain this code to me",
                "Add dark mode to this page",
                "Create a REST API endpoint",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="block w-full text-left text-xs px-3 py-2 rounded bg-editor-sidebar border border-editor-border hover:border-editor-accent text-gray-400 hover:text-gray-200 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-editor-accent/20 text-gray-200 rounded-br-sm"
                  : "bg-editor-sidebar border border-editor-border text-gray-300 rounded-bl-sm"
              }`}
            >
              {/* Tool activity */}
              {msg.tools && msg.tools.length > 0 && (
                <div className="mb-2 text-xs text-yellow-500/80 font-mono">
                  {msg.tools.map((tool, i) => (
                    <div key={i} className="truncate">
                      {tool.content}
                    </div>
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {chatLoading && (
          <div className="flex justify-start">
            <div className="bg-editor-sidebar border border-editor-border rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-editor-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-editor-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-editor-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-editor-border">
        <div className="flex items-end gap-2 bg-editor-sidebar rounded-lg border border-editor-border focus-within:border-editor-accent transition p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask Apeksha..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-600 resize-none max-h-32"
          />
          <button
            onClick={sendMessage}
            disabled={chatLoading || !input.trim()}
            className="p-1.5 rounded bg-editor-accent hover:bg-editor-accent-hover disabled:opacity-40 text-white transition"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-1 text-center">
          100% local · Your data stays on your machine
        </p>
      </div>
    </div>
  );
}
