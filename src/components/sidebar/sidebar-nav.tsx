"use client";

import Link from "next/link";
import { useMemo } from "react";
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
import { useCurrentSession } from "@/hooks/use-current-session";
import { isMockDataMode } from "@/lib/data-mode";

export function SidebarNav() {
  const { isEngineer } = useCurrentSession();
  
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
      return navigationGroups.map(group => {
        if (group.label === "Activos Comerciales") {
           return { ...group, items: group.items.filter(i => i.title !== "Agenda") };
        }
        return group;
      }).filter(g => g.label !== "Comercializadora");
    }
    return navigationGroups;
  }, [isEngineer]);

  return (
    <SidebarContent>
      {/* GRUPO: Acciones Rápidas (Visible solo en móvil) */}
      {isMockDataMode && (
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
      )}

      {/* GRUPOS: Navegación Principal por Unidad de Negocio */}
      {filteredGroups.map((group) => (
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
