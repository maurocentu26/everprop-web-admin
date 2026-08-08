"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import LeadTable from "@/components/admin/LeadTable";
import { Button } from "@/components/ui/button";
import { Download, Plus, Filter, Search } from "lucide-react";
import Link from "next/link";
import { type Lead, leads as sampleLeads, properties as sampleProperties } from "@/data/admin-sample";
import { loadLeadList } from "@/lib/admin-storage";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

import { useDashboardMode } from "@/lib/dashboard-context";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { useCurrentSession } from "@/hooks/use-current-session";

export default function AllLeadsPage() {
  const router = useRouter();
  const { mode: dashboardMode } = useDashboardMode();
  const { isEngineer, isAdvisor, user } = useCurrentSession();
  
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStage, setActiveStage] = useState<"all" | "new" | "process" | "closed">("all");
  const [assetType, setAssetType] = useState<"all" | "lote" | "departamento" | "comercial" | "tradicional">("all");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setAllLeads(loadLeadList(sampleLeads, "c1"));
    setIsLoaded(true);
  }, []);

  // Reset filters when switching workspace modes (Task 3 Bug Fix)
  useEffect(() => {
    if (dashboardMode === "agency") {
      setAssetType("all");
      setActiveStage("all");
      setSearchQuery("");
    }
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
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leads</h1>
          <p className="mt-1 text-slate-500 text-sm">Gestioná y analizá todos los interesados de la comercializadora.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <InputGroup className="w-full sm:w-64 bg-white border-slate-200 shadow-sm rounded-xl">
            <InputGroupAddon><Search className="h-4 w-4 text-slate-400" /></InputGroupAddon>
            <InputGroupInput 
              placeholder="Buscar lead, teléfono o lote..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none focus-visible:ring-0 text-sm"
            />
          </InputGroup>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="gap-2 text-slate-600 flex-1 sm:flex-none">
              <Download className="h-4 w-4" />
              <span className="hidden xl:inline">Exportar</span>
            </Button>
            <Link href="/admin/leads/new" className="flex-1 sm:flex-none">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full">
                  <Plus className="h-4 w-4" />
                  Nuevo Lead
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-100 rounded-2xl">
          {[
            { id: "all", label: "Todos" },
            { id: "new", label: "Nuevos" },
            { id: "process", label: "En proceso" },
            { id: "closed", label: "Cerrados" },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveStage(tab.id as any)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                activeStage === tab.id ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Asset Type Filter & Clear Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:inline-block">Interés en:</span>
            <select 
              className="text-sm font-medium border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as any)}
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
              className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold gap-1.5"
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