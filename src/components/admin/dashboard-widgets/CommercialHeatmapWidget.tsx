import { Store, CheckCircle2, Clock } from "lucide-react";
import { type Project, type Property } from "@/data/admin-sample";
import { cn } from "@/lib/utils";

type Props = {
  commercials: Property[];
  projects: Project[];
};

export default function CommercialHeatmapWidget({ commercials, projects }: Props) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Store className="h-5 w-5 text-indigo-600" /> Heatmap Comercial (Locales y Cocheras)
      </h2>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-4 py-3">Unidad / Tipo</th>
                <th className="px-4 py-3">Proyecto / Sector</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Características</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commercials.length > 0 ? commercials.slice(0, 5).map(unit => (
                <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{unit.unitNumber || unit.title}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{unit.propertyType}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {projects.find(p => p.id === unit.projectId)?.name || 'Sin Proyecto'}
                    <br />
                    <span className="text-xs text-slate-400">{unit.sectorName}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {unit.currency} {unit.price}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs">
                      {unit.isCovered && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Cubierta</span>}
                      {unit.commercialFeatures?.showcaseLength && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Vidriera: {unit.commercialFeatures.showcaseLength}m</span>}
                      {unit.commercialFeatures?.hasBathroom && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Baño</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                      (!unit.status || unit.status === 'available') ? "bg-emerald-100 text-emerald-700" :
                      unit.status === 'reserved' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {(!unit.status || unit.status === 'available') ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {(!unit.status || unit.status === 'available') ? 'Disponible' : unit.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm italic">
                    No hay activos comerciales registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {commercials.length > 5 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center">
            <a href="/admin/properties" className="px-6 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors shadow-sm">
              Ver todas las unidades ({commercials.length})
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
