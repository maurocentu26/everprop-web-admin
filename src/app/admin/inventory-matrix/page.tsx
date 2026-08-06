"use client";

import { useState, useMemo, useEffect } from "react";
import { Map, LayoutGrid } from "lucide-react";
import { type Property, properties as sampleProperties, projects as sampleProjects } from "@/data/admin-sample";
import { loadPropertyList, loadProjectList } from "@/lib/admin-storage";
import InventoryMatrix from "@/components/admin/InventoryMatrix";

export default function GlobalInventoryMatrixPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<typeof sampleProjects>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  useEffect(() => {
    setProperties(loadPropertyList(sampleProperties, "c1"));
    const allProj = loadProjectList(sampleProjects, "c1");
    // Only keep projects that actually have units in the inventory matrix (like lotes or buildings, wait let's just keep all)
    setProjects(allProj);
    setIsLoaded(true);
  }, []);

  const filteredProperties = useMemo(() => {
    if (selectedProjectId === "all") return properties;
    return properties.filter(p => p.projectId === selectedProjectId);
  }, [properties, selectedProjectId]);

  const groupedByProject = useMemo(() => {
    const groups: Record<string, Property[]> = {};
    filteredProperties.forEach(p => {
      // We only care about properties assigned to a project for the matrix
      if (!p.projectId) return;
      if (!groups[p.projectId]) groups[p.projectId] = [];
      groups[p.projectId].push(p);
    });
    return groups;
  }, [filteredProperties]);

  if (!isLoaded) return (
    <div className="h-96 animate-pulse bg-slate-100 rounded-3xl" />
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
      {/* Header & Global Project Filter */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center border border-emerald-200">
            <LayoutGrid className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Matriz Global de Inventario</h1>
            <p className="text-slate-500 text-sm">Visualización táctica de unidades por desarrollo.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100 w-full md:w-auto">
          <Map className="h-5 w-5 text-slate-400 ml-2" />
          <select 
            className="text-base font-bold border-none bg-transparent focus:ring-0 cursor-pointer w-full md:w-64 text-slate-700 h-10"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="all">Ver Todos los Desarrollos</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 min-h-[500px]">
        {Object.keys(groupedByProject).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(groupedByProject).map(([pid, props]) => {
              const proj = projects.find(p => p.id === pid);
              if (!proj) return null;
              
              return (
                <div key={pid} className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Map className="h-5 w-5 text-blue-600" /> {proj.name}
                  </h2>
                  <InventoryMatrix properties={props} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <LayoutGrid className="h-10 w-10 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No hay unidades para mostrar en la matriz actual.</p>
          </div>
        )}
      </div>
    </div>
  );
}
