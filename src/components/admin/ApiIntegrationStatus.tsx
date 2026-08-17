"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Database, Loader2 } from "lucide-react";
import { everpropHealth, loadEverpropCatalog } from "@/lib/everprop-api";

type IntegrationState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      source: "admin-api" | "public-api";
      projects: number;
      properties: number;
    };

export default function ApiIntegrationStatus() {
  const [state, setState] = useState<IntegrationState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function inspectIntegration() {
      try {
        const [healthy, catalog] = await Promise.all([everpropHealth(), loadEverpropCatalog()]);
        if (!healthy) throw new Error("El healthcheck no confirmó estado operativo.");
        if (active) {
          setState({
            status: "ready",
            source: catalog.source,
            projects: catalog.projects.length,
            properties: catalog.properties.length,
          });
        }
      } catch (reason) {
        if (active) {
          setState({
            status: "error",
            message: reason instanceof Error ? reason.message : "No se pudo verificar la integración.",
          });
        }
      }
    }

    void inspectIntegration();
    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm" role="status">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
        Verificando Laravel, tenant y catálogo…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
        <div>
          <p className="font-semibold">API no disponible; módulos en modo demo</p>
          <p className="mt-0.5 text-xs text-amber-800">{state.message}</p>
        </div>
      </div>
    );
  }

  const authenticated = state.source === "admin-api";
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <div>
          <p className="font-semibold">EverProp API conectada · tenant Bellomo</p>
          <p className="mt-0.5 text-xs text-emerald-800">
            {authenticated ? "Catálogo administrativo autenticado." : "Catálogo público real; edición aún en modo demo."}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs font-semibold text-emerald-900">
        <Database className="h-4 w-4" aria-hidden="true" />
        <span>{state.projects} proyectos</span>
        <span>{state.properties} propiedades</span>
      </div>
    </div>
  );
}
