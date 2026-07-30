"use client";

import { Building2, MapPin, BedDouble, Bath, Ruler, MoreVertical, Edit3, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface Props {
  property: any;
}

export default function PropertyCardAdmin({ property }: Props) {
  return (
    <div className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300">
      
      {/* Imagen y Badges */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
          <Building2 size={48} strokeWidth={1} />
        </div>
        
        {/* Badge de Operación */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={cn(
            "px-3 py-1 rounded-full border-none font-bold text-[10px] tracking-wider text-white shadow-lg",
            property.operation === 'sale' ? "bg-emerald-500" : "bg-blue-600"
          )}>
            {property.operation === 'sale' ? 'VENTA' : 'ALQUILER'}
          </Badge>
        </div>

        {/* Menú de Acciones Rápidas */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-md border-none shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center">
                <MoreVertical className="h-4 w-4 text-slate-600" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-40">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Edit3 className="h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer text-blue-600">
                <Eye className="h-4 w-4" /> Ver Web
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer text-red-600">
                <Trash2 className="h-4 w-4" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-slate-900 leading-tight truncate group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium uppercase tracking-tighter">
            <MapPin className="h-3 w-3 text-red-400" />
            {property.neighborhood}, {property.city}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-xl font-black text-slate-900">
                {property.currency} {property.price.toLocaleString('es-AR')}
            </span>
          </div>

          {/* Mini Ficha Técnica */}
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-50">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Amb.</span>
              <div className="flex items-center gap-1 text-slate-700 font-bold text-xs">
                <BedDouble className="h-3 w-3 text-slate-400" /> {property.bedrooms}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Baños</span>
              <div className="flex items-center gap-1 text-slate-700 font-bold text-xs">
                <Bath className="h-3 w-3 text-slate-400" /> {property.bathrooms}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Sup.</span>
              <div className="flex items-center gap-1 text-slate-700 font-bold text-xs">
                <Ruler className="h-3 w-3 text-slate-400" /> {property.area_m2}m²
              </div>
            </div>
          </div>

          <Link href={`/admin/properties/${property.id}`} className="block mt-2">
            <Button className="w-full bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border-none rounded-xl text-xs font-bold transition-all">
                Gestionar Propiedad
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}