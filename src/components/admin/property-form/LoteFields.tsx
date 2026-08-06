import { Droplets, Zap, Route, Waves, LayoutTemplate } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type FieldProps } from "./types";

export default function LoteFields({ register }: FieldProps) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="area_m2" className="text-sm font-bold text-slate-800">Superficie (m²)</FieldLabel>
        <Input id="area_m2" type="number" {...register("area_m2")} placeholder="300" className="h-11 rounded-xl bg-slate-50" />
      </Field>
      <Field>
        <FieldLabel htmlFor="sectorName" className="text-sm font-bold text-slate-800">Manzana <span className="text-rose-500">*</span></FieldLabel>
        <Input id="sectorName" {...register("sectorName")} placeholder="Manzana A" className="h-11 rounded-xl bg-slate-50" />
      </Field>
      <Field>
        <FieldLabel htmlFor="unitNumber" className="text-sm font-bold text-slate-800">Nro Lote <span className="text-rose-500">*</span></FieldLabel>
        <Input id="unitNumber" {...register("unitNumber")} placeholder="14" className="h-11 rounded-xl bg-slate-50" />
      </Field>
      <Field>
        <FieldLabel htmlFor="spaceType" className="text-sm font-bold text-slate-800">Espacio</FieldLabel>
        <select
          id="spaceType"
          {...register("spaceType")}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
          <option value="Abierto">Abierto</option>
          <option value="Semiabierto">Semiabierto</option>
          <option value="Cerrado">Cerrado</option>
        </select>
      </Field>

      <div className="md:col-span-2 pt-4 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-800 mb-3">Infraestructura del Terreno</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input type="checkbox" {...register("water")} className="w-4 h-4 text-emerald-600 rounded" />
            <Droplets className="w-4 h-4 text-emerald-500" /> <span className="text-sm font-medium text-slate-700">Agua</span>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input type="checkbox" {...register("electricity")} className="w-4 h-4 text-yellow-500 rounded" />
            <Zap className="w-4 h-4 text-yellow-500" /> <span className="text-sm font-medium text-slate-700">Luz</span>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input type="checkbox" {...register("sewage")} className="w-4 h-4 text-slate-600 rounded" />
            <Waves className="w-4 h-4 text-slate-500" /> <span className="text-sm font-medium text-slate-700">Cloacas</span>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input type="checkbox" {...register("curb")} className="w-4 h-4 text-slate-600 rounded" />
            <LayoutTemplate className="w-4 h-4 text-slate-500" /> <span className="text-sm font-medium text-slate-700">Cordón</span>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input type="checkbox" {...register("gravel")} className="w-4 h-4 text-slate-600 rounded" />
            <Route className="w-4 h-4 text-slate-500" /> <span className="text-sm font-medium text-slate-700">Enripiado</span>
          </label>
        </div>
      </div>
    </>
  );
}
