"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Command, Loader2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ─── Zod Schema ─────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio.")
    .email("Ingresá un email válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres."),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Component ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, currentUser, isLoaded } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isLoaded && currentUser) {
      router.replace("/admin");
    }
  }, [isLoaded, currentUser, router]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password, 500);
      router.push("/admin");
    } catch (err: any) {
      setIsSubmitting(false);
      setError("email", {
        type: "manual",
        message: err.message || "No se pudo iniciar sesión. Verificá tus credenciales.",
      });
    }
  };

  // ─── Loading / Already Authenticated ────────────────────────────────────
  if (!isLoaded || (isLoaded && currentUser)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // ─── Submitting Transition ──────────────────────────────────────────────
  if (isSubmitting) {
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
            Iniciando espacio de trabajo...
          </p>
        </div>
      </div>
    );
  }

  // ─── Login Form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-white relative isolate overflow-hidden flex items-center justify-center px-4">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.8)_0%,rgba(2,6,23,1)_100%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[64px_64px] mask-[linear-gradient(to_bottom,white,transparent_90%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 mb-6">
            <Command className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
            EverProp Enterprise
          </h1>
          <p className="text-slate-300 text-sm">
            Ingresá tus credenciales para acceder al panel
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl shadow-black/50"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.35 }}
              className="space-y-2"
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@empresa.com"
                  {...register("email")}
                  className={cn(
                    "h-12 w-full rounded-2xl border bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all",
                    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                    errors.email
                      ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-white/10 hover:border-white/20"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-xs font-medium pl-1">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.35 }}
              className="space-y-2"
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={cn(
                    "h-12 w-full rounded-2xl border bg-white/5 pl-11 pr-12 text-sm text-white placeholder:text-slate-500 outline-none transition-all",
                    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                    errors.password
                      ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-white/10 hover:border-white/20"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-400 text-xs font-medium pl-1">
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Remember Me + Forgot Password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500/30 focus:ring-offset-0 cursor-pointer accent-blue-600"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors select-none">
                  Recuérdame
                </span>
              </label>
              <button
                type="button"
                onClick={() =>
                  toast.info("Funcionalidad próximamente", {
                    description:
                      "El recupero de contraseña estará disponible en una futura actualización.",
                  })
                }
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium focus:outline-none focus:underline"
              >
                Olvidé mi contraseña
              </button>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.35 }}
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full h-12 rounded-2xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all",
                  "hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-500/30",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950",
                  "active:translate-y-0 active:shadow-blue-600/20",
                  "disabled:opacity-60 disabled:pointer-events-none"
                )}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="mt-8 text-center text-xs text-slate-500"
        >
          EverProp Enterprise &middot; Demo
        </motion.p>
      </motion.div>
    </div>
  );
}
