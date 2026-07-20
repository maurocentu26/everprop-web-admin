"use client";

import { useEffect, useMemo, useState } from "react";
import { User, Bell, Plus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DropdownMenu from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { leads as sampleLeads, properties as sampleProperties, type Lead, type Property } from "@/data/admin-sample";
import { loadLeadList, loadPropertyList } from "@/lib/admin-storage";

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
  const router = useRouter();
  const [bellOpen, setBellOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);

  useEffect(() => {
    setAllProperties(loadPropertyList(sampleProperties, "c1"));
    setAllLeads(loadLeadList(sampleLeads, "c1"));
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProperties = useMemo(() => {
    if (!normalizedQuery) return [];
    return allProperties.filter((property) => {
      const haystack = `${property.title} ${property.city} ${property.neighborhood} ${property.propertyType}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    }).slice(0, 4);
  }, [allProperties, normalizedQuery]);

  const filteredLeads = useMemo(() => {
    if (!normalizedQuery) return [];
    return allLeads.filter((lead) => {
      const haystack = `${lead.name} ${lead.origin} ${lead.email ?? ""} ${lead.phone ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    }).slice(0, 4);
  }, [allLeads, normalizedQuery]);

  const hasSearchResults = filteredProperties.length > 0 || filteredLeads.length > 0;

  function handleSearchSelect(type: "property" | "lead", id: string) {
    setSearchQuery("");
    if (type === "property") {
      router.push("/admin#properties");
      return;
    }
    router.push("/admin#leads");
  }

  return (
    <header className={cn("z-30 flex flex-col gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-4", className)}>
      <div className="flex items-center justify-between gap-3">
        {/* IZQUIERDA: Sidebar + Empresa */}
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger />
          <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-black">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-blue-600 text-xs font-bold text-white">IA</div>
            <div className="flex flex-col max-w-25 sm:max-w-none">
              <span className="text-[10px] leading-none text-gray-400 uppercase font-bold">Empresa</span>
              <span className="truncate leading-tight">{companyName}</span>
            </div>
          </div>
        </div>

        {/* DERECHA: Acciones */}
        <div className="flex items-center justify-end gap-2">
          {/* BOTONES: Ahora ocultos en móvil, aparecen desde 'md' (768px) hacia arriba */}
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:inline-flex items-center gap-2 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex items-center gap-2 hover:text-white"
            onClick={() => router.push("/admin/properties/new")}
          >
            <Plus className="h-4 w-4" />
            Propiedad
          </Button>

          <Button
            className="hidden md:inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-400"
            size="sm"
            onClick={() => router.push("/admin/leads/new")}
          >
            <Plus className="h-4 w-4" />
            Lead
          </Button>

          {/* Iconos de acceso rápido que se quedan en móvil */}
          <Button variant="ghost" size="sm" className="inline-flex items-center gap-2 rounded-full h-9 w-9" onClick={() => setBellOpen(v => !v)}>
            <Bell className="h-4 w-4" />
          </Button>

          <DropdownMenu
            align="right"
            trigger={
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 md:px-3 md:py-1 text-sm font-medium text-slate-700">
                <Avatar className="h-7 w-7 md:h-8 md:w-8">
                  <AvatarFallback className="text-[10px]">
                    {userName.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}
                  </AvatarFallback>
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
      </div>

      <div className="relative w-full">
        <InputGroup className="p-2">
          <InputGroupInput
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar propiedades, leads, contactos..."
          />
          <InputGroupAddon>
            <Search className="h-4 w-4 text-slate-500" />
          </InputGroupAddon>
        </InputGroup>

        {normalizedQuery && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            {hasSearchResults ? (
              <>
                {filteredProperties.length > 0 && (
                  <div className="px-2 py-1">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Propiedades</p>
                    <div className="space-y-1">
                      {filteredProperties.map((property) => (
                        <button
                          key={property.id}
                          type="button"
                          onClick={() => handleSearchSelect("property", property.id)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                        >
                          <span className="font-medium text-slate-700">{property.title}</span>
                          <span className="text-xs text-slate-500">{property.city}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredLeads.length > 0 && (
                  <div className="px-2 py-1">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Leads</p>
                    <div className="space-y-1">
                      {filteredLeads.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => handleSearchSelect("lead", lead.id)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                        >
                          <span className="font-medium text-slate-700">{lead.name}</span>
                          <span className="text-xs text-slate-500">{lead.origin}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="px-3 py-3 text-sm text-slate-500">No se encontraron resultados.</div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

