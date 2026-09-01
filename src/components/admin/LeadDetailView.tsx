"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
    ArrowLeft, Building2, ExternalLink, Plus, Search, X, CircleAlert, CircleCheck, StickyNote
} from "lucide-react";
import type { Lead, Property, Visit } from "@/data/admin-sample";
import { inferLeadInterestCategory, leads as sampleLeads, properties as sampleProperties } from "@/data/admin-sample";
import { loadLeadList, loadPropertyList, saveLeadList, savePropertyList, updateLeadAgent } from "@/lib/admin-storage";
import VisitManager from "@/components/admin/VisitManager";
import { useAuth } from "@/lib/auth-context";
import { MOCK_USERS } from "@/data/auth-sample";
import { Button } from "@/components/ui/button";
import  Badge  from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createNotification } from "@/lib/notifications";
import { deferEffectUpdate } from "@/lib/deferred-effect";
import FinancingCalculator from "@/components/admin/FinancingCalculator";

export default function LeadDetailView({ leadId }: { leadId: string }) {
  const { currentUser } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLinking, setIsLinking] = useState(false);
  const [searchProperty, setSearchProperty] = useState("");
  const [pendingAgentId, setPendingAgentId] = useState<string | null>(null);

  useEffect(() => {
    return deferEffectUpdate(() => {
      const initialLeads = loadLeadList(sampleLeads, "c1");
      const initialProperties = loadPropertyList(sampleProperties, "c1");
      setAllLeads(initialLeads);
      setAllProperties(initialProperties);
      setLead(initialLeads.find((l) => l.id === leadId) ?? null);
    });
  }, [leadId]);

  // --- Lógica para Vincular Propiedad ---
  function handleLinkProperty(propId: string) {
    if (!lead) return;
    if (lead.propertyIds.includes(propId)) {
        toast.error("Esta propiedad ya está vinculada.");
        return;
    }

    const linkedProperty = allProperties.find((property) => property.id === propId);
    const nextLead: Lead = {
      ...lead,
      propertyIds: [...lead.propertyIds, propId],
      projectId: lead.projectId ?? linkedProperty?.projectId,
      interestCategory: lead.interestCategory ?? (linkedProperty ? inferLeadInterestCategory(linkedProperty) : undefined),
      lastActivity: new Date().toISOString()
    };

    updateLeadData(nextLead);
    setIsLinking(false);
    toast.success("Propiedad vinculada con éxito");
  }

  function handleUnlinkProperty(propId: string) {
    if (!lead) return;
    const nextLead = {
        ...lead,
        propertyIds: lead.propertyIds.filter(id => id !== propId)
    };
    updateLeadData(nextLead);
    toast.info("Vínculo eliminado");
  }

  function updateLeadData(nextLead: Lead) {
    const nextLeads = allLeads.map((l) => (l.id === nextLead.id ? nextLead : l));
    setAllLeads(nextLeads);
    saveLeadList(nextLeads);
    setLead(nextLead);
  }

  // --- Lógica de Visitas ---

function handleScheduleVisit(visit: Visit) {
  if (!lead) return;

  const finalVisit: Visit = {
    ...visit,
    leadId: lead.id,
    leadName: lead.name
  };

  const propId = visit.propertyId;
  const currentIds = lead.propertyIds || [];
  const updatedIds = (propId && !currentIds.includes(propId)) ? [...currentIds, propId] : currentIds;

  const nextLead: Lead = {
    ...lead,
    propertyIds: updatedIds,
    visits: [...(lead.visits ?? []), finalVisit],
    lastActivity: new Date().toISOString()
  };

  let nextProperties = allProperties;
  if (propId) {
    const propertyToUpdate = allProperties.find(p => p.id === propId);
    if (propertyToUpdate) {
      const updatedProp: Property = {
        ...propertyToUpdate,
        visits: [...(propertyToUpdate.visits ?? []), finalVisit]
      };
      nextProperties = allProperties.map(p => p.id === propId ? updatedProp : p);
    }
  }

  const nextLeads = allLeads.map((l) => (l.id === nextLead.id ? nextLead : l));
  
  setLead(nextLead);
  setAllLeads(nextLeads);
  setAllProperties(nextProperties);

  saveLeadList(nextLeads);
  savePropertyList(nextProperties);

  toast.success("Visita agendada y sincronizada con la propiedad");
}

  function handleReassignAgentConfirmed() {
    if (!lead || !pendingAgentId) return;
    const nextLeads = updateLeadAgent(lead.id, pendingAgentId, allLeads);
    setAllLeads(nextLeads);
    setLead(nextLeads.find(l => l.id === lead.id) ?? null);
    
    try {
      const channel = new BroadcastChannel("everprop_events");
      channel.postMessage({
        type: "LEAD_REASSIGNED",
        targetAgentId: pendingAgentId,
        leadName: lead.name
      });
      channel.close();
      
      createNotification(
        pendingAgentId, 
        `Se te ha reasignado el lead "${lead.name}"`
      );
    } catch (e) {
      console.error(e);
    }
    
    setPendingAgentId(null);
    toast.success("Asesor reasignado");
  }

  const filteredAvailableProps = useMemo(() => {
    return allProperties.filter(p => 
        !lead?.propertyIds.includes(p.id) && 
        p.title.toLowerCase().includes(searchProperty.toLowerCase())
    ).slice(0, 5);
  }, [allProperties, lead, searchProperty]);

  if (!lead) return null;

  const primaryProperty = allProperties.find((property) => property.id === lead.propertyIds[0]);
  const knownCategory = lead.interestCategory ?? (primaryProperty ? inferLeadInterestCategory(primaryProperty) : undefined);
  const pendingData = [
    !lead.phone ? "Teléfono" : null,
    !lead.email ? "Email" : null,
    !knownCategory ? "Categoría de interés" : null,
    !lead.projectId ? "Proyecto (si corresponde)" : null,
    lead.propertyIds.length === 0 ? "Propiedad de interés" : null,
    !lead.notes ? "Notas / preferencias" : null,
  ].filter((item): item is string => item !== null);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <Link href="/admin#leads" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600">
        <ArrowLeft className="h-4 w-4" /> Volver al Pipeline
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex gap-6 items-start">
                    <Avatar className="h-20 w-20 rounded-2xl bg-blue-600 text-white text-2xl font-bold">
                        <AvatarFallback>{lead.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900">{lead.name}</h1>
                        <div className="flex gap-2">
                            <Badge variant="default">{lead.origin}</Badge>
                            <Badge className="bg-blue-50 text-blue-700 border-none capitalize">{lead.stage}</Badge>
                        </div>
                        
                        {currentUser?.role === "ADMIN" && (
                          <div className="mt-4 flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 w-fit">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">Asesor Asignado:</span>
                              <span className="text-sm font-bold text-slate-900">
                                {lead.agentId ? MOCK_USERS.find(u => u.id === lead.agentId)?.name : "Sin asignar"}
                              </span>
                              <Dialog open={!!pendingAgentId} onOpenChange={(open) => { if (!open) setPendingAgentId(null); }}>
                                <DialogTrigger className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 shadow-sm hover:bg-slate-100 hover:text-slate-900 h-6 text-[10px] ml-2 font-medium" onClick={() => setPendingAgentId(lead.agentId || "none")}>
                                  Reasignar
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Reasignar Asesor</DialogTitle>
                                    <DialogDescription>Seleccioná el nuevo asesor para esta oportunidad de venta.</DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <select
                                      value={pendingAgentId === "none" ? "" : (pendingAgentId || "")}
                                      onChange={(e) => setPendingAgentId(e.target.value)}
                                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="" disabled>Seleccionar asesor...</option>
                                      {MOCK_USERS.filter(u => u.role === "ADVISOR").map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <DialogFooter className="mt-4 flex gap-2">
                                    <Button variant="outline" onClick={() => setPendingAgentId(null)}>Cancelar</Button>
                                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700" onClick={handleReassignAgentConfirmed} disabled={!pendingAgentId || pendingAgentId === "none" || pendingAgentId === lead.agentId}>
                                      Confirmar Cambio
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-8 pt-6 border-t border-slate-50 sm:grid-cols-2">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">WhatsApp</p>
                        <p className="text-sm font-medium">{lead.phone || "---"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
                        <p className="text-sm font-medium">{lead.email || "---"}</p>
                    </div>
                </div>

                {pendingData.length > 0 ? (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4" role="status">
                    <div className="flex items-start gap-3">
                      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-amber-950">Información pendiente</p>
                        <p className="mt-1 text-xs leading-5 text-amber-800">
                          Este lead ya está registrado. Podés completar estos datos cuando estén disponibles.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {pendingData.map((item) => (
                            <span key={item} className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-medium text-amber-900">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800" role="status">
                    <CircleCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
                    La información principal de este lead está completa.
                  </div>
                )}

                {lead.notes && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <StickyNote className="h-3.5 w-3.5" aria-hidden="true" /> Notas / Preferencias
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{lead.notes}</p>
                  </div>
                )}
            </div>

            {/* ── Simulador de Financiación ── */}
            {(() => {
              const primaryProp = allProperties.find(p => p.id === lead.propertyIds[0]);
              return (
                <FinancingCalculator
                  defaultPrice={primaryProp?.price}
                  defaultCurrency={primaryProp?.currency ?? "USD"}
                  leadName={lead.name}
                />
              );
            })()}

            <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <VisitManager
                    title="Gestión de Visitas"
                    subtitle="Agendá citas para cualquiera de sus propiedades de interés."
                    visits={lead.visits ?? []}
                    onSchedule={handleScheduleVisit}
                    defaultGuestName={lead.name}
                    defaultPhone={lead.phone}
                    defaultEmail={lead.email}
                    propertyOptions={allProperties.filter(p => lead.propertyIds.includes(p.id))}
                />
            </div>
        </div>

        {/* Columna Derecha: Intereses (Propiedades) */}
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="h-3 w-3" /> Propiedades de Interés
                    </h3>
                    
                    {/* MODAL PARA VINCULAR */}
                    <Dialog open={isLinking} onOpenChange={setIsLinking}>
                        <DialogTrigger className="h-8 w-8 rounded-full border border-slate-200 bg-white hover:bg-blue-50 flex items-center justify-center">
                            <Plus className="h-4 w-4"/>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl">
                            <DialogHeader>
                                <DialogTitle>Vincular Propiedad</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input 
                                        placeholder="Buscar por título o barrio..." 
                                        className="pl-9"
                                        value={searchProperty}
                                        onChange={(e) => setSearchProperty(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    {filteredAvailableProps.map(p => (
                                        <button 
                                            key={p.id}
                                            onClick={() => handleLinkProperty(p.id)}
                                            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left group"
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{p.title}</p>
                                                <p className="text-[10px] text-slate-500">{p.neighborhood}</p>
                                            </div>
                                            <Plus className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-3">
                    {lead.propertyIds.length === 0 && (
                        <p className="text-xs text-slate-400 italic text-center py-8">No hay propiedades vinculadas</p>
                    )}
                    {lead.propertyIds.map(pId => {
                        const p = allProperties.find(item => item.id === pId);
                        if (!p) return null;
                        return (
                            <div key={p.id} className="group relative flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <Building2 size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-slate-900 truncate leading-tight">{p.title}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-medium">{p.neighborhood}</p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/admin/properties/${p.id}`}>
                                        <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink size={12} /></Button>
                                    </Link>
                                    <Button onClick={() => handleUnlinkProperty(p.id)} variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600"><X size={12} /></Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
