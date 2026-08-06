"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import type { NavItem } from "./navigation";
import { useSidebarActive } from "./use-sidebar-active";

interface SidebarNavItemProps {
  item: NavItem;
}

export function SidebarNavItem({ item }: SidebarNavItemProps) {
  const { isItemActive, isChildActive } = useSidebarActive();
  const active = isItemActive(item);
  const Icon = item.icon;

  return (
    <div key={item.title}>
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={active}
          tooltip={item.title}
          render={<Link href={item.href} />}
          className={cn(
            "transition-all duration-200 py-6 px-4 rounded-xl",
            // Estas clases ahora leerán las variables oklch que pusimos arriba
            active 
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xl font-bold" 
            : "text-sidebar-foreground hover:bg-gray-300"
        )}
        >
          <Icon className={cn("size-5", active ? "text-blue-600" : "")} />
          <span>{item.title}</span>
          {item.children && (
            <ChevronRight 
              className={cn(
                "ml-auto size-4 transition-transform duration-200",
                active && "rotate-90"
              )} 
            />
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Renderizado recursivo de submenús */}
      {item.children && active && (
        <SidebarMenuSub className="border-l border-white/10 ml-6 my-2">
          {item.children.map((child) => {
            const childActive = isChildActive(child);
            const ChildIcon = child.icon || Plus;
            
            return (
              <SidebarMenuSubItem key={child.title}>
                <SidebarMenuSubButton 
                  isActive={childActive}
                  render={<Link href={child.href} />}
                  className={cn(
                    "h-9 rounded-lg px-3 transition-colors",
                    childActive ? "text-white font-bold" : "text-slate-500"
                  )}
                >
                  <ChildIcon className={cn("size-3", childActive ? "text-blue-500" : "")} />
                  <span>{child.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      )}
    </div>
  );
}