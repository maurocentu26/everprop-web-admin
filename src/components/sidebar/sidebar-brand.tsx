"use client";

import Link from "next/link";
import { Command } from "lucide-react";
import { 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";

export function SidebarBrand() {
  return (
    <SidebarHeader className="">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton 
            size="lg" 
            className="hover:bg-white/5"
            render={<Link href="/admin#dashboard" />}
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Command className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight text-white group-data-[collapsible=icon]:hidden ml-1">
              <span className="truncate font-bold tracking-tight">EverProp SaaS</span>
              <span className="truncate text-[10px] text-slate-500 font-bold uppercase">
                Inmobiliaria A
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}