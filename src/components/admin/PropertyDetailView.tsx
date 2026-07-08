"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Ruler } from "lucide-react";
import type { Lead, Property, Visit } from "@/data/admin-sample";
import { leads as sampleLeads, properties as sampleProperties } from "@/data/admin-sample";
import { loadLeadList, loadPropertyList, saveLeadList, savePropertyList } from "@/lib/admin-storage";
import VisitManager from "@/components/admin/VisitManager";
import { Button } from "@/components/ui/button";

type Props = {
  propertyId: string;
};

export default function PropertyDetailView({ propertyId }: Props) {
  const [property, setProperty] = useState<Property | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const initialProperties = loadPropertyList(sampleProperties, "c1");
    const initialLeads = loadLeadList(sampleLeads, "c1");
    setAllProperties(initialProperties);
    setAllLeads(initialLeads);
    setProperty(initialProperties.find((item) => item.id === propertyId) ?? null);
  }, [propertyId]);

  function handleScheduleVisit(visit: Visit) {
    if (!property) return;

    const nextVisit = {
      ...visit,
      propertyId: property.id,
      propertyTitle: property.title,
    };

    const nextProperty: Property = {
      ...property,
      visits: [...(property.visits ?? []), nextVisit],
    };

    const nextProperties = allProperties.map((item) => (item.id === property.id ? nextProperty : item));
    setAllProperties(nextProperties);
    savePropertyList(nextProperties);
    setProperty(nextProperty);

    const matchingLead = allLeads.find((lead) => lead.propertyId === property.id);
    if (matchingLead) {
      const nextLead: Lead = {
        ...matchingLead,
        visits: [...(matchingLead.visits ?? []), { ...nextVisit, leadName: visit.leadName || "Visitante", propertyTitle: property.title }],
      };
      const nextLeads = allLeads.map((lead) => (lead.id === matchingLead.id ? nextLead : lead));
      setAllLeads(nextLeads);
      saveLeadList(nextLeads);
    }
  }

  function handleDeleteVisit(visitId: string) {
    if (!property) return;

    const nextProperty: Property = {
      ...property,
      visits: (property.visits ?? []).filter((v) => v.id !== visitId),
    };

    const nextProperties = allProperties.map((item) => (item.id === property.id ? nextProperty : item));
    setAllProperties(nextProperties);
    savePropertyList(nextProperties);
    setProperty(nextProperty);

    // remove from any lead that references this visit id
    const nextLeads = allLeads.map((lead) => ({
      ...lead,
      visits: (lead.visits ?? []).filter((v) => v.id !== visitId),
    }));
    setAllLeads(nextLeads);
    saveLeadList(nextLeads);
  }

  if (!property) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        No se encontró la propiedad solicitada.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin#properties" className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800">
        <ArrowLeft className="h-4 w-4" />
        Volver a propiedades
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Propiedad</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{property.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">{property.propertyType}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{property.bedrooms} dormitorios</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{property.bathrooms} baños</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{property.neighborhood}, {property.city}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              <span>{property.area_m2 ? `${property.area_m2} m²` : "Sin superficie"}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Building2 className="h-4 w-4" />
            Personas con visita agendada
          </div>
          <div className="mt-3 space-y-2">
            {(property.visits ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no hay visitas programadas para esta propiedad.</p>
            ) : (
              (property.visits ?? []).map((visit) => (
                <div key={visit.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                  <div>
                    <span className="font-medium text-slate-900">{visit.leadName || "Visitante"}</span>
                    <span className="ml-2 text-slate-500">• {new Date(visit.scheduledAt).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteVisit(visit.id)} className="text-rose-600">Eliminar</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <VisitManager
        title="Agenda de visitas"
        subtitle="Agendá una visita para esta propiedad y mirá quienes ya la solicitaron."
        visits={property.visits ?? []}
        onSchedule={handleScheduleVisit}
        onDelete={handleDeleteVisit}
        leadOptions={allLeads}
      />
    </div>
  );
}
