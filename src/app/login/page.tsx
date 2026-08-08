"use client";

import { MOCK_USERS } from "@/data/auth-sample";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Building2, Command, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login, currentUser, isLoaded } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");

  useEffect(() => {
    if (isLoaded && currentUser) {
      router.replace("/admin");
    }
  }, [isLoaded, currentUser, router]);

  const handleLogin = async (email: string) => {
    setIsLoading(true);
    setSelectedEmail(email);
    try {
      await login(email, 1500);
      router.push("/admin");
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  if (!isLoaded || (isLoaded && currentUser)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.8)_0%,rgba(2,6,23,1)_100%)]" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/30 relative">
              <Command className="h-8 w-8 text-white" />
            </div>
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-sm font-medium text-slate-300 tracking-wide animate-pulse">
            Iniciando espacio de trabajo de Bellomo Desarrollos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative isolate overflow-hidden flex items-center justify-center px-4">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.8)_0%,rgba(2,6,23,1)_100%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[64px_64px] mask-[linear-gradient(to_bottom,white,transparent_90%)]" />

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="text-center mb-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 mb-6">
            <Command className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">EverProp Enterprise</h1>
          <p className="text-slate-400 text-sm">Seleccioná un perfil para continuar al simulador</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl shadow-black/50">
          <div className="space-y-4">
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user.email)}
                disabled={isLoading}
                className={cn(
                  "w-full flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 text-left transition-all hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  selectedEmail === user.email && "border-blue-500 bg-blue-500/10"
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 font-bold text-white shadow-inner">
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{user.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{user.title}</p>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                  {user.role}
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Uso exclusivo para demo de Bellomo Desarrollos
        </p>
      </div>
    </div>
  );
}
