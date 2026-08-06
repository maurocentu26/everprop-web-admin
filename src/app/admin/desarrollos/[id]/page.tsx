"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { HardHat, ArrowLeft, BarChart3, Map, Clock, Building2 } from "lucide-react";
import { type Project, type Property, projects as sampleProjects, properties as sampleProperties } from "@/data/admin-sample";
import { loadProjectList, loadPropertyList } from "@/lib/admin-storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import InventoryMatrix from "@/components/admin/InventoryMatrix";

export default function ProjectDetailView() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "matrix" | "log">("overview");

  useEffect(() => {
    const allProj = loadProjectList(sampleProjects, "c1");
    const p = allProj.find(p => p.id === projectId);
    if (p) {
      setProject(p);
      const allProps = loadPropertyList(sampleProperties, "c1");
      setProperties(allProps.filter(prop => prop.projectId === projectId));
    }
  }, [projectId]);

  if (!project) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      Cargando proyecto...
    </div>
  );

  const soldUnits = properties.filter(p => p.status === "sold").length;
  const reservedUnits = properties.filter(p => p.status === "reserved").length;
  const availableUnits = properties.length - soldUnits - reservedUnits;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <button 
          onClick={() => router.back()} 
          className="h-10 w-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <span className={cn(
              "px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md",
              project.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
              project.status === 'under_construction' ? "bg-blue-100 text-blue-700" :
              "bg-amber-100 text-amber-700"
            )}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{project.location.city}, {project.location.province}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
            activeTab === "overview" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          )}
        >
          <BarChart3 className="h-4 w-4" /> Resumen
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          className={cn(
            "px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
            activeTab === "matrix" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          )}
        >
          <Map className="h-4 w-4" /> Matriz de Inventario
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={cn(
            "px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors",
            activeTab === "log" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          )}
        >
          <Clock className="h-4 w-4" /> Bitácora de Obra
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <HardHat className="h-5 w-5 text-blue-600" /> Avance del Proyecto
                </h3>
                <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
                  <span>Progreso General</span>
                  <span className="text-blue-600 text-xl">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", project.progress === 100 ? "bg-emerald-500" : "bg-blue-600")}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                  {project.description || "Sin descripción disponible para este desarrollo."}
                </p>
              </div>

              {/* Inventario Stats */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Estado del Inventario</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                    <span className="block text-xs uppercase font-bold text-emerald-600 tracking-wider mb-1">Disponible</span>
                    <span className="text-3xl font-black text-emerald-700">{availableUnits}</span>
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <span className="block text-xs uppercase font-bold text-amber-600 tracking-wider mb-1">Reservado</span>
                    <span className="text-3xl font-black text-amber-700">{reservedUnits}</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <span className="block text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">Vendido</span>
                    <span className="text-3xl font-black text-slate-700">{soldUnits}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                  <Button onClick={() => setActiveTab("matrix")} className="bg-blue-600 hover:bg-blue-700 w-full rounded-xl h-12">
                    <Map className="mr-2 h-4 w-4" /> Ver Matriz Completa
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {project.masterplanImage && (
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                  <img src={project.masterplanImage} alt="Masterplan" className="w-full h-48 object-cover" />
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Masterplan</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "matrix" && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Map className="h-5 w-5 text-emerald-600" /> Matriz de Inventario
            </h3>
            <InventoryMatrix properties={properties} />
          </div>
        )}

        {activeTab === "log" && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-600" /> Bitácora y Novedades
            </h3>
            
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
              <div className="relative pl-8">
                <div className="absolute -left-2.5 top-1 h-5 w-5 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">Hoy</span>
                <h4 className="text-base font-bold text-slate-800 mt-2">Avance de obra actualizado al {project.progress}%</h4>
                <p className="text-sm text-slate-500 mt-1">Se reportó un avance significativo en los trabajos de infraestructura base.</p>
              </div>

              <div className="relative pl-8">
                <div className="absolute -left-2.5 top-1 h-5 w-5 rounded-full bg-slate-100 border-2 border-slate-300" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hace 15 días</span>
                <h4 className="text-base font-bold text-slate-800 mt-2">Preventa Iniciada</h4>
                <p className="text-sm text-slate-500 mt-1">Se habilitó la matriz de inventario comercial para el equipo de ventas.</p>
              </div>

              <div className="relative pl-8">
                <div className="absolute -left-2.5 top-1 h-5 w-5 rounded-full bg-emerald-100 border-2 border-emerald-500" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md">Hace 1 mes</span>
                <h4 className="text-base font-bold text-slate-800 mt-2">Aprobación Municipal</h4>
                <p className="text-sm text-slate-500 mt-1">Planos y permisos aprobados por la autoridad correspondiente.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
