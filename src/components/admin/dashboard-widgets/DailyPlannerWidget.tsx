"use client";

import { Calendar, CheckCircle, Smartphone } from "lucide-react";
import { type Lead } from "@/data/admin-sample";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type Props = {
  leads: Lead[];
};

export default function DailyPlannerWidget({ leads }: Props) {
  // 1. Extraer todas las visitas de todos los leads
  const allVisits = useMemo(() => {
    return leads.flatMap(lead => lead.visits || []);
  }, [leads]);

  // 2. Filtrar las visitas de HOY y ordenarlas por hora
  const todayVisits = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return allVisits
      .filter(v => {
        const vDate = new Date(v.scheduledAt);
        return vDate >= today && vDate < tomorrow;
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [allVisits]);

  // 3. Estado local para manejar las visitas que se marcan como concretadas en la UI
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const handleComplete = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" /> Agenda del Día
          </h2>
          <p className="mt-1 text-sm text-slate-500">Planificación de visitas para hoy</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {todayVisits.length > 0 ? (
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 py-2">
            {todayVisits.map((visit) => {
              const isLocallyCompleted = completedIds.has(visit.id);
              const isCompleted = visit.status === 'completed' || isLocallyCompleted;
              const isCancelled = visit.status === 'cancelled';

              const vDate = new Date(visit.scheduledAt);
              const timeString = vDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              const statusColor = isCancelled ? "bg-rose-500" : isCompleted ? "bg-emerald-500" : "bg-blue-500";

              return (
                <div key={visit.id} className="relative pl-6 sm:pl-8 group">
                  {/* Timeline Dot */}
                  <div className={cn("absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-white shadow-sm transition-colors", statusColor)} />

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {timeString}
                        </span>
                        <h4 className="font-semibold text-slate-800 text-base">{visit.leadName}</h4>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 inline-block mt-2">
                        <p className="text-sm text-slate-600 font-medium">
                          {visit.propertyTitle || 'Propiedad no especificada'}
                        </p>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <button
                        className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        onClick={() => window.open(`https://wa.me/`)}
                      >
                        <Smartphone className="h-4 w-4" /> WhatsApp
                      </button>
                      {!isCompleted && !isCancelled && (
                        <button
                          onClick={() => handleComplete(visit.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" /> Concretada
                        </button>
                      )}
                      {isCompleted && (
                        <span className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg">
                          <CheckCircle className="h-4 w-4" /> Lista
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No hay visitas programadas para hoy.</p>
          </div>
        )}
      </div>
    </section>
  );
}
