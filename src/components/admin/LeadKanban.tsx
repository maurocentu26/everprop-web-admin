"use client";

import { useEffect, useMemo, useState } from "react";
import { leads as sampleLeads, properties as sampleProperties, projects as sampleProjects, type Lead } from "@/data/admin-sample";
import CardLead from "@/components/admin/CardLead";
import { loadLeadList, saveLeadList, loadProjectList } from "@/lib/admin-storage";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { KanbanCard } from "./kanban/KanbanCard";
import { STAGE_ORDER, type Stage } from "./kanban/types";
import {
  type UniqueIdentifier,
  DndContext,
  pointerWithin,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { 
  SortableContext, 
  useSortable, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

// --- Componente Principal ---
export default function LeadKanban({ companyId = "c1", dashboardMode = "enterprise" }: { companyId?: string, dashboardMode?: "agency" | "enterprise" }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [activeDragId, setActiveDragId] = useState<UniqueIdentifier | null>(null);
  const [overStageId, setOverStageId] = useState<Stage | null>(null);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const projects = useMemo(() => loadProjectList(sampleProjects, companyId), [companyId]);

  // Sensores optimizados para Mobile y Desktop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Presión larga para permitir scroll
        tolerance: 8,
      },
    })
  );

  useEffect(() => {
    setLeads(loadLeadList(sampleLeads, companyId));
    setHydrated(true);
  }, [companyId]);

  useEffect(() => {
    if (!hydrated) return;
    saveLeadList(leads);
  }, [hydrated, leads]);

  // Auxiliar para encontrar el stage de cualquier ID (Lead o Columna)
  const findStage = (id: UniqueIdentifier): Stage | null => {
    if (STAGE_ORDER.includes(id as Stage)) return id as Stage;
    const lead = leads.find((l) => l.id === id);
    return lead ? lead.stage : null;
  };

  // Handlers de Arrastre
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id);
    setOverStageId(findStage(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverStageId(null);
      return;
    }
    const stage = findStage(over.id);
    setOverStageId(stage);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveDragId(null);
    setOverStageId(null);

    if (!over) return;

    const leadId = String(active.id);
    const targetStage = findStage(over.id);

    if (!targetStage) return;

    setLeads((prev) => 
      prev.map((lead) => (lead.id === leadId ? { ...lead, stage: targetStage } : lead))
    );
  };

  const activeLead = leads.find((l) => l.id === activeDragId) ?? null;

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    let result = leads;
    if (selectedProjectId !== "all") {
      result = result.filter(l => l.projectId === selectedProjectId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => l.name.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.phone?.includes(q));
    }
    return result;
  }, [leads, selectedProjectId, searchQuery]);

  // Renderizado de carga (Hydration Safety)
  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGE_ORDER.map((s) => (
          <div key={s} className="h-64 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Selector de Proyecto - Only show if in Enterprise Mode */}
        {dashboardMode === "enterprise" ? (
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Proyecto:</label>
            <select 
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="all">Todos los proyectos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div /> // Spacer
        )}

        {/* Buscador Rápido */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white text-slate-900 placeholder:text-slate-400"
            placeholder="Buscar lead rápido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DndContext
      id="everprop-kanban"
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGE_ORDER.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === stage);
          return (
            <KanbanColumn 
              key={stage} 
              stage={stage} 
              items={stageLeads.map((l) => l.id)}
              isHighlighted={overStageId === stage}
            >
              {stageLeads.slice(0, 5).map((lead) => (
                <KanbanCard 
                  key={lead.id} 
                  lead={lead} 
                  isActive={activeDragId === lead.id} 
                />
              ))}
            </KanbanColumn>
          );
        })}
      </div>

      {/* Overlay para el efecto visual flotante */}
      <DragOverlay dropAnimation={null} zIndex={1000}>
        {activeLead ? (
          <div className="relative pointer-events-none">
            {/* Backdrop oscuro que pedías */}
            <div className="fixed inset-0 -z-10 bg-slate-950/40 backdrop-blur-sm" />
            
            <div className="scale-105 rotate-2 shadow-2xl opacity-95">
              <CardLead
                className="border-2 border-blue-500 bg-white"
                id={activeLead.id}
                name={activeLead.name}
                phone={activeLead.phone}
                email={activeLead.email}
                origin={activeLead.origin}
                properties={activeLead.propertyIds.map((pid) => {
                  const prop = sampleProperties.find((p) => p.id === pid);
                  return prop ? { 
                    title: prop.title, 
                    bedrooms: prop.bedrooms, 
                    price: prop.price, 
                    currency: prop.currency, 
                    operation: prop.operation 
                  } : undefined;
                }).filter(Boolean) as any}
                lastActivity={activeLead.lastActivity}
              />
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
    </div>
  );
}
