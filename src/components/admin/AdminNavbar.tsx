"use client";

import { Bell, Plus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { GlobalSearch } from "./navbar/GlobalSearch";

type Props = {
  companyName?: string;
  userName?: string;
  className?: string;
};

export function AdminNavbar({
  companyName = "Inmobiliaria A",
  userName = "María Rossi",
  className,
}: Props) {
  const router = useRouter();

  return (
    <>

      <header className={cn("z-30 flex flex-col gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-4", className)}>
        <div className="flex items-center justify-between gap-3">
          {/* IZQUIERDA: Sidebar + Empresa */}
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger />
            <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-black">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-blue-600 text-xs font-bold text-white">IA</div>
              <div className="flex flex-col max-w-25 sm:max-w-none">
                <span className="text-[10px] leading-none text-gray-400 uppercase font-bold tracking-tighter">Empresa</span>
                <span className="truncate leading-tight">{companyName}</span>
              </div>
            </div>
          </div>

          {/* DERECHA: Acciones */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" className="hidden md:inline-flex items-center gap-2">
              <Download className="h-4 w-4" /> Exportar
            </Button>

            <Button variant="outline" size="sm" className="hidden md:inline-flex items-center gap-2" onClick={() => router.push("/admin/properties/new")}>
              <Plus className="h-4 w-4" /> Propiedad
            </Button>

            <Button className="hidden md:inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700" size="sm" onClick={() => router.push("/admin/leads/new")}>
              <Plus className="h-4 w-4" /> Lead
            </Button>

            <Button variant="ghost" size="sm" className="inline-flex items-center gap-2 rounded-full h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
                {/* Aquí iría tu Trigger de Perfil */}
            </DropdownMenu>
          </div>
        </div>

        {/* BUSCADOR */}
        <GlobalSearch />
      </header>
    </>
  );
}