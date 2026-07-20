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

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <SidebarProvider defaultOpen={false}>
        <div className="flex h-screen w-full overflow-hidden">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminNavbar/>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-3 sm:p-4 md:p-6">
              <div className="mx-auto w-full max-w-[120rem]">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
