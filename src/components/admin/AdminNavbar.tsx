"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import { Bell, Download, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NewLeadDrawer } from "@/components/admin/NewLeadDrawer";
import { GlobalSearch } from "@/components/admin/navbar/GlobalSearch";
import { useCurrentSession } from "@/hooks/use-current-session";
import { useAuth } from "@/lib/auth-context";
import { isMockDataMode } from "@/lib/data-mode";
import { loadNotifications, markAllAsRead, type AppNotification } from "@/lib/notifications";
import { cn } from "@/lib/utils";

type Props = {
  companyName?: string;
  className?: string;
};

export function AdminNavbar({ companyName = "Bellomo", className }: Props) {
  const router = useRouter();
  const { user, isEngineer } = useCurrentSession();
  const { logout } = useAuth();
  const [isLeadDrawerOpen, setIsLeadDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const bellControls = useAnimation();
  const prevUnreadRef = useRef(0);

  useEffect(() => {
    if (!isMockDataMode || !user?.id) return;

    const refreshNotifications = () => {
      setNotifications(loadNotifications().filter((notification) => notification.targetUserId === user.id));
    };

    refreshNotifications();
    window.addEventListener("everprop_notifications_updated", refreshNotifications);
    const channel = new BroadcastChannel("everprop_notifications");
    channel.onmessage = refreshNotifications;

    return () => {
      window.removeEventListener("everprop_notifications_updated", refreshNotifications);
      channel.close();
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    if (!isMockDataMode) return;
    if (unreadCount > prevUnreadRef.current) {
      void bellControls.start({
        rotate: [0, -15, 15, -10, 10, -5, 5, 0],
        transition: { duration: 0.5, ease: "easeInOut" },
      });
    }
    prevUnreadRef.current = unreadCount;
  }, [bellControls, unreadCount]);

  const handleMarkAsRead = () => {
    if (!user?.id) return;
    markAllAsRead(user.id);
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  };

  const userInfo = {
    name: user?.name || "Cargando...",
    role: user?.title || "",
    initials: user?.avatar || "??",
  };

  return (
    <>
      <header className={cn("z-30 flex flex-col gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-4", className)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger />
            <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-black">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-blue-600 text-xs font-bold text-white">IA</div>
              <div className="flex max-w-25 flex-col sm:max-w-none">
                <span className="text-[10px] font-bold uppercase leading-none tracking-tighter text-gray-600">Tenant</span>
                <span className="truncate leading-tight">{companyName}</span>
              </div>
            </div>
            <span
              className={cn(
                "hidden rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider sm:inline-flex",
                isMockDataMode ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800",
              )}
            >
              {isMockDataMode ? "QA mock" : "API"}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            {isMockDataMode && (
              <>
                <Button variant="outline" size="sm" className="hidden items-center gap-2 md:inline-flex">
                  <Download className="h-4 w-4" /> Exportar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden items-center gap-2 md:inline-flex"
                  onClick={() => router.push("/admin/properties/new")}
                >
                  <Plus className="h-4 w-4" /> Propiedad
                </Button>
                {!isEngineer && (
                  <Button
                    size="sm"
                    className="hidden items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 md:inline-flex"
                    onClick={() => setIsLeadDrawerOpen(true)}
                  >
                    <Plus className="h-4 w-4" /> Lead
                  </Button>
                )}

                <DropdownMenu onOpenChange={(open) => open && handleMarkAsRead()}>
                  <DropdownMenuTrigger
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
                    aria-label="Notificaciones mock"
                  >
                    <motion.div animate={bellControls}>
                      <Bell className="h-4 w-4" />
                    </motion.div>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-500"
                      >
                        <span className="text-[8px] font-black leading-none text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
                      </motion.span>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="border-b pb-2 font-normal">
                        <p className="text-sm font-bold">Notificaciones mock</p>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <div className="max-h-64 overflow-y-auto py-1">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-center text-sm text-slate-500">No hay notificaciones</div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn("border-b px-4 py-3 text-sm last:border-0", notification.read ? "opacity-60" : "bg-blue-50/50")}
                          >
                            <p className="font-medium leading-tight text-slate-800">{notification.message}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(notification.timestamp).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger className="relative ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
                <Avatar className="h-full w-full">
                  <AvatarFallback className="bg-blue-600 text-xs font-bold text-white">{userInfo.initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userInfo.name}</p>
                      <p className="text-xs leading-none text-slate-500">{userInfo.role}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void logout()} className="cursor-pointer text-rose-600">
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isMockDataMode && <GlobalSearch />}
      </header>

      {isMockDataMode && <NewLeadDrawer open={isLeadDrawerOpen} onOpenChange={setIsLeadDrawerOpen} />}
    </>
  );
}
