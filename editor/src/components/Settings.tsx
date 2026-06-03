"use client";

import { useState } from "react";
import { X, Cpu, CreditCard, User, Palette, Keyboard } from "lucide-react";

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: <Cpu size={14} /> },
    { id: "account", label: "Account", icon: <User size={14} /> },
    { id: "billing", label: "Billing", icon: <CreditCard size={14} /> },
    { id: "theme", label: "Theme", icon: <Palette size={14} /> },
    { id: "shortcuts", label: "Shortcuts", icon: <Keyboard size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[700px] h-[500px] bg-editor-sidebar border border-editor-border rounded-xl shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-editor-border p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Settings</h2>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition ${
                  activeTab === tab.id
                    ? "bg-editor-accent/20 text-white"
                    : "text-gray-400 hover:bg-editor-active hover:text-gray-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded hover:bg-editor-active text-gray-500"
          >
            <X size={16} />
          </button>

          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "account" && <AccountSettings />}
          {activeTab === "billing" && <BillingSettings />}
          {activeTab === "theme" && <ThemeSettings />}
          {activeTab === "shortcuts" && <ShortcutSettings />}
        </div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">General</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">AI Model</label>
          <select className="w-full px-3 py-2 bg-editor-bg border border-editor-border rounded text-sm text-gray-200">
            <option value="llama3.1">Llama 3.1 (8B) — General purpose</option>
            <option value="deepseek-coder-v2:16b">DeepSeek Coder V2 (16B) — Best for code</option>
            <option value="qwen2.5:14b">Qwen 2.5 (14B) — Best quality</option>
            <option value="mistral">Mistral (7B) — Fast</option>
            <option value="codellama">CodeLlama (7B) — Code only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Editor Font Size</label>
          <input
            type="number"
            defaultValue={14}
            min={10}
            max={24}
            className="w-24 px-3 py-2 bg-editor-bg border border-editor-border rounded text-sm text-gray-200"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">AI Autocomplete</p>
            <p className="text-xs text-gray-500">Show ghost text suggestions as you type</p>
          </div>
          <ToggleSwitch defaultChecked={true} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Minimap</p>
            <p className="text-xs text-gray-500">Show code minimap on the right</p>
          </div>
          <ToggleSwitch defaultChecked={true} />
        </div>
      </div>
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Account</h3>
      <div className="p-4 bg-editor-bg rounded-lg border border-editor-border">
        <p className="text-sm text-green-400 mb-1">✓ Local Mode Active</p>
        <p className="text-xs text-gray-500">
          You are running Apeksha locally. No account needed.
          All data stays on your machine.
        </p>
      </div>
      <div className="text-sm text-gray-500">
        <p>For cloud deployment, configure auth in the backend settings.</p>
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Plans & Billing</h3>

      <div className="grid grid-cols-3 gap-3">
        {/* Free */}
        <div className="p-4 bg-editor-bg rounded-lg border border-editor-border">
          <h4 className="font-semibold text-gray-300">Free</h4>
          <p className="text-2xl font-bold text-white mt-1">$0</p>
          <ul className="mt-3 space-y-1 text-xs text-gray-500">
            <li>• 20 messages/day</li>
            <li>• 3 projects</li>
            <li>• Basic tools</li>
          </ul>
        </div>

        {/* Pro */}
        <div className="p-4 bg-editor-bg rounded-lg border-2 border-editor-accent">
          <h4 className="font-semibold text-editor-accent">Pro</h4>
          <p className="text-2xl font-bold text-white mt-1">$12<span className="text-sm text-gray-500">/mo</span></p>
          <ul className="mt-3 space-y-1 text-xs text-gray-400">
            <li>• Unlimited messages</li>
            <li>• All models</li>
            <li>• Long-term memory</li>
            <li>• Knowledge base</li>
            <li>• Autocomplete</li>
          </ul>
        </div>

        {/* Team */}
        <div className="p-4 bg-editor-bg rounded-lg border border-editor-border">
          <h4 className="font-semibold text-gray-300">Team</h4>
          <p className="text-2xl font-bold text-white mt-1">$25<span className="text-sm text-gray-500">/user</span></p>
          <ul className="mt-3 space-y-1 text-xs text-gray-500">
            <li>• Everything in Pro</li>
            <li>• Team workspace</li>
            <li>• Admin dashboard</li>
            <li>• Self-hosted</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-gray-600">
        Self-hosted mode: All features are unlocked when running locally.
      </p>
    </div>
  );
}

function ThemeSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Theme</h3>
      <div className="grid grid-cols-3 gap-3">
        <button className="p-4 bg-[#1e1e1e] rounded-lg border-2 border-editor-accent text-center">
          <div className="w-full h-8 bg-[#0d0d0d] rounded mb-2" />
          <span className="text-xs text-gray-300">Dark (Default)</span>
        </button>
        <button className="p-4 bg-[#0d1117] rounded-lg border border-editor-border text-center">
          <div className="w-full h-8 bg-[#010409] rounded mb-2" />
          <span className="text-xs text-gray-300">GitHub Dark</span>
        </button>
        <button className="p-4 bg-[#282c34] rounded-lg border border-editor-border text-center">
          <div className="w-full h-8 bg-[#21252b] rounded mb-2" />
          <span className="text-xs text-gray-300">One Dark</span>
        </button>
      </div>
    </div>
  );
}

function ShortcutSettings() {
  const shortcuts = [
    { keys: "⌘K", action: "AI Inline Edit" },
    { keys: "⌘L", action: "Toggle AI Chat" },
    { keys: "⌘P", action: "Command Palette" },
    { keys: "⌘B", action: "Toggle Sidebar" },
    { keys: "⌘`", action: "Toggle Terminal" },
    { keys: "⌘S", action: "Save File" },
    { keys: "⌘Shift+P", action: "Commands" },
    { keys: "⌘/", action: "Toggle Comment" },
    { keys: "⌘D", action: "Select Next Match" },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
      <div className="space-y-1">
        {shortcuts.map((s) => (
          <div key={s.action} className="flex items-center justify-between py-2 border-b border-editor-border/50">
            <span className="text-sm text-gray-300">{s.action}</span>
            <kbd className="px-2 py-1 bg-editor-bg rounded text-xs text-gray-400 border border-editor-border">
              {s.keys}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      onClick={() => setChecked(!checked)}
      className={`relative w-10 h-5 rounded-full transition ${
        checked ? "bg-editor-accent" : "bg-editor-border"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
