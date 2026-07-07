import Badge from "@/components/ui/badge";
import type { Property } from "@/data/admin-sample";
import { Building2 } from "lucide-react";

function formatPropertyPrice(value: number, currency: "USD" | "ARS") {
  try {
    const locale = currency === "USD" ? "en-US" : "es-AR";
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  } catch {
    return `${value}`;
  }
}

function getOperationLabel(operation: Property["operation"]) {
  return operation === "sale" ? "Venta" : operation === "rent" ? "Alquiler" : "Temporal";
}

type Props = {
  property: Property;
};

export default function PropertyCard({ property }: Props) {
  const isSale = property.operation === "sale";

  return (
    <tr className="group border-t border-slate-200 text-sm text-slate-700 hover:bg-slate-50/70">
      <td className="px-4 py-4 align-middle first:rounded-l-2xl last:rounded-r-2xl sm:px-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
            <Building2 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">{property.title}</h3>
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {property.id} · {property.neighborhood} {property.city ? `· ${property.city}` : ""}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 align-middle sm:px-5">
        <Badge variant={isSale ? "positive" : "default"}>{getOperationLabel(property.operation)}</Badge>
      </td>

      <td className="px-4 py-4 align-middle font-semibold text-slate-900 sm:px-5">
        {formatPropertyPrice(property.price, property.currency)}
      </td>

      <td className="px-4 py-4 align-middle text-slate-600 sm:px-5">
        {property.neighborhood}, {property.city}
      </td>

      <td className="px-4 py-4 align-middle text-slate-900 sm:px-5">
        {property.bedrooms}
      </td>

      <td className="px-4 py-4 align-middle text-slate-900 sm:px-5">
        {property.bathrooms}
      </td>
    </tr>
  );
}