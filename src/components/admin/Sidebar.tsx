"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, Users, Settings, Command } from "lucide-react";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  Icon: ComponentType<any>;
};

const items: NavItem[] = [
  { label: "Dashboard", href: "/admin", Icon: Home },
  { label: "Propiedades", href: "/admin/properties", Icon: Building2 },
  { label: "Leads", href: "/admin/leads", Icon: Users },
  { label: "Configuración", href: "/admin/settings", Icon: Settings },
];


export default function AppSidebar() {
  const pathname = usePathname() || "/";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div role="button" className="flex items-center gap-3">
                {/* Contenedor del Logo (Siempre visible y centrado al colapsar) */}
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Command className="size-4" />
                </div>

                {/* Textos del Header (Se ocultan automáticamente al colapsar) */}
                <div className="grid flex-1 text-left text-sm leading-tight bg-white">
                  <span className="font-semibold truncate">Mi Empresa</span>
                  <span className="text-xs text-muted-foreground truncate">Admin Panel</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
    // <aside
    //   className={cn(
    //     "flex h-screen flex-col justify-between bg-slate-900 text-white transition-all duration-200",
    //     collapsed ? "w-16" : "w-72",
    //     className,
    //   )}
    // >
    //   <div>
    //     <div className={cn("h-20 flex items-center gap-3", collapsed ? "justify-center px-2" : "px-4")}>
    //       <div className={cn("flex h-10 w-10 items-center justify-center rounded-md font-semibold bg-blue-600 text-white")}>E</div>
    //       {!collapsed && <div className="text-sm font-semibold">EverProp</div>}
    //     </div>

    //     <nav className={cn(collapsed ? "px-1" : "px-2 py-4")}>
    //       <ul className={cn(collapsed ? "space-y-2" : "space-y-1")}>
    //         {items.map((item) => {
    //           const active = pathname === item.href || pathname.startsWith(item.href + "/");
    //           return (
    //             <li key={item.href}>
    //               <Link
    //                 href={item.href}
    //                 className={cn(
    //                   "group flex items-center gap-3 rounded-md px-3 py-2 text-sm",
    //                   collapsed ? "justify-center px-0" : "",
    //                   active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white",
    //                 )}
    //               >
    //                 <span
    //                   className={cn(
    //                     "inline-flex h-8 w-8 items-center justify-center rounded-md",
    //                     active ? "bg-slate-700 text-white" : "bg-transparent text-slate-400",
    //                   )}
    //                 >
    //                   <item.Icon className="h-4 w-4" />
    //                 </span>
    //                 {!collapsed && <span>{item.label}</span>}
    //               </Link>
    //             </li>
    //           );
    //         })}
    //       </ul>
    //     </nav>
    //   </div>

    //   <div className={cn(collapsed ? "text-center px-2 pb-4" : "px-4 pb-4")}>
    //     <div className={cn("flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-800", collapsed ? "justify-center" : "") }>
    //       <div className="h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white flex">MR</div>
    //       {!collapsed && (
    //         <div className="flex-1 text-sm">
    //           <div className="font-medium">María Rossi</div>
    //           <div className="text-xs text-slate-300">Admin</div>
    //         </div>
    //       )}

    //     </div>
          
    //   </div>
    // </aside>
  );
}
