"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, Users, CalendarDays, Settings, Command, ChevronRight, Plus, Download } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  Icon: ComponentType<any>;
  description?: string;
};

const items: NavItem[] = [
  { label: "Dashboard", href: "/admin#dashboard", Icon: Home, description: "Resumen general" },
  { label: "Leads", href: "/admin#leads", Icon: Users, description: "Pipeline comercial" },
  { label: "Propiedades", href: "/admin#properties", Icon: Building2, description: "Inventario y filtros" },
  { label: "Agenda", href: "/admin/agenda", Icon: CalendarDays, description: "Visitas programadas" },
  { label: "Configuración", href: "/admin#settings", Icon: Settings, description: "Ajustes de la inmobiliaria" },
];


export default function AppSidebar() {
  const pathname = usePathname() || "/";
  const [activeHash, setActiveHash] = useState("dashboard");

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash.replace(/^#/, "") || "dashboard");

    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const isItemActive = (href: string) => {
    const hash = href.split("#")[1] || "dashboard";
    if (hash === "properties") return pathname.startsWith("/admin/properties") || activeHash === hash;
    if (hash === "leads") return pathname.startsWith("/admin/leads") || activeHash === hash;
    if (hash === "agenda") return pathname.startsWith("/admin/agenda") || activeHash === hash;
    if (hash === "settings") return pathname.startsWith("/admin/settings") || activeHash === hash;
    return pathname.startsWith("/admin") && activeHash === hash;
  };

  const navButtonClass = (active: boolean) =>
    cn(
      "p-3 text-white hover:bg-[#212b42] hover:text-white",
      active && "bg-white text-black hover:bg-white hover:text-black",
    );

  const subButtonClass = (active: boolean) =>
    cn(
      "ml-4 rounded-md px-3 py-2 text-sm text-white hover:bg-[#212b42] hover:text-white",
      active && "bg-white text-black hover:bg-white hover:text-black",
    );

  return (
    <Sidebar collapsible="icon" >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/admin#dashboard" />} className="hover:bg-[#284588]">
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Command className="size-4" />
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">Mi Empresa</span>
                  <span className="truncate text-xs text-muted-foreground">Inmobiliaria A</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="md:hidden border-b border-white/10 pb-4 mb-2">
          <SidebarGroupLabel className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            Acciones Rápidas
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2 px-1 pt-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                    render={<Link href="/admin/leads/new" />}
                  >
                    <Plus className="size-4" />
                    <span>Nuevo Lead</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
                    render={<Link href="/admin/properties/new" />}
                  >
                    <Plus className="size-4" />
                    <span>Nueva Propiedad</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton className="text-slate-300">
                    <Download className="size-4" />
                    <span>Exportar Datos</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white">OPCIONES</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <div key={item.href}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isItemActive(item.href)}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                      className={navButtonClass(isItemActive(item.href))}
                    >
                      <item.Icon />
                      <span className="flex min-w-0 flex-1 flex-col text-left">
                        <span className="truncate font-medium">{item.label}</span>
                      </span>
                      <ChevronRight className="ml-auto size-4 text-current" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {item.href.includes("properties") && (
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={pathname === "/admin/properties/new"}
                          render={<Link href="/admin/properties/new" />}
                          className={subButtonClass(pathname === "/admin/properties/new")}
                        >
                          <Plus />
                          <span>Nueva propiedad</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  )}

                  {item.href.includes("leads") && (
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={pathname === "/admin/leads/new"}
                          render={<Link href="/admin/leads/new" />}
                          className={subButtonClass(pathname === "/admin/leads/new")}
                        >
                          <Plus />
                          <span>Nuevo lead</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
        <SidebarFooter className="border-t border-gray-500">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-accent text-white text-xs">
              MR
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-medium text-white">
              Maria Rossi
            </div>
            <div className="truncate text-xs text-muted-foreground">
              Admin
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
