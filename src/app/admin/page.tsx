import MetricCard from "@/components/admin/MetricCard";
import { properties } from "@/data/admin-sample";
import LeadKanban from "@/components/admin/LeadKanban";
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign
} from "lucide-react"

export default function AdminPage() {
  return (
    <section>
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Propiedades activas" 
            value={184} 
            delta="+12" 
            Icon={Building2}/>
          <MetricCard 
            title="Consultas activas" 
            value={28} 
            delta="+4" 
            Icon={Users}/>
          <MetricCard 
            title="Cierres del mes"
            value={9} 
            delta="-2"
            Icon={TrendingUp} />
          <MetricCard 
            title="Ingresos del mes"
            value="$412K"
            delta="+18%"
            Icon={DollarSign} />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Embudos de venta</h2>
          <p className="mt-1 text-sm text-slate-500">Arrastrar para cambiar de estado</p>

          <div className="mt-4">
            {/* Client-side Kanban */}
            {/* @ts-ignore Server Component import in client boundary is fine because LeadKanban is client */}
            <LeadKanban />
          </div>
        </div>
      </div>
    </section>
  );
}
