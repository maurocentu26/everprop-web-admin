"use client";

import { useState, useEffect } from "react";
import { Store, Car, CheckCircle2, Clock } from "lucide-react";
import { type Property, properties as sampleProperties } from "@/data/admin-sample";
import { loadPropertyList } from "@/lib/admin-storage";
import { cn } from "@/lib/utils";

export default function CommercialAssetsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProperties(loadPropertyList(sampleProperties, "c1"));
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-64 bg-slate-200 rounded"></div>
        <div className="h-96 bg-slate-100 rounded-3xl"></div>
      </div>
    );
  }

  const locals = properties.filter(p => p.propertyType === "Local");
  const garages = properties.filter(p => p.propertyType === "Cochera");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Store className="h-8 w-8 text-indigo-600" /> 
          Activos Comerciales
        </h1>
        <p className="text-slate-500 mt-1">Heatmap de Locales y Cocheras, rentabilidad y ocupación.</p>
      </header>

      {/* Seccion: Locales */}
      <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <Store className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-800">Locales Comerciales</h2>
          <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">{locals.length}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">ID / Ubicación</th>
                <th className="px-6 py-4">Dimensiones</th>
                <th className="px-6 py-4">Renta Mensual</th>
                <th className="px-6 py-4">Características</th>
                <th className="px-6 py-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locals.length > 0 ? locals.map(local => {
                const isAvailable = !local.status || local.status === 'available';
                return (
                  <tr key={local.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{local.unitNumber || local.title}</p>
                      <p className="text-xs text-slate-500">{local.sectorName || "Planta Baja"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-700">{local.area_m2} m²</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{local.currency} {local.price.toLocaleString('es-AR')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 text-xs">
                        {local.commercialFeatures?.showcaseLength && <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-medium border border-slate-200">Vidriera: {local.commercialFeatures.showcaseLength}m</span>}
                        {local.commercialFeatures?.hasBathroom && <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-medium border border-slate-200">Baño</span>}
                        {local.commercialFeatures?.mezzanine && <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600 font-medium border border-slate-200">Entrepiso</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border",
                        isAvailable ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        local.status === 'reserved' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {isAvailable ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        {isAvailable ? 'Disponible' : local.status === 'sold' ? 'Alquilado' : 'Reservado'}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">No hay locales registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Seccion: Cocheras */}
      <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <Car className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">Cocheras</h2>
          <span className="ml-2 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold">{garages.length}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Unidad</th>
                <th className="px-6 py-4">Nivel / Sector</th>
                <th className="px-6 py-4">Valor Mensual</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {garages.length > 0 ? garages.map(garage => {
                const isAvailable = !garage.status || garage.status === 'available';
                return (
                  <tr key={garage.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{garage.unitNumber || garage.title}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {garage.sectorName || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{garage.currency} {garage.price.toLocaleString('es-AR')}</span>
                    </td>
                    <td className="px-6 py-4">
                      {garage.isCovered ? (
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">Cubierta</span>
                      ) : (
                        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">Descubierta</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border",
                        isAvailable ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        garage.status === 'reserved' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {isAvailable ? 'Disponible' : garage.status === 'sold' ? 'Alquilada' : 'Reservada'}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">No hay cocheras registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
