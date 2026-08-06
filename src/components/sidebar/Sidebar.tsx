"use client";

import { type ComponentProps } from "react";
import { Sidebar, SidebarRail } from "@/components/ui/sidebar";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar 
      collapsible="icon" 
      className="" 
      {...props}
    >
      <SidebarBrand />
      
      <SidebarNav />
      
      <SidebarUser />

      <SidebarRail />
    </Sidebar>
  );
}