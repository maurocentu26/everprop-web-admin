"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, Building2, MapPin, Grid, Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { type Project } from "@/data/admin-sample";

const projectSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  locationCity: z.string().min(2, "Ingresá una ciudad"),
  locationProvince: z.string().min(2, "Ingresá una provincia"),
  type: z.enum(["land_development", "building", "commercial"]),
  totalUnits: z.coerce.number().min(1, "Debe tener al menos 1 unidad"),
  services: z.array(z.string()).optional(),
  progress: z.coerce.number().min(0).max(100),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProjectForm() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      type: "land_development",
      services: [],
      progress: 0,
    }
  });

  const selectedType = watch("type");
  const selectedServices = watch("services") || [];

  const handleImageMock = () => {
    // Mock image upload
    setUploadedImage("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop");
  };

  const toggleService = (service: string) => {
    const next = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    setValue("services", next, { shouldValidate: true });
  };

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSaving(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Here we would normally save to the global state/DB
    console.log("Saving project:", data);

    router.push("/admin/desarrollos");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 1. Datos Principales */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Datos del Desarrollo
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nombre del Proyecto <span className="text-rose-500">*</span></Label>
            <Input id="name" {...register("name")} placeholder="Ej. Barrio San José" className="h-12" />
            {errors.name && <p className="text-rose-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationCity">Ciudad <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input id="locationCity" {...register("locationCity")} placeholder="San Salvador de Jujuy" className="h-12 pl-10" />
            </div>
            {errors.locationCity && <p className="text-rose-500 text-sm">{errors.locationCity.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationProvince">Provincia <span className="text-rose-500">*</span></Label>
            <Input id="locationProvince" {...register("locationProvince")} placeholder="Jujuy" className="h-12" />
            {errors.locationProvince && <p className="text-rose-500 text-sm">{errors.locationProvince.message}</p>}
          </div>
        </div>
      </div>

      {/* 2. Tipo y Unidades */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-600" />
          Características
        </h2>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Tipo de Desarrollo <span className="text-rose-500">*</span></Label>
            <RadioGroup
              value={selectedType}
              onValueChange={(val) => setValue("type", val as any)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                { id: "land_development", label: "Loteo", desc: "Barrio cerrado o abierto" },
                { id: "building", label: "Edificio", desc: "Departamentos en pozo" },
                { id: "commercial", label: "Comercial", desc: "Galerías o Cocheras" }
              ].map(type => (
                <div key={type.id}>
                  <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
                  <Label
                    htmlFor={type.id}
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 transition-all cursor-pointer"
                  >
                    <span className="font-semibold text-slate-900 mb-1">{type.label}</span>
                    <span className="text-xs text-slate-500">{type.desc}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="totalUnits">Cantidad Total de Unidades <span className="text-rose-500">*</span></Label>
              <div className="relative">
                <Grid className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input id="totalUnits" type="number" {...register("totalUnits")} placeholder="120" className="h-12 pl-10" />
              </div>
              {errors.totalUnits && <p className="text-rose-500 text-sm">{errors.totalUnits.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Avance de Obra (%) <span className="text-rose-500">*</span></Label>
              <Input id="progress" type="number" {...register("progress")} placeholder="0" className="h-12" />
              {errors.progress && <p className="text-rose-500 text-sm">{errors.progress.message}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Servicios e Imagen */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Label className="text-base font-bold">Servicios Incluidos</Label>
          <div className="space-y-3">
            {[
              { id: "water", label: "Agua Potable" },
              { id: "electricity", label: "Electricidad" },
              { id: "gas", label: "Gas Natural" },
              { id: "sewer", label: "Cloacas" },
              { id: "paving", label: "Pavimento / Cordón Cuneta" },
              { id: "security", label: "Seguridad 24hs" },
            ].map(service => (
              <div key={service.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={service.id} 
                  checked={selectedServices.includes(service.id)}
                  onCheckedChange={() => toggleService(service.id)}
                />
                <label htmlFor={service.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
                  {service.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-bold">Imagen Principal del Proyecto</Label>
          <div 
            className={cn(
              "border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center p-6 text-center transition-colors cursor-pointer relative overflow-hidden",
              uploadedImage ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400"
            )}
            onClick={handleImageMock}
          >
            {uploadedImage ? (
              <>
                <img src={uploadedImage} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 mb-2">
                    <CheckIcon className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-slate-900 bg-white/80 px-3 py-1 rounded-md backdrop-blur-sm">Imagen subida con éxito</span>
                  <span className="text-xs text-slate-600 mt-1">Clic para cambiar (Mock)</span>
                </div>
              </>
            ) : (
              <>
                <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
                <span className="font-semibold text-slate-700">Arrastrá una imagen o hacé clic</span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP (Max. 5MB)</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button 
          type="button" 
          variant="outline" 
          className="h-12 px-6 rounded-xl text-slate-600 border-slate-200"
          onClick={() => router.back()}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creando Desarrollo...
            </>
          ) : (
            "Crear Desarrollo"
          )}
        </Button>
      </div>
    </form>
  );
}

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
