"use client";

import Link from "next/link";
import DashboardStats from "@/components/admin/DashboardStats";
import EnterpriseDashboard from "@/components/admin/EnterpriseDashboard";
import { properties } from "@/data/admin-sample";
import LeadKanban from "@/components/admin/LeadKanban";
import PropertyList from "@/components/admin/PropertyList";
import MonthlyAgendaSummary from "@/components/admin/MonthlyAgendaSummary";
import QuickStatsBanner from "@/components/admin/dashboard-widgets/QuickStatsBanner";
import PipelineFunnelWidget from "@/components/admin/dashboard-widgets/PipelineFunnelWidget";
import NextVisitCountdown from "@/components/admin/dashboard-widgets/NextVisitCountdown";
import { ArrowRight, Building2, HardHat, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardMode } from "@/lib/dashboard-context";
import { useCurrentSession } from "@/hooks/use-current-session";
import { motion, AnimatePresence } from "framer-motion";
import ApiIntegrationStatus from "@/components/admin/ApiIntegrationStatus";
import { isMockDataMode } from "@/lib/data-mode";

export default function AdminPage() {
  const { mode: dashboardMode, setMode: setDashboardMode } = useDashboardMode();
  const { isEngineer, isAdmin } = useCurrentSession();

  if (!isMockDataMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        <ApiIntegrationStatus />
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Panel conectado en modo API</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Sólo se muestran módulos respaldados por endpoints administrativos existentes. Métricas, leads, agenda, notificaciones y mutaciones permanecen bloqueados hasta contar con integración real.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link href="/admin/desarrollos" className="group rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/40">
              <HardHat className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h2 className="mt-3 font-bold text-slate-900">Proyectos reales</h2>
              <p className="mt-1 text-sm text-slate-500">Consulta de catálogo administrativo con estados de vacío y error.</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-blue-700">Abrir <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
            <Link href="/admin/properties" className="group rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/40">
              <Building2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h2 className="mt-3 font-bold text-slate-900">Propiedades reales</h2>
              <p className="mt-1 text-sm text-slate-500">Inventario administrativo en modo lectura, sin datos sustitutos.</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-blue-700">Abrir <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          </div>
        </section>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      {/* ── QUICK STATS BANNER ── */}
      {!isEngineer && (
        <section id="stats-banner">
          <QuickStatsBanner />
        </section>
      )}

      {/* ── DASHBOARD SECTION ── */}
      <section id="dashboard" className="scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          </div>

          {/* Dashboard Toggle */}
          {isAdmin && (
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setDashboardMode("agency")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-all",
                  dashboardMode === "agency" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Building2 className="h-4 w-4" /> Comercializadora
              </button>
              <button
                onClick={() => setDashboardMode("enterprise")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-all",
                  dashboardMode === "enterprise" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <HardHat className="h-4 w-4" /> Desarrolladora
              </button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={dashboardMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Engineers always see EnterpriseDashboard; Advisors always see DashboardStats (commercial) */}
            {isEngineer || (dashboardMode === "enterprise" && isAdmin) ? (
              <EnterpriseDashboard />
            ) : (
              <DashboardStats />
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {!isEngineer && (
        <>
          {/* ── PIPELINE FUNNEL + NEXT VISIT (side by side) ── */}
          <section id="pipeline" className="scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <PipelineFunnelWidget />
              </div>
              <div className="lg:col-span-2">
                <NextVisitCountdown />
              </div>
            </div>
          </section>

          {/* ── LEADS KANBAN ── */}
          <section id="leads" className="scroll-mt-24">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Embudos de venta</h2>
                <p className="mt-1 text-sm text-slate-500">Arrastrar para cambiar de estado</p>
              </div>
              <Link href="/admin/leads">
                <button className="text-sm font-medium text-blue-700 hover:text-blue-800">Ver todos los leads</button>
              </Link>
            </div>

            <div className="mt-4">
              <LeadKanban dashboardMode={dashboardMode} />
            </div>
          </section>

          {/* ── PROPERTIES ── */}
          <section id="properties" className="scroll-mt-24">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Propiedades</h2>
                <p className="mt-1 text-sm text-slate-500">Inventario y filtros</p>
              </div>
              <Link href="/admin/properties">
                <button className="text-sm font-medium text-blue-700 hover:text-blue-800">Ver todas las propiedades</button>
              </Link>
            </div>

            <div className="mt-4">
              <PropertyList properties={properties.slice(0, 5)} />
              <div className="mt-4 text-center">
                <Link href="/admin/properties">
                  <button className="px-6 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shadow-sm">
                    Gestionar Inventario Completo
                  </button>
                </Link>
              </div>
            </div>
          </section>

          {/* ── AGENDA ── */}
          <section id="agenda" className="scroll-mt-24">
            <MonthlyAgendaSummary />
          </section>
        </>
      )}
    </motion.div>
  );
}
