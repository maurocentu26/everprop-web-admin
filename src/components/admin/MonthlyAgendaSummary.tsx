"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadLeadList, loadPropertyList } from "@/lib/admin-storage";
import { leads as sampleLeads, properties as sampleProperties } from "@/data/admin-sample";
import { Button } from "@/components/ui/button";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export default function MonthlyAgendaSummary() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [visits, setVisits] = useState<any[]>([]);

  useEffect(() => {
    const leads = loadLeadList(sampleLeads, "c1");
    const properties = loadPropertyList(sampleProperties, "c1");

    const fromLeads = leads.flatMap((lead) => (lead.visits ?? []).map((v) => ({ ...v, leadName: v.leadName || lead.name, propertyTitle: v.propertyTitle })));
    const fromProps = properties.flatMap((prop) => (prop.visits ?? []).map((v) => ({ ...v, leadName: v.leadName || "Visitante", propertyTitle: v.propertyTitle || prop.title })));

    const map = new Map<string, any>();
    [...fromLeads, ...fromProps].forEach((it) => { if (!map.has(it.id)) map.set(it.id, it); });
    setVisits(Array.from(map.values()));
  }, []);

  const month = useMemo(() => currentDate.getMonth(), [currentDate]);
  const year = useMemo(() => currentDate.getFullYear(), [currentDate]);

  const monthVisits = useMemo(() => {
    return visits.filter((v) => {
      const d = new Date(v.scheduledAt);
      return d.getMonth() === month && d.getFullYear() === year;
    }).sort((a,b)=>new Date(a.scheduledAt).getTime()-new Date(b.scheduledAt).getTime());
  }, [visits, month, year]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Agenda — {currentDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}</h3>
          <p className="mt-1 text-sm text-slate-500">Visitas agendadas para este mes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>Siguiente mes</Button>
          <Link href="/admin/agenda">
            <Button size="sm" className="bg-blue-600 text-white">Ver calendario</Button>
          </Link>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {monthVisits.length === 0 ? (
          <div className="text-sm text-slate-500">No hay visitas para este mes.</div>
        ) : (
          monthVisits.slice(0,5).map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
              <div>
                <div className="font-medium text-slate-900">{v.leadName || 'Visitante'}</div>
                <div className="text-xs text-slate-500">{v.propertyTitle || 'Sin propiedad'} • {new Date(v.scheduledAt).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}</div>
              </div>
              <div className="text-xs text-slate-500">{new Date(v.scheduledAt).toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit'})}</div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Link href="/admin/agenda">
          <Button variant="link">Ver todos</Button>
        </Link>
      </div>
    </div>
  );
}
