"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function SidebarUser() {
  const { currentUser, logout } = useAuth();

  const user = {
    name: currentUser?.name || "Cargando...",
    role: currentUser?.title || "",
    initials: currentUser?.avatar || "??"
  };

  return (
    <SidebarFooter className="border-t border-white/5 pb-2">
      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 rounded-xl border border-white/10 shadow-inner">
            <AvatarFallback className="bg-blue-600 text-white text-[10px] font-black">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-white truncate leading-none mb-1">
              {user.name}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
              {user.role}
            </span>
          </div>
        </div>
        
        <SidebarMenu className="mt-2 group-data-[collapsible=icon]:hidden">
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout}
              className="w-full text-slate-400 hover:text-white hover:bg-rose-500/10 font-medium transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </SidebarFooter>
  );
}