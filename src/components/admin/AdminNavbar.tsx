"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { 
  Bell, Plus, Download, Search, Building2, User, 
  MapPin, Phone, ArrowRight, X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { leads as sampleLeads, properties as sampleProperties, type Lead, type Property } from "@/data/admin-sample";
import { loadLeadList, loadPropertyList } from "@/lib/admin-storage";
import { SearchPropertyItem } from "./SearchPropertyItem";
import { SearchLeadItem } from "./SearchLeadItem";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    setAllProperties(loadPropertyList(sampleProperties, "c1"));
    setAllLeads(loadLeadList(sampleLeads, "c1"));

    // Cerrar buscador con ESC
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchQuery("");
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Algoritmo de búsqueda para Propiedades
  const filteredProperties = useMemo(() => {
  if (!normalizedQuery) return [];
  return allProperties.filter((p) => 
    p.title.toLowerCase().includes(normalizedQuery) ||
    p.neighborhood.toLowerCase().includes(normalizedQuery) ||
    p.city.toLowerCase().includes(normalizedQuery)
  );
}, [allProperties, normalizedQuery]);

  // Algoritmo de búsqueda para Leads
  const filteredLeads = useMemo(() => {
    if (!normalizedQuery) return [];
    return allLeads.filter((l) => 
      l.name.toLowerCase().includes(normalizedQuery) ||
      l.email?.toLowerCase().includes(normalizedQuery) ||
      l.phone?.includes(normalizedQuery)
    );
  }, [allLeads, normalizedQuery]);

  const hasSearchResults = filteredProperties.length > 0 || filteredLeads.length > 0;

  const handleSearchSelect = useCallback((type: "property" | "lead", id: string) => {
    setSearchQuery("");
    setIsSearchFocused(false);
    if (type === "property") {
      router.push(`/admin/properties/${id}`);
    } else {
      router.push(`/admin/leads/${id}`);
    }
  }, [router]);

  return (
    <>
      {/* Backdrop cuando el buscador tiene texto */}
      {normalizedQuery && (
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-20 transition-all" onClick={() => setSearchQuery("")} />
      )}

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
        <div className="relative w-full z-30">
          <InputGroup className={cn(
            "p-1.5 transition-all duration-200 border-slate-200",
            normalizedQuery ? "ring-2 ring-blue-500/20 border-blue-500 shadow-lg" : ""
          )}>
            <InputGroupInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Buscar por nombre, dirección, teléfono..."
              className="border-none focus-visible:ring-0"
            />
            <InputGroupAddon>
              {searchQuery ? (
                <X className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => setSearchQuery("")} />
              ) : (
                <Search className="h-4 w-4 text-slate-400" />
              )}
            </InputGroupAddon>
          </InputGroup>

          {/* RESULTADOS DE BÚSQUEDA */}
          {normalizedQuery && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
              {hasSearchResults ? (
                <div className="space-y-4 p-2">
                  {/* SECCIÓN PROPIEDADES */}
                  {filteredProperties.length > 0 && (
                    <div>
                      <h4 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Propiedades</h4>
                      <div className="grid gap-1">
                        {filteredProperties.slice(0, 5).map((p) => (
                          <SearchPropertyItem
                            key={p.id}
                            property={p}
                            query={normalizedQuery}
                            onSelect={(id) => handleSearchSelect("property", id)}
                          />
                        ))}
                        {filteredProperties.length > 5 && (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              router.push("/admin#properties"); // O la ruta de tu tabla de propiedades
                          }}
                            className="flex w-full items-center justify-center gap-2 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors mt-1 border border-dashed border-blue-100"
                          >
                            Ver todos los resultados ({filteredProperties.length})
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN LEADS */}
                  {filteredLeads.length > 0 && (
                    <div>
                      <h4 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Interesados</h4>
                      <div className="grid gap-1">
                        {filteredLeads.slice(0, 5).map((l) => (
                          <SearchLeadItem
                            key={l.id}
                            lead={l}
                            query={normalizedQuery}
                            onSelect={(id) => handleSearchSelect("lead", id)}
                          />
                        ))}
                        {filteredLeads.length > 5 && (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              router.push("/admin#leads"); // O la ruta de tu tabla de leads
                          }}
                          className="flex w-full items-center justify-center gap-2 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors mt-1 border border-dashed border-emerald-100"
                          >
                            Ver todos los interesados ({filteredLeads.length})
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                    <Search className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">No encontramos resultados</p>
                  <p className="text-xs text-slate-500 mt-1">Intentá con otros términos o filtros.</p>
                </div>
              )}
              
              {/* Footer del buscador */}
              <div className="mt-2 border-t border-slate-100 p-2 text-center">
                 <p className="text-[10px] text-slate-400 font-medium">Presioná <span className="bg-slate-100 px-1 rounded border border-slate-200">ESC</span> para cerrar</p>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}