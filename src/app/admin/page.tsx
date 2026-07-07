import DashboardStats from "@/components/admin/DashboardStats";
import { properties } from "@/data/admin-sample";
import LeadKanban from "@/components/admin/LeadKanban";
import PropertyList from "@/components/admin/PropertyList";

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
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Embudos de venta</h2>
          <p className="mt-1 text-sm text-slate-500">Arrastrar para cambiar de estado</p>

          <div className="mt-4">
            {/* Client-side Kanban */}
            {/* @ts-ignore Server Component import in client boundary is fine because LeadKanban is client */}
            <LeadKanban />
          </div>
        </div>
      </section>
      
      <section id="properties" className="scroll-mt-24">
        <PropertyList properties={properties} />
      </section>

      {/* <section id="agenda" className="scroll-mt-24">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Agenda de visitas</h2>
          <p className="mt-1 text-sm text-slate-500">
            Calendario operativo y visitas programadas. Este módulo todavía está pendiente de implementación.
          </p>
        </div>
      </section>

      <section id="settings" className="scroll-mt-24">
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
