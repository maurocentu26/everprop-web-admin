"use client";

import { useState } from "react";
import { User, Bell, Plus, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DropdownMenu from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

type Props = {
  companyName?: string;
  userName?: string;
  className?: string;
};


export default function AdminNavbar({
  companyName = "Inmobiliaria A",
  userName = "María Rossi",
  className,
}: Props) {
  const [bellOpen, setBellOpen] = useState(false);

  return (
    <header className={cn("flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3", className)}>
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1 text-sm font-medium border text-black border-gray-200">
          <div className="h-7 w-7 rounded-sm bg-blue-600 text-xs font-bold text-white flex items-center justify-center">IA</div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Empresa</span>
            {companyName}
          </div>
        </div>
      </div>

      <InputGroup className="max-w-3xl p-2">
          <InputGroupInput 
            placeholder="Buscar propiedades, leads, contactos..." />
          <InputGroupAddon>
              <Search />
          </InputGroupAddon>
      </InputGroup>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>

        <Button className="inline-flex items-center gap-2 bg-blue-600 text-white" size="sm">
          <Plus className="h-4 w-4" />
          Nuevo lead
        </Button>

        <Button variant="ghost" size="sm" className="inline-flex items-center gap-2 rounded-full" onClick={() => setBellOpen(v => !v)}>
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu
          align="right"
          trigger={
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">
              <Avatar size="sm">
                <AvatarFallback>{userName.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{userName}</span>
            </button>
          }
          items={[
            { label: "Perfil", onClick: () => console.log("Perfil") },
            { label: "Cerrar sesión", onClick: () => console.log("Cerrar sesión") },
          ]}
        />
      </div>
    </header>
  );
}

