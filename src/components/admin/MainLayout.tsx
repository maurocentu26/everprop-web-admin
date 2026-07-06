"use client"

import { useState } from "react";

import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import AppSidebar from "@/components/admin/Sidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="min-h-screen flex bg-white">
      <SidebarProvider>
        <AppSidebar  />
        <div className="flex flex-1 flex-col">
          <AdminNavbar />
          <div className="flex-1 p-6 bg-slate-50">
            <div className="mx-auto max-w-[120rem]">{children}</div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
