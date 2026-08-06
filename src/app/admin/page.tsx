"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardStats from "@/components/admin/DashboardStats";
import EnterpriseDashboard from "@/components/admin/EnterpriseDashboard";
import { properties } from "@/data/admin-sample";
import LeadKanban from "@/components/admin/LeadKanban";
import PropertyList from "@/components/admin/PropertyList";
import MonthlyAgendaSummary from "@/components/admin/MonthlyAgendaSummary";
import { Building2, HardHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardMode } from "@/lib/dashboard-context";

export default function AdminPage() {
  const { mode: dashboardMode, setMode: setDashboardMode } = useDashboardMode();

  return (
    <div className="space-y-10">
      <section id="dashboard" className="scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          </div>
          
          {/* Dashboard Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setDashboardMode("agency")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-all",
                dashboardMode === "agency" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Building2 className="h-4 w-4" /> Inmobiliaria
            </button>
            <button
              onClick={() => setDashboardMode("enterprise")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-all",
                dashboardMode === "enterprise" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <HardHat className="h-4 w-4" /> Desarrollador
            </button>
          </div>
        </div>

        {dashboardMode === "enterprise" ? (
          <EnterpriseDashboard />
        ) : (
          <DashboardStats />
        )}
      </section>

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

      <section id="agenda" className="scroll-mt-24">
        <MonthlyAgendaSummary />
      </section>
    </div>
  );
}
