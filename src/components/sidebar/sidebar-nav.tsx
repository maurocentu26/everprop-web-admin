"use client";

import Link from "next/link";
import { 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { navigationGroups } from "./navigation";
import { quickActionsConfig } from "./quick-actions";
import { SidebarNavItem } from "./sidebar-nav-item";

export function SidebarNav() {
  return (
    <SidebarContent>
      {/* GRUPO: Acciones Rápidas (Visible solo en móvil) */}
      <SidebarGroup className="md:hidden border-b border-white/5 pb-4 mb-2">
        <SidebarGroupLabel className="text-slate-500 text-[10px] font-black uppercase tracking-widest px-4">
          Acciones
        </SidebarGroupLabel>
        <SidebarGroupContent className="px-2">
          <SidebarMenu className="gap-2">
            {quickActionsConfig.map((action) => {
              const ActionIcon = action.icon;
              return (
                <SidebarMenuItem key={action.title}>
                  <SidebarMenuButton 
                    render={<Link href={action.href} />}
                    className={cn("h-10 px-4 rounded-xl font-semibold", action.className)}
                  >
                    <ActionIcon className="size-4" />
                    <span>{action.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* GRUPOS: Navegación Principal por Unidad de Negocio */}
      {navigationGroups.map((group) => (
        <SidebarGroup key={group.label} className="mb-2">
          <SidebarGroupLabel className="text-slate-500 text-[10px] font-black uppercase tracking-widest px-4">
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent className="">
            <SidebarMenu className="gap-1.5">
              {group.items.map((item) => (
                <SidebarNavItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}