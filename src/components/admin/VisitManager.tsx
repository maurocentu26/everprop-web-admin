"use client";

import { useMemo, useState, useEffect } from "react";
import { CalendarDays, Clock3, UserRound, Trash } from "lucide-react";
import type { Visit, Lead } from "@/data/admin-sample";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  title: string;
  subtitle: string;
  visits: Visit[];
  onSchedule: (visit: Visit) => void;
  onDelete?: (visitId: string) => void;
  defaultGuestName?: string;
  leadOptions?: Lead[];
  defaultPhone?: string;
  defaultEmail?: string;
};

function formatVisitDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function VisitManager({
  title,
  subtitle,
  visits,
  onSchedule,
  onDelete,
  defaultGuestName,
  leadOptions,
  defaultPhone,
  defaultEmail,
}: Props) {
  const [guestName, setGuestName] = useState(defaultGuestName ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>(undefined);
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // When parent provides defaults (e.g., from LeadDetailView), prefill fields
    if (defaultGuestName) setGuestName(defaultGuestName);
    if (defaultPhone) setPhone(defaultPhone);
    if (defaultEmail) setEmail(defaultEmail);
  }, [defaultGuestName, defaultPhone, defaultEmail]);
  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null);

  const sortedVisits = useMemo(() => {
    return [...visits].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [visits]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!guestName.trim()) {
      setError("Ingresá el nombre del visitante.");
      return;
    }

    if (!scheduledAt) {
      setError("Seleccioná una fecha y hora para la visita.");
      return;
    }

    const visit: Visit = {
      id: `visit-${Date.now()}`,
      leadId: selectedLeadId,
      leadName: guestName.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      scheduledAt: new Date(scheduledAt).toISOString(),
      notes: notes.trim() || undefined,
      status: "scheduled",
    };

    onSchedule(visit);
    setGuestName(defaultGuestName ?? "");
    setScheduledAt("");
    setNotes("");
    setError("");
  }

  return (
    <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-[0_16px_50px_-24px_rgba(15,23,42,0.35)] py-0">
      <div className="bg-slate-950/95 px-6 py-5 text-white">
        <CardHeader className="p-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-semibold text-white">{title}</CardTitle>
              <CardDescription className="mt-2 text-sm text-slate-300">{subtitle}</CardDescription>
            </div>
            <div className="rounded-full bg-white/10 p-2 text-white">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
      </div>

      <CardContent className="px-6 py-6">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1.1fr_0.9fr_auto]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Visitante</label>
            <div className="relative">
              <Input
                value={guestName}
                onChange={(event) => {
                  const value = event.target.value;
                  setGuestName(value);
                  setShowSuggestions(true);
                  // try to detect exact match
                  if (leadOptions && leadOptions.length) {
                    const match = leadOptions.find((l) => l.name === value);
                    if (match) {
                      setSelectedLeadId(match.id);
                      if (!notes.trim() && (match.phone || match.email)) {
                        const parts: string[] = [];
                        if (match.phone) parts.push(`Tel: ${match.phone}`);
                        if (match.email) parts.push(`Email: ${match.email}`);
                        setNotes(parts.join(" • "));
                      }
                      setPhone(match.phone ?? "");
                      setEmail(match.email ?? "");
                      setShowSuggestions(false);
                      return;
                    }
                  }
                  setSelectedLeadId(undefined);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Nombre del visitante"
                className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200"
              />

              {leadOptions && leadOptions.length && showSuggestions ? (
                <div className="absolute z-20 mt-1 max-h-44 w-full overflow-auto rounded-md border border-slate-800 bg-black shadow-lg">
                  {leadOptions
                    .filter((l) => l.name.toLowerCase().includes((guestName || "").toLowerCase()))
                    .map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onMouseDown={() => {
                          setGuestName(l.name);
                          setSelectedLeadId(l.id);
                          setPhone(l.phone ?? "");
                          setEmail(l.email ?? "");
                          if (!notes.trim() && (l.phone || l.email)) {
                            const parts: string[] = [];
                            if (l.phone) parts.push(`Tel: ${l.phone}`);
                            if (l.email) parts.push(`Email: ${l.email}`);
                            setNotes(parts.join(" • "));
                          }
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-900"
                      >
                        <div className="flex items-center justify-between text-white">
                          <div className="truncate">{l.name}</div>
                          <div className="text-xs text-slate-300">{l.phone ?? l.email}</div>
                        </div>
                      </button>
                    ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Contacto</label>
            <div className="flex gap-2">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200" />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Fecha y hora</label>
            <Input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200" />
          </div>

          <div className="flex items-end">
            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
              Agendar
            </Button>
          </div>

          <div className="md:col-span-3">
            <label className="text-sm font-medium text-slate-700">Notas</label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Agregar observaciones o instrucciones" className="mt-2 min-h-24 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200" />
          </div>
        </form>

        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Visitas agendadas</h3>

          {sortedVisits.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Todavía no hay visitas agendadas para este registro.
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {sortedVisits.map((visit) => (
                  <div key={visit.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="rounded-full bg-white p-2 text-slate-600">
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{visit.leadName || "Visitante"}</p>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                            {visit.status === "scheduled" ? "Programada" : visit.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {onDelete ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => setDeletingVisitId(visit.id)} className="text-rose-600">
                                <Trash className="h-4 w-4" />
                              </Button>
                              <Dialog open={!!deletingVisitId} onOpenChange={(open) => { if (!open) setDeletingVisitId(null); }}>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirmar eliminación</DialogTitle>
                                    <DialogDescription>¿Querés eliminar esta visita? Esta acción no se puede deshacer.</DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeletingVisitId(null)}>Cancelar</Button>
                                    <Button
                                      className="ml-2 bg-rose-600 text-white hover:bg-rose-700"
                                      onClick={() => {
                                        if (deletingVisitId) {
                                          onDelete(deletingVisitId);
                                          toast.success("Visita eliminada");
                                        }
                                        setDeletingVisitId(null);
                                      }}
                                    >
                                      Eliminar
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{formatVisitDate(visit.scheduledAt)}</p>
                      {visit.notes ? <p className="mt-2 text-sm text-slate-500">{visit.notes}</p> : null}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
