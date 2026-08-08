"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile, MOCK_USERS } from "@/data/auth-sample";

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoaded: boolean;
  login: (email: string, delayMs?: number) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem("everprop:user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    } else {
      // Default fallback for demo purposes if nothing in storage
      // In a real app, this would redirect to login. For now, we will leave it null
      // so the app can redirect to login.
    }
    setIsLoaded(true);
  }, []);

  const login = async (email: string, delayMs = 1500) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find((u) => u.email === email);
        if (user) {
          localStorage.setItem("everprop:user", JSON.stringify(user));
          setCurrentUser(user);
          resolve();
        } else {
          reject(new Error("Usuario no encontrado"));
        }
      }, delayMs);
    });
  };

  const logout = () => {
    localStorage.removeItem("everprop:user");
    setCurrentUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
