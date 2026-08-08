"use client";

import { useState, useMemo, useEffect } from "react";
import PropertyList from "@/components/admin/PropertyList";
import { Button } from "@/components/ui/button";
import { Download, Plus, Map, Building2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { type Property, properties as sampleProperties, projects as sampleProjects } from "@/data/admin-sample";
import { loadPropertyList, loadProjectList } from "@/lib/admin-storage";
import { cn } from "@/lib/utils";
import { useDashboardMode } from "@/lib/dashboard-context";
import { useCurrentSession } from "@/hooks/use-current-session";

export default function AllPropertiesPage() {
  const { mode } = useDashboardMode();
  const { isAdvisor } = useCurrentSession();
  // Advisors always see ALL assets (lotes, locales, cocheras, etc.) to show to leads
  const effectiveMode = isAdvisor ? "enterprise" : mode;
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<typeof sampleProjects>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [activeStatus, setActiveStatus] = useState<"all" | "available" | "reserved" | "sold">("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    setAllProperties(loadPropertyList(sampleProperties, "c1"));
    setProjects(loadProjectList(sampleProjects, "c1"));
    setIsLoaded(true);
  }, []);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const filteredProperties = useMemo(() => {
    let filtered = allProperties;

    // 1. Project Filter
    if (selectedProjectId !== "all") {
      filtered = filtered.filter(p => p.projectId === selectedProjectId);
    }

    // 2. Status Filter
    if (activeStatus !== "all") {
      filtered = filtered.filter(p => p.status === activeStatus || (!p.status && activeStatus === "available"));
    }

    // 3. Type Filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(p => selectedTypes.includes(p.propertyType));
    }

    return filtered;
  }, [allProperties, selectedProjectId, activeStatus, selectedTypes]);

  const groupedProperties = useMemo(() => {
    const groups: { projects: Record<string, Property[]>, individual: Property[] } = {
      projects: {},
      individual: []
    };

    filteredProperties.forEach(p => {
      if (p.projectId) {
        if (!groups.projects[p.projectId]) groups.projects[p.projectId] = [];
        groups.projects[p.projectId].push(p);
      } else {
        groups.individual.push(p);
      }
    });
    return groups;
  }, [filteredProperties]);

  if (!isLoaded) return <div className="h-96 animate-pulse bg-slate-100 rounded-3xl" />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Propiedades e Inventario</h1>
          <p className="mt-1 text-slate-500 text-sm">Gestioná todos los activos, desde lotes hasta propiedades tradicionales.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 text-slate-600">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </Button>
          <Link href="/admin/properties/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="h-4 w-4" />
                Nueva Propiedad
            </Button>
          </Link>
        </div>
      </div>

      {/* Control Panel / Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
        
        {/* Project Filter - Only in Enterprise mode */}
        {effectiveMode === "enterprise" && (
          <>
            <div className="flex items-center gap-3 w-full xl:w-auto">
              <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                <Map className="h-5 w-5 text-slate-500" />
              </div>
              <select 
                className="text-sm font-semibold border-none bg-transparent focus:ring-0 cursor-pointer p-0 w-full xl:w-48 text-slate-700"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="all">Todos los Desarrollos</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="hidden xl:block w-px h-8 bg-slate-200" />
          </>
        )}

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
          {[
            { id: "all", label: "Todos" },
            { id: "available", label: "Disponible" },
            { id: "reserved", label: "Reservado" },
            { id: "sold", label: "Vendido" },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveStatus(tab.id as any)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap uppercase tracking-wider",
                activeStatus === tab.id 
                  ? (tab.id === 'available' ? "bg-emerald-100 text-emerald-700" : tab.id === 'reserved' ? "bg-amber-100 text-amber-700" : tab.id === 'sold' ? "bg-rose-100 text-rose-700" : "bg-white text-slate-800 shadow-sm border border-slate-200") 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden xl:block w-px h-8 bg-slate-200" />

        {/* Type Multi-select & Clear Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto">
          <Building2 className="h-4 w-4 text-slate-400 mr-2 hidden sm:block" />
          {["Lote", "Departamento", "Local", "Cochera", "Casa"].map(type => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                selectedTypes.includes(type) ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {type}
            </button>
          ))}

          {(selectedProjectId !== "all" || activeStatus !== "all" || selectedTypes.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedProjectId("all");
                setActiveStatus("all");
                setSelectedTypes([]);
              }}
              className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold gap-1.5 ml-2"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Content Rendering based on Mode */}
      {effectiveMode === "enterprise" ? (
        <div className="space-y-12">
          {Object.entries(groupedProperties.projects).map(([pId, props]) => {
            const proj = projects.find(p => p.id === pId);
            return (
              <div key={pId} className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Map className="h-6 w-6 text-blue-600" /> {proj?.name || "Proyecto"}
                </h2>
                <PropertyList properties={props} />
              </div>
            );
          })}
          
          {groupedProperties.individual.length > 0 && (
            <div className="space-y-4 pt-8">
              <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-emerald-600" /> Propiedades Individuales
              </h2>
              <PropertyList properties={groupedProperties.individual} />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-emerald-600" /> Inventario Tradicional
            </h2>
            {groupedProperties.individual.length > 0 ? (
              <PropertyList properties={groupedProperties.individual} />
            ) : (
              <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-2xl border border-dashed">
                No hay propiedades individuales registradas.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}