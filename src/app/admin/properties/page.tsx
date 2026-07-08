import PropertyList from "@/components/admin/PropertyList";
import { properties } from "@/data/admin-sample";
import Link from "next/link";

export default function AllPropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Propiedades</h1>
          <p className="mt-1 text-sm text-slate-500">Inventario completo</p>
        </div>
        <Link href="/admin">
          <button className="text-sm font-medium text-blue-700">Volver al dashboard</button>
        </Link>
      </div>

      <div>
        <PropertyList properties={properties} />
      </div>
    </div>
  );
}
