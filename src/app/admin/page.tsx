import Link from "next/link";
import DashboardStats from "@/components/admin/DashboardStats";
import { properties } from "@/data/admin-sample";
import LeadKanban from "@/components/admin/LeadKanban";
import PropertyList from "@/components/admin/PropertyList";
import MonthlyAgendaSummary from "@/components/admin/MonthlyAgendaSummary";

export default function AdminPage() {
  return (
    <div className="space-y-10">
      <section id="dashboard" className="scroll-mt-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          </div>
        </div>

        <DashboardStats />
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
          {/* Client-side Kanban */}
          {/* @ts-ignore Server Component import in client boundary is fine because LeadKanban is client */}
          <LeadKanban />
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
          <PropertyList properties={properties} />
        </div>
      </section>

      <section id="agenda" className="scroll-mt-24">
        <MonthlyAgendaSummary />
      </section>

      {/* <section id="settings" className="scroll-mt-24">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Configuración</h2>
          <p className="mt-1 text-sm text-slate-500">
            Perfil de empresa, branding e integraciones SaaS. Este módulo todavía está pendiente de implementación.
          </p>
        </div>
      </section> */}
    </div>
  );
}
