"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarFooter } from "@/components/ui/sidebar";

export function SidebarUser() {
  // En un caso real, estos datos vendrían de un AuthProvider
  const user = {
    name: "Maria Rossi",
    role: "Administradora",
    initials: "MR"
  };

  return (
    <SidebarFooter className="border-t border-white/5">
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
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            {user.role}
          </span>
        </div>
      </div>
    </SidebarFooter>
  );
}