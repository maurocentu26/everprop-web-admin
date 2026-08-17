"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MOCK_USERS, type UserProfile } from "@/data/auth-sample";
import { currentEverpropUser, loginEverprop, logoutEverprop } from "@/lib/everprop-api";

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoaded: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: (email: string, delayMs?: number) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEMO_STORAGE_KEY = "everprop:demo-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const apiUser = await currentEverpropUser();
        if (!active) return;

        if (apiUser) {
          localStorage.removeItem(DEMO_STORAGE_KEY);
          setCurrentUser(apiUser);
          return;
        }
      } catch {
        // API connectivity is surfaced by the integration status component.
      }

      const storedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
      if (storedDemo && active) {
        try {
          const parsed = JSON.parse(storedDemo) as UserProfile;
          if (parsed.source === "demo") setCurrentUser(parsed);
        } catch {
          localStorage.removeItem(DEMO_STORAGE_KEY);
        }
      }
    }

    void restoreSession().finally(() => {
      if (active) setIsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const user = await loginEverprop(email, password);
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setCurrentUser(user);
  };

  const loginDemo = async (email: string, delayMs = 400) => {
    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
    const user = MOCK_USERS.find((candidate) => candidate.email === email);
    if (!user) throw new Error("Perfil demo no encontrado.");
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = async () => {
    if (currentUser?.source === "api") {
      try {
        await logoutEverprop();
      } catch {
        // The local state must still be cleared if the API session already expired.
      }
    }

    localStorage.removeItem(DEMO_STORAGE_KEY);
    setCurrentUser(null);
    window.location.assign("/login");
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoaded, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
