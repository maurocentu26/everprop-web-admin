"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Mail, Phone, UserRound } from "lucide-react";
import type { Lead, Property, Visit } from "@/data/admin-sample";
import { leads as sampleLeads, properties as sampleProperties } from "@/data/admin-sample";
import { loadLeadList, loadPropertyList, saveLeadList, savePropertyList } from "@/lib/admin-storage";
import VisitManager from "@/components/admin/VisitManager";

type Props = {
  leadId: string;
};

export default function LeadDetailView({ leadId }: Props) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);

  useEffect(() => {
    const initialLeads = loadLeadList(sampleLeads, "c1");
    const initialProperties = loadPropertyList(sampleProperties, "c1");
    setAllLeads(initialLeads);
    setAllProperties(initialProperties);

    const currentLead = initialLeads.find((item) => item.id === leadId) ?? null;
    setLead(currentLead);
    if (currentLead?.propertyId) {
      setProperty(initialProperties.find((item) => item.id === currentLead.propertyId) ?? null);
    } else {
      setProperty(null);
    }
  }, [leadId]);

  function handleScheduleVisit(visit: Visit) {
    if (!lead) return;

    const nextVisit = {
      ...visit,
      leadId: lead.id,
      propertyId: lead.propertyId ?? undefined,
      leadName: lead.name,
      propertyTitle: property?.title,
    };

    const nextLead: Lead = {
      ...lead,
      visits: [...(lead.visits ?? []), nextVisit],
    };

    const nextLeads = allLeads.map((item) => (item.id === lead.id ? nextLead : item));
    setAllLeads(nextLeads);
    saveLeadList(nextLeads);
    setLead(nextLead);

    if (property) {
      const nextProperty: Property = {
        ...property,
        visits: [...(property.visits ?? []), { ...nextVisit, leadName: lead.name, propertyTitle: property.title }],
      };
      const nextProperties = allProperties.map((item) => (item.id === property.id ? nextProperty : item));
      setAllProperties(nextProperties);
      savePropertyList(nextProperties);
      setProperty(nextProperty);
    }
  }

  function handleDeleteVisit(visitId: string) {
    if (!lead) return;

    const nextLead: Lead = {
      ...lead,
      visits: (lead.visits ?? []).filter((v) => v.id !== visitId),
    };

    const nextLeads = allLeads.map((item) => (item.id === lead.id ? nextLead : item));
    setAllLeads(nextLeads);
    saveLeadList(nextLeads);
    setLead(nextLead);

    if (property) {
      const nextProperty: Property = {
        ...property,
        visits: (property.visits ?? []).filter((v) => v.id !== visitId),
      };
      const nextProperties = allProperties.map((item) => (item.id === property.id ? nextProperty : item));
      setAllProperties(nextProperties);
      savePropertyList(nextProperties);
      setProperty(nextProperty);
    }
  }

  if (!lead) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        No se encontró el lead solicitado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin#leads" className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800">
        <ArrowLeft className="h-4 w-4" />
        Volver al dashboard
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Lead</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{lead.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">Origen: {lead.origin}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Estado: {lead.stage}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{lead.phone || "Sin teléfono"}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{lead.email || "Sin email"}</span>
            </div>
          </div>
        </div>

        {property ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Building2 className="h-4 w-4" />
              Propiedad asociada
            </div>
            <p className="mt-2 text-lg font-semibold text-slate-900">{property.title}</p>
            <p className="mt-1 text-sm text-slate-500">{property.neighborhood}, {property.city}</p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Este lead todavía no tiene una propiedad asociada.
          </div>
        )}
      </div>

      <VisitManager
        title="Agenda de visitas"
        subtitle="Agendá una visita para este lead y consultá las que ya están programadas."
        visits={lead.visits ?? []}
        onSchedule={handleScheduleVisit}
        onDelete={handleDeleteVisit}
        defaultGuestName={lead.name}
        defaultPhone={lead.phone}
        defaultEmail={lead.email}
        leadOptions={allLeads}
      />
    </div>
  );
}
