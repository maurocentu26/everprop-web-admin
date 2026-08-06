"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HardHat, Map, ArrowRight, Building2, ChevronRight } from "lucide-react";
import { type Project, type Property, projects as sampleProjects, properties as sampleProperties } from "@/data/admin-sample";
import { loadProjectList, loadPropertyList } from "@/lib/admin-storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DesarrollosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProjects(loadProjectList(sampleProjects, "c1").filter(p => p.type !== "commercial"));
    setProperties(loadPropertyList(sampleProperties, "c1"));
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 w-48 bg-slate-200 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-100 rounded-3xl"></div>)}
      </div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <HardHat className="h-8 w-8 text-blue-600" /> 
            Desarrollos y Masterplans
          </h1>
          <p className="text-slate-500 mt-1">Gestión de loteos, barrios y edificios en pozo.</p>
        </div>
        
        <Link href="/admin/inventory-matrix">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 shadow-sm">
            <Map className="mr-2 h-5 w-5" /> Matriz Global de Inventario
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
        {projects.map(project => {
          // Calculate units sold
          const projProps = properties.filter(p => p.projectId === project.id);
          const soldCount = projProps.filter(p => p.status === "sold").length;
          
          return (
            <Link href={`/admin/desarrollos/${project.id}`} key={project.id}>
              <div className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1">
                {/* Image Header */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  {project.masterplanImage ? (
                    <img 
                      src={project.masterplanImage} 
                      alt={project.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-slate-200">
                      <Building2 className="h-12 w-12 text-slate-400" />
                    </div>
                  )}
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={cn(
                      "px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg backdrop-blur-md",
                      project.type === "land_development" ? "bg-emerald-500/90 text-white" : "bg-blue-600/90 text-white"
                    )}>
                      {project.type === "land_development" ? "Loteo" : "Edificio"}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 mb-6 flex items-center gap-1">
                    <Map className="h-4 w-4" /> {project.location.city}, {project.location.province}
                  </p>

                  <div className="mt-auto space-y-5">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                        <span>Avance de Obra</span>
                        <span className="text-blue-600">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-1000", project.progress === 100 ? "bg-emerald-500" : "bg-blue-600")}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unidades</span>
                        <span className="text-lg font-black text-slate-700">{project.totalUnits}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vendidas</span>
                        <span className="text-lg font-black text-emerald-600">{soldCount} <span className="text-sm text-slate-400 font-medium">/ {project.totalUnits}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm font-bold text-blue-600 group-hover:text-blue-700">
                      Ver detalles del proyecto
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
