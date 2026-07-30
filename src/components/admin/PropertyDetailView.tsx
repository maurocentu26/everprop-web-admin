"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
    ArrowLeft, Building2, MapPin, Ruler, BedDouble, Bath, Car, 
    ExternalLink, Edit3, Share2, Calendar, CheckCircle2
} from "lucide-react";
import type { Lead, Property, Visit } from "@/data/admin-sample";
import { leads as sampleLeads, properties as sampleProperties } from "@/data/admin-sample";
import { loadLeadList, loadPropertyList, saveLeadList, savePropertyList } from "@/lib/admin-storage";
import VisitManager from "@/components/admin/VisitManager";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  propertyId: string;
};

export default function PropertyDetailView({ propertyId }: Props) {
  const [property, setProperty] = useState<Property | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);

  // Carga inicial de datos
  useEffect(() => {
    const initialProperties = loadPropertyList(sampleProperties, "c1");
    const initialLeads = loadLeadList(sampleLeads, "c1");
    
    setAllProperties(initialProperties);
    setAllLeads(initialLeads);
    
    const foundProperty = initialProperties.find((item) => item.id === propertyId);
    setProperty(foundProperty ?? null);
  }, [propertyId]);

  // --- Manejo de Visitas ---
  function handleScheduleVisit(visit: Visit) {
    if (!property) return;

    // 1. Buscamos al Lead para asegurar que tenemos su nombre correcto
    const targetLead = allLeads.find((l) => l.id === visit.leadId);
    const finalLeadName = visit.leadName || targetLead?.name || "Interesado";

    // 2. Preparamos el objeto de la visita con toda la data necesaria
    const nextVisit: Visit = { 
      ...visit, 
      propertyId: property.id, 
      propertyTitle: property.title,
      leadName: finalLeadName // VITAL para la sidebar
    };

    // 3. Actualizamos la PROPIEDAD actual y la lista global de propiedades
    const updatedProperty: Property = { 
      ...property, 
      visits: [...(property.visits ?? []), nextVisit] 
    };
    
    const nextProperties = allProperties.map((p) => 
      p.id === property.id ? updatedProperty : p
    );

    // 4. Actualizamos el LEAD (añadir interés y visita)
    let nextLeads = allLeads;
    if (targetLead) {
      const alreadyInterested = targetLead.propertyIds.includes(property.id);
      const updatedPropertyIds = alreadyInterested 
        ? targetLead.propertyIds 
        : [...targetLead.propertyIds, property.id];

      const updatedLead: Lead = {
        ...targetLead,
        propertyIds: updatedPropertyIds,
        visits: [...(targetLead.visits ?? []), nextVisit],
        lastActivity: new Date().toISOString()
      };

      nextLeads = allLeads.map((l) => (l.id === targetLead.id ? updatedLead : l));
    }

    // 5. Persistencia en Estados y LocalStorage
    // Primero los estados locales para feedback instantáneo
    setProperty(updatedProperty);
    setAllProperties(nextProperties);
    setAllLeads(nextLeads);

    // Luego el storage
    savePropertyList(nextProperties);
    saveLeadList(nextLeads);

    toast.success("Visita agendada con éxito");
  }

  function handleDeleteVisit(visitId: string) {
    if (!property) return;

    // Eliminar de propiedades
    const updatedProperty = {
        ...property,
        visits: (property.visits ?? []).filter(v => v.id !== visitId)
    };
    const nextProperties = allProperties.map(p => p.id === property.id ? updatedProperty : p);

    // Eliminar de leads
    const nextLeads = allLeads.map(lead => ({
        ...lead,
        visits: (lead.visits ?? []).filter(v => v.id !== visitId)
    }));

    setProperty(updatedProperty);
    setAllProperties(nextProperties);
    setAllLeads(nextLeads);
    
    savePropertyList(nextProperties);
    saveLeadList(nextLeads);
    
    toast.info("Visita eliminada");
  }

  if (!property) return <div className="p-8 text-center text-slate-500 font-medium">Propiedad no encontrada.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Barra Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link href="/admin#properties" className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Volver al inventario
        </Link>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2"><Share2 className="h-4 w-4" /> Compartir</Button>
            <Button variant="outline" size="sm" className="gap-2 text-blue-600"><Edit3 className="h-4 w-4" /> Editar</Button>
            <Button variant="default" size="sm" className="bg-slate-900 gap-2">Ver en Web <ExternalLink className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: Galería e Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200">
             <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                <Building2 size={80} strokeWidth={1} />
             </div>
             <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={cn(
                    "px-4 py-1.5 rounded-full border-none shadow-lg text-white font-bold tracking-wider",
                    property.operation === 'sale' ? "bg-emerald-500" : "bg-blue-600"
                )}>
                    {property.operation === 'sale' ? 'EN VENTA' : 'ALQUILER'}
                </Badge>
                <Badge className="bg-white/90 backdrop-blur text-slate-900 border-none px-4 py-1.5 rounded-full shadow-lg font-bold">
                    {property.propertyType}
                </Badge>
             </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">{property.title}</h1>
            <div className="flex items-center gap-2 text-slate-500 text-lg font-medium">
              <MapPin className="h-5 w-5 text-red-500" /> {property.neighborhood}, {property.city}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-100">
                {[
                    { label: 'Superficie', val: `${property.area_m2 || "--"} m²`, icon: Ruler },
                    { label: 'Ambientes', val: property.bedrooms || "0", icon: BedDouble },
                    { label: 'Baños', val: property.bathrooms || "0", icon: Bath },
                    { label: 'Cochera', val: '1', icon: Car }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                            <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">{item.label}</p>
                            <p className="font-bold text-slate-700">{item.val}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Precio y Sidebar de Visitas */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Precio de {property.operation === 'sale' ? 'Venta' : 'Alquiler'}</span>
            <div className="mt-2 text-4xl font-black text-slate-900">
                {property.currency} {property.price.toLocaleString('es-AR')}
            </div>
            <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-md font-bold">
                Agendar Visita
            </Button>
          </div>

          {/* LISTA DE INTERESADOS (SIDEBAR) */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar className="h-3 w-3" /> Interesados Agendados
            </h3>
            
            <div className="space-y-3">
                {(!property.visits || property.visits.length === 0) ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                        <p className="text-xs text-slate-400 italic">No hay visitas agendadas</p>
                    </div>
                ) : (
                    property.visits.map((visit) => (
                        <div key={visit.id} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-right-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-50 text-blue-600 text-[10px] font-black">
                                    {(visit.leadName || "I").substring(0,2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{visit.leadName}</p>
                                <p className="text-[10px] text-slate-500">
                                    {new Date(visit.scheduledAt).toLocaleDateString('es-AR')} • {new Date(visit.scheduledAt).toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'})}hs
                                </p>
                            </div>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        </div>
                    ))
                )}
            </div>
          </div>
        </div>
      </div>

      {/* COMPONENTE MANAGER (ABABAJO) */}
      <div className="rounded-[2.5rem] border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-8">
            <VisitManager
                title="Calendario de Visitas"
                subtitle="Gestioná quiénes van a ver esta propiedad."
                visits={property.visits ?? []}
                onSchedule={handleScheduleVisit}
                onDelete={handleDeleteVisit}
                leadOptions={allLeads}
            />
        </div>
      </div>
    </div>
  );
}