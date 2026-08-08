"use client";

import { useState } from "react";
import { type Property } from "@/data/admin-sample";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { useCurrentSession } from "@/hooks/use-current-session";
import { MapPin, Maximize, DollarSign, UserPlus, Info } from "lucide-react";
import Link from "next/link";

type InventoryMatrixProps = {
  properties: Property[];
  isLoading?: boolean;
};

export default function InventoryMatrix({ properties, isLoading }: InventoryMatrixProps) {
  const { isEngineer } = useCurrentSession();
  const [selectedUnit, setSelectedUnit] = useState<Property | null>(null);

  // Group properties by sectorName
  const grouped = properties.reduce((acc, curr) => {
    const sector = curr.sectorName || "General";
    if (!acc[sector]) acc[sector] = [];
    acc[sector].push(curr);
    return acc;
  }, {} as Record<string, Property[]>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(s => (
          <div key={s}>
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-3" />
            <div className="flex flex-wrap gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-10 w-10 bg-slate-100 rounded-md animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-8">
        {Object.entries(grouped).map(([sector, units]) => {
          const isSoldOut = units.length > 0 && units.every(u => u.status === "sold");
          
          return (
            <div key={sector}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-bold text-slate-700">{sector}</h3>
                {isSoldOut && (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 rounded-md border border-slate-200">
                    Sold Out
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {units.map((unit) => {
                  const isAvailable = !unit.status || unit.status === "available";
                  const isReserved = unit.status === "reserved";
                  const isSold = unit.status === "sold";

                return (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit)}
                    className={cn(
                      "h-10 w-10 rounded-md border flex items-center justify-center text-xs font-bold transition-all hover:scale-110 hover:shadow-md",
                      isAvailable ? "bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-emerald-200 hover:border-emerald-300" :
                      isReserved ? "bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200 hover:border-amber-300" :
                      "bg-rose-100 border-rose-200 text-rose-700 hover:bg-rose-200 hover:border-rose-300"
                    )}
                    title={unit.title}
                  >
                    {unit.unitNumber?.replace(/\D/g, "") || unit.title.slice(0, 2)}
                  </button>
                );
              })}
            </div>
            </div>
          );
        })}

        {properties.length === 0 && (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
            No hay unidades registradas para este proyecto.
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-md bg-emerald-100 border border-emerald-200" /> 
          Disponible
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-md bg-amber-100 border border-amber-200" /> 
          Reservado
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-md bg-rose-100 border border-rose-200" /> 
          Vendido
        </div>
      </div>

      {/* Drawer Lateral */}
      <Sheet open={!!selectedUnit} onOpenChange={(open) => !open && setSelectedUnit(null)}>
        <SheetContent className="bg-slate-50 overflow-y-auto sm:max-w-md">
          {selectedUnit && (
            <>
              <SheetHeader className="mb-6 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <SheetTitle className="text-2xl font-bold text-slate-900">{selectedUnit.title}</SheetTitle>
                    <SheetDescription className="flex items-center gap-1 mt-1 text-slate-500">
                      <MapPin className="h-3.5 w-3.5" /> {selectedUnit.neighborhood}, {selectedUnit.city}
                    </SheetDescription>
                  </div>
                  <Badge className={cn(
                    "uppercase font-bold tracking-wider",
                    (!selectedUnit.status || selectedUnit.status === "available") ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                    selectedUnit.status === "reserved" ? "bg-amber-100 text-amber-700 border-amber-200" :
                    "bg-rose-100 text-rose-700 border-rose-200"
                  )}>
                    {(!selectedUnit.status || selectedUnit.status === "available") ? "Disponible" : selectedUnit.status === "reserved" ? "Reservado" : "Vendido"}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                {/* Info Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-slate-500 text-sm font-medium">Precio</span>
                    <span className="text-xl font-bold text-slate-900 flex items-center gap-1">
                      <DollarSign className="h-5 w-5 text-slate-400" />
                      {selectedUnit.price.toLocaleString('es-AR')} {selectedUnit.currency}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Tipo</span>
                      <span className="text-sm font-semibold text-slate-700">{selectedUnit.propertyType}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Sector / Piso</span>
                      <span className="text-sm font-semibold text-slate-700">{selectedUnit.sectorName || "-"}</span>
                    </div>
                    {selectedUnit.area_m2 && (
                      <div>
                        <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1"><Maximize className="h-3 w-3" /> Sup. Total</span>
                        <span className="text-sm font-semibold text-slate-700">{selectedUnit.area_m2} m²</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Servicios / Detalles adicionales */}
                {selectedUnit.services && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                      <Info className="h-4 w-4 text-blue-500" /> Servicios Disponibles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUnit.services.electricity && <Badge className="bg-slate-100 text-slate-700">Luz Eléctrica</Badge>}
                      {selectedUnit.services.water && <Badge className="bg-slate-100 text-slate-700">Agua Potable</Badge>}
                      {selectedUnit.services.gas && <Badge className="bg-slate-100 text-slate-700">Gas Natural</Badge>}
                      {selectedUnit.services.sewage && <Badge className="bg-slate-100 text-slate-700">Cloacas</Badge>}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="pt-4 flex flex-col gap-3">
                  {!isEngineer && (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-base font-semibold">
                      <UserPlus className="mr-2 h-5 w-5" /> Vincular Lead (Interesado)
                    </Button>
                  )}
                  
                  <Link href={`/admin/properties/${selectedUnit.id}`} className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-xl text-slate-700">
                      Ver ficha completa
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
