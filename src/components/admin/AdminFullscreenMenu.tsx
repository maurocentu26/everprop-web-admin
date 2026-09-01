"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Command, LogOut, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { navigationGroups } from "@/components/sidebar/navigation";
import { quickActionsConfig } from "@/components/sidebar/quick-actions";
import { useCurrentSession } from "@/hooks/use-current-session";
import { useAuth } from "@/lib/auth-context";
import { isMockDataMode } from "@/lib/data-mode";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type AdminFullscreenMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminFullscreenMenu({ open, onOpenChange }: AdminFullscreenMenuProps) {
  const pathname = usePathname();
  const { isEngineer } = useCurrentSession();
  const { currentUser, logout } = useAuth();

  const filteredGroups = useMemo(() => {
    if (!isMockDataMode) {
      const allowed = new Set(["/admin#dashboard", "/admin/desarrollos", "/admin/properties"]);
      return navigationGroups
        .map((group) => ({
          ...group,
          items: group.items
            .filter((item) => allowed.has(item.href))
            .map((item) => ({ ...item, children: undefined })),
        }))
        .filter((group) => group.items.length > 0);
    }

    if (isEngineer) {
      return navigationGroups
        .map((group) => {
          if (group.label === "Activos Comerciales") {
            return { ...group, items: group.items.filter((item) => item.title !== "Agenda") };
          }
          return group;
        })
        .filter((group) => group.label !== "Comercializadora");
    }

    return navigationGroups;
  }, [isEngineer]);

  const isActive = (href: string, matchPath?: string) => {
    if (matchPath) return pathname.startsWith(matchPath);
    return pathname === href.split("#")[0];
  };

  const closeMenu = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        fullScreen
        showCloseButton={false}
        className="flex bg-slate-950 text-white"
      >
        <DialogTitle className="sr-only">Menú principal</DialogTitle>
        <DialogDescription className="sr-only">
          Navegación principal y acciones disponibles en EverProp.
        </DialogDescription>

        <div className="flex h-dvh min-h-0 w-full flex-col">
          <header className="shrink-0 border-b border-white/10 bg-slate-950/95 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur sm:px-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-[min(94vw,2800px)] items-center justify-between gap-4">
              <Link
                href="/admin#dashboard"
                onClick={closeMenu}
                className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/70"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25 sm:size-14">
                  <Command className="size-6 sm:size-7" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xl font-bold tracking-tight sm:text-2xl">EverProp</span>
                  <span className="block truncate text-base text-slate-300">Bellomo · Menú principal</span>
                </span>
              </Link>

              <div className="flex shrink-0 items-center gap-2">
                <ThemeToggle compact className="border-slate-600 bg-slate-900 text-white hover:bg-slate-800 hover:text-white sm:w-auto sm:px-4" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeMenu}
                  className="h-12 shrink-0 gap-2 border-slate-600 bg-slate-900 px-4 text-base font-semibold text-white hover:bg-slate-800 hover:text-white sm:h-14 sm:px-5"
                >
                  <X className="size-5" aria-hidden="true" />
                  <span className="hidden sm:inline">Cerrar</span>
                </Button>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div className="mx-auto flex min-h-full w-full max-w-[min(94vw,2800px)] flex-col justify-center gap-8">
              {isMockDataMode && (
                <section aria-labelledby="menu-actions-title">
                  <h2 id="menu-actions-title" className="mb-4 text-base font-bold uppercase tracking-[0.14em] text-slate-300 sm:text-lg">
                    Acciones rápidas
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {quickActionsConfig.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <Link
                          key={action.title}
                          href={action.href}
                          onClick={closeMenu}
                          className={cn(
                            "flex min-h-20 items-center gap-4 rounded-2xl border border-white/10 px-5 py-4 text-lg font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/70 sm:min-h-24 sm:text-xl",
                            action.className,
                          )}
                        >
                          <ActionIcon className="size-6 shrink-0" aria-hidden="true" />
                          <span>{action.title}</span>
                          <ChevronRight className="ml-auto size-5 opacity-70" aria-hidden="true" />
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              <nav aria-label="Navegación administrativa" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredGroups.map((group) => (
                  <section key={group.label} className="rounded-3xl border border-white/10 bg-slate-900 p-4 shadow-xl sm:p-6 2xl:p-8">
                    <h2 className="mb-4 text-base font-bold uppercase tracking-[0.14em] text-slate-300 sm:text-lg">
                      {group.label}
                    </h2>
                    <div className="space-y-3">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href, item.matchPath);
                        return (
                          <div key={item.title} className="space-y-2">
                            <Link
                              href={item.href}
                              onClick={closeMenu}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "flex min-h-16 items-center gap-4 rounded-2xl border px-4 py-3 text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/70 sm:min-h-18 sm:px-5 sm:text-xl",
                                active
                                  ? "border-white bg-white text-slate-950 shadow-lg"
                                  : "border-white/10 bg-slate-950 text-white hover:border-white/25 hover:bg-slate-800",
                              )}
                            >
                              <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", active ? "bg-blue-100 text-blue-700" : "bg-white/10 text-blue-300")}>
                                <Icon className="size-5" aria-hidden="true" />
                              </span>
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto size-5 opacity-70" aria-hidden="true" />
                            </Link>

                            {item.children?.map((child) => {
                              const ChildIcon = child.icon;
                              return (
                                <Link
                                  key={child.title}
                                  href={child.href}
                                  onClick={closeMenu}
                                  className="ml-4 flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 text-base font-medium text-slate-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/70 sm:ml-8"
                                >
                                  {ChildIcon && <ChildIcon className="size-5 text-blue-300" aria-hidden="true" />}
                                  {child.title}
                                </Link>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </nav>
            </div>
          </div>

          <footer className="shrink-0 border-t border-white/10 bg-slate-950 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-[min(94vw,2800px)] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-white">{currentUser?.name || "Usuario"}</p>
                <p className="truncate text-base text-slate-300">{currentUser?.title || "EverProp"}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => void logout()}
                className="h-12 w-full gap-2 border-rose-400/40 bg-rose-500/10 px-5 text-base font-semibold text-rose-100 hover:bg-rose-500/20 hover:text-white sm:w-auto"
              >
                <LogOut className="size-5" aria-hidden="true" />
                Cerrar sesión
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
