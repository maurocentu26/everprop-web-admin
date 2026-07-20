"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
    ArrowLeft, Building2, Mail, Phone, MessageCircle, ExternalLink, MapPin, Plus, Search, X
} from "lucide-react";
import type { Lead, Property, Visit } from "@/data/admin-sample";
import { leads as sampleLeads, properties as sampleProperties } from "@/data/admin-sample";
import { loadLeadList, loadPropertyList, saveLeadList, savePropertyList } from "@/lib/admin-storage";
import VisitManager from "@/components/admin/VisitManager";
import { Button } from "@/components/ui/button";
import  Badge  from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LeadDetailView({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLinking, setIsLinking] = useState(false);
  const [searchProperty, setSearchProperty] = useState("");

  useEffect(() => {
    const initialLeads = loadLeadList(sampleLeads, "c1");
    const initialProperties = loadPropertyList(sampleProperties, "c1");
    setAllLeads(initialLeads);
    setAllProperties(initialProperties);
    setLead(initialLeads.find((l) => l.id === leadId) ?? null);
  }, [leadId]);

  // --- Lógica para Vincular Propiedad ---
  function handleLinkProperty(propId: string) {
    if (!lead) return;
    if (lead.propertyIds.includes(propId)) {
        toast.error("Esta propiedad ya está vinculada.");
        return;
    }

    const nextLead: Lead = {
      ...lead,
      propertyIds: [...lead.propertyIds, propId],
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
    // Aseguramos que la propiedad de la visita se sume a intereses si no estaba
    const propId = visit.propertyId;
    const currentIds = lead.propertyIds || [];
    const updatedIds = (propId && !currentIds.includes(propId)) ? [...currentIds, propId] : currentIds;

    const nextLead: Lead = {
      ...lead,
      propertyIds: updatedIds,
      visits: [...(lead.visits ?? []), visit],
      lastActivity: new Date().toISOString()
    };
    updateLeadData(nextLead);
  }

  // Filtro de búsqueda de propiedades para el modal
  const filteredAvailableProps = useMemo(() => {
    return allProperties.filter(p => 
        !lead?.propertyIds.includes(p.id) && 
        p.title.toLowerCase().includes(searchProperty.toLowerCase())
    ).slice(0, 5);
  }, [allProperties, lead, searchProperty]);

  if (!lead) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Botón Volver */}
      <Link href="/admin#leads" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600">
        <ArrowLeft className="h-4 w-4" /> Volver al Pipeline
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Info Personal */}
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
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-50">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">WhatsApp</p>
                        <p className="text-sm font-medium">{lead.phone || "---"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
                        <p className="text-sm font-medium">{lead.email || "---"}</p>
                    </div>
                </div>
            </div>

            {/* Visit Manager */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <VisitManager
                    title="Gestión de Visitas"
                    subtitle="Agendá citas para cualquiera de sus propiedades de interés."
                    visits={lead.visits ?? []}
                    onSchedule={handleScheduleVisit}
                    defaultGuestName={lead.name}
                    defaultPhone={lead.phone}
                    defaultEmail={lead.email}
                    // IMPORTANTE: Solo dejamos elegir entre las propiedades que le interesan
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
                        <DialogTrigger>
                            <DialogTrigger className="h-8 w-8 rounded-full border border-slate-200 bg-white hover:bg-blue-50 flex items-center justify-center">
                                <Plus className="h-4 w-4" />
                            </DialogTrigger>
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