"use client";

import { useState, type FormEvent } from "react";
import { Save, UserRoundPen, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Lead } from "@/data/admin-sample";

const DEFAULT_ORIGINS = ["Web", "WhatsApp", "Portal", "Referido", "Instagram"];

type LeadProfileEditorProps = {
  lead: Lead;
  onClose: () => void;
  onSave: (lead: Lead) => void;
};

export function LeadProfileEditor({ lead, onClose, onSave }: LeadProfileEditorProps) {
  const [name, setName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone ?? "");
  const [email, setEmail] = useState(lead.email ?? "");
  const [origin, setOrigin] = useState(lead.origin);
  const [stage, setStage] = useState<Lead["stage"]>(lead.stage);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const origins = DEFAULT_ORIGINS.includes(lead.origin) ? DEFAULT_ORIGINS : [lead.origin, ...DEFAULT_ORIGINS];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      ...lead,
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      origin,
      stage,
      notes: notes.trim() || undefined,
      lastActivity: new Date().toISOString(),
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent fullScreen showCloseButton={false} className="flex bg-slate-50">
        <form onSubmit={handleSubmit} className="flex h-dvh min-h-0 w-full flex-col">
          <header className="shrink-0 border-b border-slate-200 bg-white px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 lg:px-12">
            <div className="mx-auto flex w-full max-w-[min(94vw,1800px)] items-start justify-between gap-5">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white sm:size-14">
                  <UserRoundPen className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Completar ficha del cliente</DialogTitle>
                  <DialogDescription className="mt-2 text-base leading-7 text-slate-600 sm:text-lg">Actualizá los datos conocidos sin modificar sus intereses.</DialogDescription>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={onClose} className="h-12 shrink-0 gap-2 px-4 text-base font-semibold sm:h-14">
                <X className="size-5" aria-hidden="true" /> <span className="hidden sm:inline">Cerrar</span>
              </Button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8 lg:px-12 lg:py-10">
            <div className="mx-auto grid w-full max-w-[min(94vw,1800px)] gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-2 lg:p-10">
              <label className="block text-base font-bold text-slate-800 lg:col-span-2">
                Nombre completo
                <Input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-14 border-slate-300 px-4 text-lg" />
              </label>
              <label className="block text-base font-bold text-slate-800">
                WhatsApp / Teléfono
                <Input type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 h-14 border-slate-300 px-4 text-lg" placeholder="Sin informar" />
              </label>
              <label className="block text-base font-bold text-slate-800">
                Email
                <Input type="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-14 border-slate-300 px-4 text-lg" placeholder="Sin informar" />
              </label>
              <label className="block text-base font-bold text-slate-800">
                Origen
                <select value={origin} onChange={(event) => setOrigin(event.target.value)} className="mt-2 h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg font-normal text-slate-900">
                  {origins.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-base font-bold text-slate-800">
                Estado
                <select value={stage} onChange={(event) => setStage(event.target.value as Lead["stage"])} className="mt-2 h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg font-normal text-slate-900">
                  <option value="new">Nuevo</option>
                  <option value="contacted">Contactado</option>
                  <option value="visiting">Visitando</option>
                  <option value="negotiation">Negociación</option>
                  <option value="closing">Cierre</option>
                </select>
              </label>
              <label className="block text-base font-bold text-slate-800 lg:col-span-2">
                Notas generales
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={6} className="mt-2 min-h-40 border-slate-300 px-4 py-3 text-lg leading-7" placeholder="Información general del cliente" />
              </label>
            </div>
          </div>

          <footer className="shrink-0 border-t border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-8 lg:px-12">
            <div className="mx-auto flex w-full max-w-[min(94vw,1800px)] flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} className="h-14 w-full px-6 text-lg font-semibold sm:w-auto">Cancelar</Button>
              <Button type="submit" className="h-14 w-full gap-2 bg-blue-600 px-8 text-lg font-bold text-white hover:bg-blue-700 sm:w-auto sm:min-w-56">
                <Save className="size-5" aria-hidden="true" /> Guardar ficha
              </Button>
            </div>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
