/**
 * Apeksha AI - Authentication Layer
 * Simple JWT-based auth. Replace with Clerk/Auth0 for production.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro" | "team";
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const AUTH_KEY = "apeksha_auth";

class AuthManager {
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
      }
    } catch {}
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    localStorage.setItem(AUTH_KEY, JSON.stringify(this.state));
  }

  getState(): AuthState {
    return this.state;
  }

  getUser(): User | null {
    return this.state.user;
  }

  getToken(): string | null {
    return this.state.token;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token && data.user) {
        this.state = {
          user: data.user,
          token: data.token,
          isAuthenticated: true,
        };
        this.saveToStorage();
        return { success: true };
      }

      return { success: false, error: data.error || "Login failed" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async signup(name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.token && data.user) {
        this.state = {
          user: data.user,
          token: data.token,
          isAuthenticated: true,
        };
        this.saveToStorage();
        return { success: true };
      }

      return { success: false, error: data.error || "Signup failed" };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  logout() {
    this.state = { user: null, token: null, isAuthenticated: false };
    this.saveToStorage();
  }

  // For local/self-hosted mode - skip auth entirely
  setLocalMode() {
    this.state = {
      user: {
        id: "local",
        email: "local@apeksha.ai",
        name: "Local User",
        plan: "pro",
        createdAt: new Date().toISOString(),
      },
      token: "local-mode",
      isAuthenticated: true,
    };
    this.saveToStorage();
  }
}

export const auth = new AuthManager();

// Auto-set local mode for self-hosted deployment
if (typeof window !== "undefined") {
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (isLocal && !auth.isAuthenticated()) {
    auth.setLocalMode();
  }
}

export default auth;
