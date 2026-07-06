"use client";

import { useState, useEffect } from "react";
import { leads as sampleLeads, properties as sampleProperties } from "@/data/admin-sample";
import { Phone, Mail, PhoneOutgoing } from "lucide-react";
import CardLead from "@/components/admin/CardLead";

type Stage = "new" | "contacted" | "visiting" | "negotiation" | "closing";

const STAGE_ORDER: Stage[] = ["new", "contacted", "visiting", "negotiation", "closing"];

const STAGE_LABELS: Record<Stage, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  visiting: "Visitando",
  negotiation: "Negociación",
  closing: "Cerrando",
};

function ClientFormattedDate({ iso }: { iso: string }) {
  const [text, setText] = useState("");

  useEffect(() => {
    let mounted = true;
    try {
      const id = setTimeout(() => {
        if (mounted) setText(new Date(iso).toLocaleString());
      }, 0);
      return () => {
        mounted = false;
        clearTimeout(id);
      };
    } catch (e) {
      if (mounted) setText(iso);
    }
  }, [iso]);

  return <div className="text-xs text-slate-500">{text}</div>;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatPrice(value: number, currency: string) {
  try {
    const locale = currency === 'USD' ? 'en-US' : 'es-AR';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  } catch (e) {
    return `${value}`;
  }
}

export default function LeadKanban({ companyId = "c1" }: { companyId?: string }) {
  const [leads, setLeads] = useState(() => sampleLeads.filter(l => l.companyId === companyId));

  function onDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDrop(e: React.DragEvent, stage: Stage) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, stage } : l)));
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {STAGE_ORDER.map((stage) => (
        <div
          key={stage}
          onDrop={(e) => onDrop(e as React.DragEvent, stage)}
          onDragOver={onDragOver}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <h3 className="text-sm font-semibold text-slate-700 flex items-center justify-between">
            <span>{STAGE_LABELS[stage]}</span>
            <span className="text-xs text-slate-400">{leads.filter(l => l.stage === stage).length}</span>
          </h3>

          <div className="mt-3 space-y-3 min-h-20">
            {leads
              .filter(l => l.stage === stage)
              .map((l) => {
                const prop = sampleProperties.find(p => p.id === l.propertyId);
                return (
                  <CardLead
                    className="hover:drop-shadow-xl hover:border hover:border-accent hover:cursor-pointer"
                    key={l.id}
                    id={l.id}
                    name={l.name}
                    phone={l.phone}
                    email={l.email}
                    origin={l.origin}
                    property={prop ? { title: prop.title, bedrooms: prop.bedrooms, price: prop.price, currency: prop.currency, operation: prop.operation } : undefined}
                    lastActivity={l.lastActivity}
                    draggable
                    onDragStart={onDragStart}
                  />
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
