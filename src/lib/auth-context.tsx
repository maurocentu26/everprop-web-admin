"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile, UserRole, MOCK_USERS } from "@/data/auth-sample";
import { authApi } from "@/lib/api";

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoaded: boolean;
  login: (email: string, password?: string, delayMs?: number) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapLaravelUserToProfile(laravelUser: any): UserProfile {
  let role: UserRole = "ADVISOR";
  if (laravelUser.role === "TENANT_ADMIN" || laravelUser.role === "SUPER_ADMIN") {
    role = "ADMIN";
  } else if (laravelUser.role === "SALES_MANAGER") {
    role = "ENGINEER";
  }

  const nameParts = (laravelUser.display_name || "Usuario").split(" ");
  const avatar = nameParts.length >= 2 
    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    : (laravelUser.display_name?.slice(0, 2) || "EP").toUpperCase();

  return {
    id: laravelUser.id,
    email: laravelUser.email,
    role,
    name: laravelUser.display_name,
    avatar,
    title: role === "ADMIN" ? "Director General" : role === "ENGINEER" ? "Directora de Obra" : "Asesor Comercial",
    permissions: laravelUser.capabilities || ["full_access"],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check localStorage or verify session on mount
    const storedUser = localStorage.getItem("everprop:user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const login = async (email: string, password = "password123", delayMs = 500) => {
    // 1. Try real Laravel API
    const response = await authApi.login({ email, password });

    if (response.data && !response.error) {
      const profile = mapLaravelUserToProfile(response.data);
      localStorage.setItem("everprop:user", JSON.stringify(profile));
      setCurrentUser(profile);
      return;
    }

    // 2. Fallback to mock users for development
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      await new Promise((res) => setTimeout(res, delayMs));
      localStorage.setItem("everprop:user", JSON.stringify(user));
      setCurrentUser(user);
      return;
    }

    throw new Error(response.error || "Credenciales inválidas.");
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
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
