"use client";

import { useEffect, useState } from "react";
import type { Property } from "@/data/admin-sample";
import PropertyCard from "@/components/admin/PropertyCard";
import { loadPropertyList, savePropertyList } from "@/lib/admin-storage";
import { properties as sampleProperties } from "@/data/admin-sample";

type Props = {
  properties: Property[];
};

export default function PropertyList({ properties }: Props) {
  const [items, setItems] = useState<Property[]>(properties);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadPropertyList(sampleProperties, "c1"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePropertyList(items);
  }, [hydrated, items]);

  const totalProperties = items.length;

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Propiedades</h2>
          <p className="mt-1 text-sm text-slate-500">
            Mostrando {totalProperties} de {totalProperties} activos
          </p>
        </div>
        <button className="text-sm font-medium text-blue-700 hover:text-blue-800">Manage</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-separate border-spacing-0 px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-4">
          <colgroup>
            <col className="w-[42%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[18%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
          </colgroup>

          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Propiedad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Ubicación</th>
              <th className="px-4 py-3">Dormitorios</th>
              <th className="px-4 py-3">Baños</th>
            </tr>
          </thead>

          <tbody>
            {items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}