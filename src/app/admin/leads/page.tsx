"use client";

import { useState, useMemo, useEffect } from "react";
import LeadTable from "@/components/admin/LeadTable";
import { Button } from "@/components/ui/button";
import { Download, Plus, Filter, Search } from "lucide-react";
import Link from "next/link";
import { type Lead, leads as sampleLeads, properties as sampleProperties } from "@/data/admin-sample";
import { loadLeadList } from "@/lib/admin-storage";
import { deferEffectUpdate } from "@/lib/deferred-effect";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

import { useDashboardMode } from "@/lib/dashboard-context";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { useCurrentSession } from "@/hooks/use-current-session";

type LeadStageFilter = "all" | "new" | "process" | "closed";
type AssetTypeFilter = "all" | "lote" | "departamento" | "comercial" | "tradicional";

const LEAD_STAGE_FILTERS: { id: LeadStageFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "new", label: "Nuevos" },
  { id: "process", label: "En proceso" },
  { id: "closed", label: "Cerrados" },
];

export default function AllLeadsPage() {
  const { mode: dashboardMode } = useDashboardMode();
  const { isEngineer, isAdvisor, user } = useCurrentSession();
  
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStage, setActiveStage] = useState<LeadStageFilter>("all");
  const [assetType, setAssetType] = useState<AssetTypeFilter>("all");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    return deferEffectUpdate(() => {
      setAllLeads(loadLeadList(sampleLeads, "c1"));
      setIsLoaded(true);
    });
  }, []);

  // Reset filters when switching workspace modes (Task 3 Bug Fix)
  useEffect(() => {
    return deferEffectUpdate(() => {
      if (dashboardMode === "agency") {
        setAssetType("all");
        setActiveStage("all");
        setSearchQuery("");
      }
    });
  }, [dashboardMode]);

  const hasActiveFilters = searchQuery !== "" || activeStage !== "all" || assetType !== "all";

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveStage("all");
    setAssetType("all");
  };

  const filteredLeads = useMemo(() => {
    let filtered = allLeads;
    const query = searchQuery.toLowerCase().trim();

    // 1. Search Query
    if (query) {
      filtered = filtered.filter(l => {
        const matchesName = l.name.toLowerCase().includes(query);
        const matchesEmail = l.email?.toLowerCase().includes(query);
        const matchesPhone = l.phone?.includes(query);
        const linkedProps = l.propertyIds.map(pid => sampleProperties.find(p => p.id === pid)?.title.toLowerCase() || "");
        const matchesProp = linkedProps.some(title => title.includes(query));
        
        return matchesName || matchesEmail || matchesPhone || matchesProp;
      });
    }

    // 2. Stage Filter
    if (activeStage !== "all") {
      filtered = filtered.filter(l => {
        if (activeStage === "new") return l.stage === "new";
        if (activeStage === "process") return ["contacted", "visiting", "negotiation"].includes(l.stage);
        if (activeStage === "closed") return l.stage === "closing";
        return true;
      });
    }

    // 3. Asset Type Filter
    if (assetType !== "all") {
      filtered = filtered.filter(l => {
        const leadProps = l.propertyIds.map(pid => sampleProperties.find(p => p.id === pid));
        if (assetType === "lote") return leadProps.some(p => p?.propertyType === "Lote");
        if (assetType === "departamento") return leadProps.some(p => p?.propertyType === "Departamento");
        if (assetType === "comercial") return leadProps.some(p => p?.propertyType === "Local" || p?.propertyType === "Cochera");
        if (assetType === "tradicional") return leadProps.some(p => p?.propertyType === "Casa" || (p?.propertyType === "Departamento" && !p.projectId));
        return false;
      });
    }

    // 4. Auth Filter
    if (isAdvisor) {
      filtered = filtered.filter(l => l.agentId === user?.id);
    }

    return filtered;
  }, [allLeads, searchQuery, activeStage, assetType, isAdvisor, user]);

  if (isEngineer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-16 w-16 text-red-600 mb-4" />
        <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
        <p className="text-slate-500 mt-2">Los ingenieros no tienen acceso a la base de contactos comerciales.</p>
      </div>
    );
  }

  if (!isLoaded) return <div className="h-96 animate-pulse bg-slate-100 rounded-3xl" />;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-10 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leads</h1>
          <p className="mt-1 max-w-xl text-base leading-6 text-slate-500">Gestioná y analizá todos los interesados de la comercializadora.</p>
        </div>
        
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
          <InputGroup className="w-full rounded-xl border-slate-200 bg-white shadow-sm sm:min-w-72 xl:w-72">
            <InputGroupAddon><Search className="h-4 w-4 text-slate-400" /></InputGroupAddon>
            <InputGroupInput 
              placeholder="Buscar lead, teléfono o lote..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none focus-visible:ring-0 text-sm"
            />
          </InputGroup>
          
          <div className="flex w-full gap-2 sm:w-auto">
            <Button variant="outline" className="min-h-11 flex-1 gap-2 text-slate-600 sm:flex-none">
              <Download className="h-4 w-4" />
              <span className="hidden xl:inline">Exportar</span>
            </Button>
            <Link href="/admin/leads/new" className="flex-1 sm:flex-none">
              <Button className="min-h-11 w-full gap-2 bg-blue-600 text-white hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Nuevo Lead
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 pb-2 xl:flex-row xl:items-center">
        {/* Status Tabs */}
        <div className="grid w-full grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 sm:grid-cols-4 xl:w-auto">
          {LEAD_STAGE_FILTERS.map(tab => (
            <button 
              key={tab.id}
              type="button"
              onClick={() => setActiveStage(tab.id)}
              className={cn(
                "min-h-11 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                activeStage === tab.id ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Asset Type Filter & Clear Filters */}
        <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center xl:w-auto">
          <div className="flex min-w-0 flex-1 items-center gap-2 xl:flex-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:inline-block">Interés en:</span>
            <select 
              aria-label="Filtrar por tipo de interés"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 xl:min-w-64"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetTypeFilter)}
            >
              <option value="all">Todos los activos</option>
              <option value="lote">Loteos</option>
              <option value="departamento">Edificios (Pozo)</option>
              <option value="comercial">Comercial (Locales/Cocheras)</option>
              <option value="tradicional">Inmobiliaria Tradicional</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="min-h-11 gap-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="min-h-[500px]">
        {filteredLeads.length > 0 ? (
          <LeadTable leads={filteredLeads} />
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <Filter className="h-8 w-8 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No se encontraron leads con esos filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
