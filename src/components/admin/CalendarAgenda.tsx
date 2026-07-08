"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Lead, Property, Visit } from "@/data/admin-sample";
import { leads as sampleLeads, properties as sampleProperties } from "@/data/admin-sample";
import { loadLeadList, loadPropertyList, removeVisitById } from "@/lib/admin-storage";
import { Button } from "@/components/ui/button";

type AgendaItem = Visit & {
  leadName: string;
  propertyTitle?: string;
};

function getMonthDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay();

  const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  for (let i = 0; i < startingDay; i += 1) {
    days.push({ date: new Date(year, month, i - startingDay + 1), isCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({ date: new Date(year, month, day), isCurrentMonth: true });
  }

  const remaining = 42 - days.length;
  for (let day = 1; day <= remaining; day += 1) {
    days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
  }

  return days;
}

function formatMonthTitle(date: Date) {
  return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export default function CalendarAgenda() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);

  useEffect(() => {
    const leads = loadLeadList(sampleLeads, "c1");
    const properties = loadPropertyList(sampleProperties, "c1");

    const fromLeads = leads.flatMap((lead) =>
      (lead.visits ?? []).map((visit) => ({ ...visit, leadName: visit.leadName || lead.name, propertyTitle: visit.propertyTitle }))
    );

    const fromProperties = properties.flatMap((property) =>
      (property.visits ?? []).map((visit) => ({ ...visit, leadName: visit.leadName || "Visitante", propertyTitle: visit.propertyTitle || property.title }))
    );

    // merge and dedupe by id to avoid duplicate entries coming from both lead and property
    const map = new Map<string, AgendaItem>();
    [...fromLeads, ...fromProperties].forEach((it) => {
      if (!map.has(it.id)) map.set(it.id, it);
    });
    setAgendaItems(Array.from(map.values()));
  }, []);

  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    agendaItems.forEach((item) => {
      const dateKey = new Date(item.scheduledAt).toISOString().slice(0, 10);
      const existing = map.get(dateKey) ?? [];
      existing.push(item);
      map.set(dateKey, existing);
    });
    return map;
  }, [agendaItems]);

  const selectedDayKey = useMemo(() => currentDate.toISOString().slice(0, 10), [currentDate]);
  const selectedDayEvents = eventsByDay.get(selectedDayKey) ?? [];
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Calendario</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Agenda visual</h2>
        </div>
        <div className="rounded-full bg-blue-50 p-2 text-blue-600">
          <CalendarDays className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Anterior
          </Button>
          <div className="text-lg font-semibold capitalize text-slate-800">{formatMonthTitle(currentDate)}</div>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
            Siguiente
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((day) => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((item, index) => {
            const key = item.date.toISOString().slice(0, 10);
            const dayEvents = eventsByDay.get(key) ?? [];
            const isSelected = key === selectedDayKey;
            return (
              <button
                key={`${key}-${index}`}
                type="button"
                onClick={() => setCurrentDate(item.date)}
                className={`flex min-h-24 flex-col rounded-xl border p-2 text-left transition ${
                  item.isCurrentMonth ? 'border-slate-200 bg-white text-slate-700' : 'border-transparent bg-slate-100/70 text-slate-400'
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              >
                <span className="text-sm font-semibold">{item.date.getDate()}</span>
                <div className="mt-2 space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className="rounded bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-700">
                      {event.leadName}
                    </div>
                  ))}
                  {dayEvents.length > 2 ? <div className="text-[10px] text-slate-500">+{dayEvents.length - 2} más</div> : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Eventos del día</h3>
          <p className="text-sm text-slate-500">{currentDate.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No hay visitas agendadas para esta fecha.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {selectedDayEvents.map((event) => (
              <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{event.leadName}</p>
                    <p className="text-sm text-slate-500">{event.propertyTitle || "Sin propiedad"}</p>
                    {event.phone ? <p className="mt-1 text-sm text-slate-500">Tel: {event.phone}</p> : null}
                    {event.email ? <p className="text-sm text-slate-500">Email: {event.email}</p> : null}
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {new Date(event.scheduledAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div>
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setDeletingEventId(event.id)} className="text-rose-600">
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Dialog open={!!deletingEventId} onOpenChange={(open) => { if (!open) setDeletingEventId(null); }}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmar eliminación</DialogTitle>
                              <DialogDescription>¿Querés eliminar esta visita? Esta acción no se puede deshacer.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDeletingEventId(null)}>Cancelar</Button>
                              <Button
                                className="ml-2 bg-rose-600 text-white hover:bg-rose-700"
                                onClick={() => {
                                  if (deletingEventId) {
                                    removeVisitById(deletingEventId, sampleLeads, sampleProperties);
                                    setAgendaItems((prev) => prev.filter((it) => it.id !== deletingEventId));
                                    toast.success("Visita eliminada");
                                  }
                                  setDeletingEventId(null);
                                }}
                              >
                                Eliminar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
