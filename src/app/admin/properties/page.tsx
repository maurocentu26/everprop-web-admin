import PropertyCardAdmin from "@/components/admin/PropertyCardAdmin";
import { properties } from "@/data/admin-sample";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, SlidersHorizontal, ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";

export default function AllPropertiesPage() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
      
      {/* Header con Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/admin" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline mb-2">
            <ArrowLeft size={12} /> VOLVER AL DASHBOARD
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventario de Propiedades</h1>
          <p className="text-slate-500 text-sm">Gestioná las {properties.length} unidades publicadas actualmente.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Selector de Vista (Simulado) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl mr-2">
            <Button size="sm" variant="ghost" className="bg-white shadow-sm rounded-lg h-8 w-8 p-0">
                <LayoutGrid size={16} className="text-blue-600" />
            </Button>
            <Button size="sm" variant="ghost" className="rounded-lg h-8 w-8 p-0 text-slate-400">
                <List size={16} />
            </Button>
          </div>

          <Button variant="outline" className="gap-2 rounded-xl text-slate-600">
            <SlidersHorizontal size={16} /> Filtros
          </Button>
          
          <Link href="/admin/properties/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl shadow-lg shadow-blue-200 font-bold">
                <Plus size={18} /> Nueva Unidad
            </Button>
          </Link>
        </div>
      </div>

      {/* Grilla Responsiva */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {properties.map((property) => (
          <PropertyCardAdmin key={property.id} property={property} />
        ))}
      </div>

      {/* Empty State en caso de no haber propiedades */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
            <Building2 size={64} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-400">No hay propiedades cargadas</h3>
            <p className="text-sm text-slate-400 mb-6">Empezá cargando tu primera unidad al sistema.</p>
            <Button className="bg-blue-600 text-white">Cargar Propiedad</Button>
        </div>
      )}
    </div>
  );
}