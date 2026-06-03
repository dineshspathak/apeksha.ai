/**
 * Apeksha AI - API Client
 * Centralized API calls to the backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

class ApekshaAPI {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // ─── AI Chat ───────────────────────────────────────────
  async chat(message: string) {
    return this.request("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  async resetChat() {
    return this.request("/api/reset", { method: "POST" });
  }

  async getStatus() {
    return this.request("/api/status");
  }

  // ─── File System ───────────────────────────────────────
  async getFileTree(dir: string = "") {
    return this.request(`/api/files/tree?dir=${encodeURIComponent(dir)}`);
  }

  async readFile(path: string) {
    return this.request(`/api/files/read?path=${encodeURIComponent(path)}`);
  }

  async writeFile(path: string, content: string) {
    return this.request("/api/files/write", {
      method: "POST",
      body: JSON.stringify({ path, content }),
    });
  }

  async createFile(path: string, content: string = "") {
    return this.request("/api/files/create", {
      method: "POST",
      body: JSON.stringify({ path, content }),
    });
  }

  async deleteFile(path: string) {
    return this.request(`/api/files/delete?path=${encodeURIComponent(path)}`, {
      method: "DELETE",
    });
  }

  async renameFile(oldPath: string, newPath: string) {
    return this.request("/api/files/rename", {
      method: "POST",
      body: JSON.stringify({ old_path: oldPath, new_path: newPath }),
    });
  }

  async createFolder(path: string) {
    return this.request("/api/files/folder", {
      method: "POST",
      body: JSON.stringify({ path }),
    });
  }

  async searchFiles(query: string) {
    return this.request(`/api/files/search?q=${encodeURIComponent(query)}`);
  }

  // ─── Terminal ──────────────────────────────────────────
  async runCommand(command: string, cwd?: string) {
    return this.request("/api/terminal/run", {
      method: "POST",
      body: JSON.stringify({ command, cwd }),
    });
  }

  // ─── AI Features ──────────────────────────────────────
  async autocomplete(codeBefore: string, codeAfter: string, language: string, filename: string) {
    return this.request("/api/ai/autocomplete", {
      method: "POST",
      body: JSON.stringify({ codeBefore, codeAfter, language, filename }),
    });
  }

  async editCode(code: string, instruction: string, language: string) {
    return this.request("/api/ai/edit", {
      method: "POST",
      body: JSON.stringify({ code, instruction, language }),
    });
  }

  async explainCode(code: string) {
    return this.request("/api/ai/explain", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  async ingestKnowledge(directory?: string) {
    return this.request("/api/ingest", {
      method: "POST",
      body: JSON.stringify({ directory }),
    });
  }
}

export const api = new ApekshaAPI();
export default api;
