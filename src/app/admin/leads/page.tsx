// src/app/admin/leads/page.tsx
import LeadTable from "@/components/admin/LeadTable";
import { Button } from "@/components/ui/button";
import { Download, Plus, Filter } from "lucide-react";
import Link from "next/link";

export default function AllLeadsPage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
      {/* Header mejorado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leads</h1>
          <p className="mt-1 text-slate-500 text-sm">Gestioná y analizá todos los interesados de la inmobiliaria.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 text-slate-600">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
          <Link href="/admin/leads/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros rápidos (Opcional pero recomendado para QA Visual) */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto">
        <Button variant="secondary" size="sm" className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100">Todos</Button>
        <Button variant="ghost" size="sm" className="rounded-full text-slate-500">Nuevos</Button>
        <Button variant="ghost" size="sm" className="rounded-full text-slate-500">En proceso</Button>
        <Button variant="ghost" size="sm" className="rounded-full text-slate-500">Cerrados</Button>
        <div className="ml-auto">
            <Button variant="ghost" size="sm" className="text-slate-400 gap-2">
                <Filter className="h-3 w-3" />
                Filtros avanzados
            </Button>
        </div>
      </div>

      {/* El componente de la tabla */}
      <LeadTable />
    </div>
  );
}