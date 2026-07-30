"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { leads as sampleLeads, properties as sampleProperties, type Lead } from "@/data/admin-sample";
import CardLead from "@/components/admin/CardLead";
import { loadLeadList, saveLeadList } from "@/lib/admin-storage";
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

// --- Tipos y Constantes ---
type Stage = "new" | "contacted" | "visiting" | "negotiation" | "closing";

const STAGE_ORDER: Stage[] = ["new", "contacted", "visiting", "negotiation", "closing"];

const STAGE_LABELS: Record<Stage, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  visiting: "Visitando",
  negotiation: "Negociación",
  closing: "Cerrando",
};

// --- Sub-componente: Columna ---
function KanbanColumn({ 
  stage, 
  items, 
  children, 
  isHighlighted 
}: { 
  stage: Stage; 
  items: string[]; 
  children: ReactNode;
  isHighlighted: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border-2 p-4 transition-all duration-200",
        isHighlighted
          ? "border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/10 shadow-lg scale-[1.01]"
          : "border-slate-200 bg-white shadow-sm"
      )}
    >
      <h3 className="mb-4 flex items-center justify-between text-sm font-bold uppercase tracking-wider text-slate-600">
        <span className="flex items-center gap-2">
          <span className={cn(
            "h-2 w-2 rounded-full",
            stage === 'new' ? "bg-slate-400" : 
            stage === 'contacted' ? "bg-blue-500" : 
            stage === 'visiting' ? "bg-amber-500" : "bg-emerald-500"
          )} />
          {STAGE_LABELS[stage]}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
          {items.length}
        </span>
      </h3>
      
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-3 min-h-37.5">
          {children}
        </div>
      </SortableContext>
    </div>
  );
}

// --- Sub-componente: Tarjeta Sorteable ---
function KanbanCard({ lead, isActive }: { lead: Lead; isActive: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // 1. Obtenemos los datos de las propiedades de forma segura
  const leadProperties = useMemo(() => {
    return lead.propertyIds
      .map((pid) => sampleProperties.find((p) => p.id === pid))
      .filter((p): p is typeof sampleProperties[0] => p !== undefined);
  }, [lead.propertyIds]);

  return (
    <div ref={setNodeRef} style={style} className={cn(isActive && "z-10")}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <CardLead
          className="hover:border-blue-400 hover:shadow-md transition-shadow"
          id={lead.id}
          name={lead.name}
          phone={lead.phone}
          email={lead.email}
          origin={lead.origin}
          // Pasamos el array completo de propiedades procesadas
          properties={leadProperties.map(p => ({
            title: p.title,
            bedrooms: p.bedrooms,
            price: p.price,
            currency: p.currency,
            operation: p.operation
          }))}
          lastActivity={lead.lastActivity}
        />
      </div>
    </div>
  );
}

// --- Componente Principal ---
export default function LeadKanban({ companyId = "c1" }: { companyId?: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [activeDragId, setActiveDragId] = useState<UniqueIdentifier | null>(null);
  const [overStageId, setOverStageId] = useState<Stage | null>(null);

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
          const stageLeads = leads.filter((l) => l.stage === stage);
          return (
            <KanbanColumn 
              key={stage} 
              stage={stage} 
              items={stageLeads.map((l) => l.id)}
              isHighlighted={overStageId === stage}
            >
              {stageLeads.map((lead) => (
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
  );
}
