"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, Building2, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { leads as sampleLeads, properties as sampleProperties, projects as sampleProjects, type Lead, type Property, type Project } from "@/data/admin-sample";
import { loadLeadList, loadPropertyList, loadProjectList } from "@/lib/admin-storage";
import { SearchPropertyItem } from "../SearchPropertyItem";
import { SearchLeadItem } from "../SearchLeadItem";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function GlobalSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    setAllProperties(loadPropertyList(sampleProperties, "c1"));
    setAllLeads(loadLeadList(sampleLeads, "c1"));
    setAllProjects(loadProjectList(sampleProjects, "c1"));

    // Cerrar buscador con ESC
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchQuery("");
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Algoritmo de búsqueda para Proyectos
  const filteredProjects = useMemo(() => {
    if (!normalizedQuery) return [];
    return allProjects.filter((p) => p.name.toLowerCase().includes(normalizedQuery));
  }, [allProjects, normalizedQuery]);

  // Algoritmo de búsqueda para Propiedades y Unidades
  const filteredProperties = useMemo(() => {
    if (!normalizedQuery) return [];
    return allProperties.filter((p) => {
      const matchesProp = p.title.toLowerCase().includes(normalizedQuery) ||
                          p.neighborhood.toLowerCase().includes(normalizedQuery) ||
                          p.city.toLowerCase().includes(normalizedQuery) ||
                          p.sectorName?.toLowerCase().includes(normalizedQuery) ||
                          p.unitNumber?.toLowerCase().includes(normalizedQuery);
      
      // Also match if the parent project matches the query (so searching "Barrio" shows its lots)
      const parentProject = p.projectId ? allProjects.find(proj => proj.id === p.projectId) : null;
      const matchesProject = parentProject ? parentProject.name.toLowerCase().includes(normalizedQuery) : false;
      
      return matchesProp || matchesProject;
    });
  }, [allProperties, allProjects, normalizedQuery]);

  // Algoritmo de búsqueda para Leads
  const filteredLeads = useMemo(() => {
    if (!normalizedQuery) return [];
    return allLeads.filter((l) => 
      l.name.toLowerCase().includes(normalizedQuery) ||
      l.email?.toLowerCase().includes(normalizedQuery) ||
      l.phone?.includes(normalizedQuery)
    );
  }, [allLeads, normalizedQuery]);

  const hasSearchResults = filteredProperties.length > 0 || filteredLeads.length > 0 || filteredProjects.length > 0;

  const handleSearchSelect = useCallback((type: "property" | "lead" | "project", id: string) => {
    setSearchQuery("");
    setIsSearchFocused(false);
    if (type === "property") {
      router.push(`/admin/properties/${id}`);
    } else if (type === "project") {
      router.push(`/admin/desarrollos/${id}`);
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
                {/* SECCIÓN PROYECTOS */}
                {filteredProjects.length > 0 && (
                  <div className="mb-4">
                    <h4 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Proyectos / Desarrollos</h4>
                    <div className="grid gap-1">
                      {filteredProjects.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSearchSelect("project", p.id)}
                          className="flex items-center gap-3 rounded-xl p-2 cursor-pointer hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                        >
                          <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-sm font-bold text-slate-900 truncate">{p.name}</span>
                            <span className="text-xs text-slate-500 truncate">{p.type === 'land_development' ? 'Loteo' : p.type === 'building' ? 'Edificio' : 'Comercial'} • {p.totalUnits} unidades</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECCIÓN PROPIEDADES */}
                {filteredProperties.length > 0 && (
                  <div className="mb-4">
                    <h4 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {filteredProjects.length > 0 ? "Unidades del Desarrollo" : "Propiedades e Inventario"}
                    </h4>
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
                            router.push("/admin#properties");
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
                            router.push("/admin#leads");
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
    </>
  );
}
