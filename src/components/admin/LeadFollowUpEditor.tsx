"use client";

import { RefreshCw, X } from "lucide-react";

import { LeadFollowUpStatus } from "@/components/admin/LeadFollowUpStatus";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type LeadFollowUpEditorProps = {
  leadName: string;
  updatedAt?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function LeadFollowUpEditor({
  leadName,
  updatedAt,
  onClose,
  onConfirm,
}: LeadFollowUpEditorProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent fullScreen showCloseButton={false} className="flex bg-slate-50">
        <div className="flex h-dvh min-h-0 w-full flex-col">
          <header className="shrink-0 border-b border-slate-200 bg-white px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 lg:px-12">
            <div className="mx-auto flex w-full max-w-[min(94vw,1600px)] items-start justify-between gap-5">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white sm:size-14">
                  <RefreshCw className="size-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <DialogTitle className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Actualizar seguimiento
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-base leading-7 text-slate-600 sm:text-lg">
                    Registrá una nueva actualización para {leadName}.
                  </DialogDescription>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={onClose} className="h-12 shrink-0 gap-2 px-4 text-base font-semibold sm:h-14">
                <X className="size-5" aria-hidden="true" />
                <span className="hidden sm:inline">Cerrar</span>
              </Button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12 lg:py-10">
            <div className="mx-auto w-full max-w-[min(94vw,1600px)]">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10" aria-labelledby="follow-up-confirmation-title">
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-blue-700">Estado actual</p>
                <h2 id="follow-up-confirmation-title" className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Seguimiento de {leadName}
                </h2>
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                  Al confirmar se guardará la fecha y hora actuales como última actualización del seguimiento. La ficha, los intereses y sus fechas de edición no se modificarán.
                </p>
                <LeadFollowUpStatus updatedAt={updatedAt} className="mt-6 max-w-3xl" />
              </section>
            </div>
          </div>

          <footer className="shrink-0 border-t border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-8 lg:px-12">
            <div className="mx-auto flex w-full max-w-[min(94vw,1600px)] flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} className="h-14 w-full px-6 text-lg font-semibold sm:w-auto">
                Cancelar
              </Button>
              <Button type="button" onClick={onConfirm} className="h-14 w-full gap-2 bg-blue-600 px-8 text-lg font-bold text-white hover:bg-blue-700 sm:w-auto sm:min-w-64">
                <RefreshCw className="size-5" aria-hidden="true" />
                Confirmar actualización
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
