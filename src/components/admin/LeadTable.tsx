"use client";

import { useState, useMemo } from "react";
import { 
  MoreHorizontal, 
  MessageCircle, 
  Phone, 
  Mail, 
  Eye,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { leads as sampleLeads, properties as sampleProperties, type Lead } from "@/data/admin-sample";
import  Badge  from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Mapa de colores para los estados (Consistente con el Kanban)
const STAGE_LABELS: Record<string, { label: string; class: string }> = {
  new: { label: "Nuevo", class: "bg-slate-100 text-slate-700" },
  contacted: { label: "Contactado", class: "bg-blue-100 text-blue-700" },
  visiting: { label: "Visitando", class: "bg-amber-100 text-amber-700" },
  closing: { label: "Cerrando", class: "bg-emerald-100 text-emerald-700" },
};

export default function LeadTable() {
  const router = useRouter();
  const [leads] = useState<Lead[]>(sampleLeads);

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Interesado</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Propiedad / Precio</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Estado</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Origen</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Última Actividad</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {leads.map((lead) => {
              const props = sampleProperties.find(p => p.id === lead.propertyIds[0]);
              const stage = STAGE_LABELS[lead.stage] || { label: lead.stage, class: "" };

              return (
                <tr key={lead.id} className="group hover:bg-slate-50/50 transition-colors">
                  {/* Columna: Interesado */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-100">
                        <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {getInitials(lead.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 leading-tight">{lead.name}</span>
                        <span className="text-xs text-slate-500">{lead.email || "Sin email"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Columna: Propiedad */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-700 truncate max-w-[200px] font-medium">
                        {props?.title || "Sin propiedad"}
                      </span>
                      <span className="text-xs font-bold text-blue-600">
                        {props ? `${props.currency} ${props.price.toLocaleString()}` : "-"}
                      </span>
                    </div>
                  </td>

                  {/* Columna: Estado */}
                  <td className="px-6 py-4">
                    <Badge className={cn("px-2 py-0.5 rounded-full border-none shadow-none text-[10px] font-bold uppercase", stage.class)}>
                      {stage.label}
                    </Badge>
                  </td>

                  {/* Columna: Origen */}
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      {lead.origin}
                    </span>
                  </td>

                  {/* Columna: Fecha */}
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500">
                      {new Date(lead.lastActivity).toLocaleDateString('es-AR')}
                    </span>
                  </td>

                  {/* Columna: Acciones */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => window.open(`https://wa.me/${lead.phone}`, '_blank')}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => router.push(`/admin/leads/${lead.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}