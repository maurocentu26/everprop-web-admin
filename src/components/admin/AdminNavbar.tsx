"use client";

import { Bell, Plus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { GlobalSearch } from "./navbar/GlobalSearch";
import { useAuth } from "@/lib/auth-context";
import { useCurrentSession } from "@/hooks/use-current-session";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";

type Props = {
  companyName?: string;
  userName?: string;
  className?: string;
};

import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { NewLeadDrawer } from "./NewLeadDrawer";
import { loadNotifications, markAllAsRead, AppNotification } from "@/lib/notifications";

export function AdminNavbar({
  companyName = "Comercializadora A",
  className,
}: Props) {
  const router = useRouter();
  const [isLeadDrawerOpen, setIsLeadDrawerOpen] = useState(false);
  const { user, isEngineer } = useCurrentSession();
  const { logout } = useAuth();
  
  const bellControls = useAnimation();
  const prevUnreadRef = useRef(0);
  
  const userInfo = {
    name: user?.name || "Cargando...",
    role: user?.title || "",
    initials: user?.avatar || "??"
  };

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  useEffect(() => {
    if (!user?.id) return;
    
    const refreshNotifications = () => {
      const all = loadNotifications();
      setNotifications(all.filter(n => n.targetUserId === user.id));
    };
    
    refreshNotifications();
    
    const onStorageOrEvent = () => refreshNotifications();
    
    window.addEventListener("everprop_notifications_updated", onStorageOrEvent);
    const channel = new BroadcastChannel("everprop_notifications");
    channel.onmessage = onStorageOrEvent;
    
    return () => {
      window.removeEventListener("everprop_notifications_updated", onStorageOrEvent);
      channel.close();
    };
  }, [user?.id]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Trigger shake when unread count increases
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      bellControls.start({
        rotate: [0, -15, 15, -10, 10, -5, 5, 0],
        transition: { duration: 0.5, ease: "easeInOut" }
      });
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, bellControls]);
  
  const handleMarkAsRead = () => {
    if (user?.id) {
      markAllAsRead(user.id);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  return (
    <>
      <header className={cn("z-30 flex flex-col gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-4", className)}>
        <div className="flex items-center justify-between gap-3">
          {/* IZQUIERDA: Sidebar + Empresa */}
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger />
            <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-black">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-blue-600 text-xs font-bold text-white">IA</div>
              <div className="flex flex-col max-w-25 sm:max-w-none">
                <span className="text-[10px] leading-none text-gray-400 uppercase font-bold tracking-tighter">Empresa</span>
                <span className="truncate leading-tight">{companyName}</span>
              </div>
            </div>
          </div>

          {/* DERECHA: Acciones */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" className="hidden md:inline-flex items-center gap-2">
              <Download className="h-4 w-4" /> Exportar
            </Button>

            <Button variant="outline" size="sm" className="hidden md:inline-flex items-center gap-2" onClick={() => router.push("/admin/properties/new")}>
              <Plus className="h-4 w-4" /> Propiedad
            </Button>

            {!isEngineer && (
              <Button className="hidden md:inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700" size="sm" onClick={() => setIsLeadDrawerOpen(true)}>
                <Plus className="h-4 w-4" /> Lead
              </Button>
            )}

            <DropdownMenu onOpenChange={(open) => open && handleMarkAsRead()}>
              <DropdownMenuTrigger className="relative inline-flex items-center justify-center gap-2 rounded-full h-9 w-9 hover:bg-slate-100 transition-colors">
                <motion.div animate={bellControls}>
                  <Bell className="h-4 w-4" />
                </motion.div>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-[8px] font-black text-white leading-none">{unreadCount > 9 ? "9+" : unreadCount}</span>
                  </motion.span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal border-b pb-2">
                    <p className="text-sm font-bold">Notificaciones</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <div className="max-h-64 overflow-y-auto py-1">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">No hay notificaciones</div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className={cn("px-4 py-3 text-sm border-b last:border-0", notif.read ? "opacity-60" : "bg-blue-50/50")}>
                        <p className="text-slate-800 font-medium leading-tight">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(notif.timestamp).toLocaleTimeString('es-AR', {hour: '2-digit', minute: '2-digit'})}</p>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-full ml-1 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center">
                <Avatar className="h-full w-full">
                  <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">{userInfo.initials}</AvatarFallback>
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
                <DropdownMenuItem onClick={logout} className="text-rose-600 cursor-pointer">
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* BUSCADOR */}
        <GlobalSearch />
      </header>

      <NewLeadDrawer open={isLeadDrawerOpen} onOpenChange={setIsLeadDrawerOpen} />
    </>
  );
}