"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { properties as sampleProperties, type Property } from "@/data/admin-sample";
import { loadPropertyList, savePropertyList } from "@/lib/admin-storage";
import { Car, Store, Map, Building2, Home, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import CategorySelector from "./property-form/CategorySelector";
import TraditionalFields from "./property-form/TraditionalFields";
import LoteFields from "./property-form/LoteFields";
import CommercialFields from "./property-form/CommercialFields";
import { formSchema, type FormData, type Category } from "./property-form/types";

type Props = {
  companyId?: string;
};

export default function NewPropertyForm({ companyId = "c1" }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Stepper State
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState<Category>(null);
  
  // Active Tab within category
  const [activeTab, setActiveTab] = useState<"Casa" | "Departamento" | "Lote" | "Cochera" | "Local">("Casa");

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyType: "Casa",
      spaceType: "Abierto",
      operation: "sale",
    },
  });

  // When category changes, update the default active tab
  useEffect(() => {
    if (category === "tradicional") setActiveTab("Casa");
    if (category === "loteo") setActiveTab("Lote");
    if (category === "comercial") setActiveTab("Local");
  }, [category]);

  // Sync activeTab to form
  useEffect(() => {
    setValue("propertyType", activeTab);
  }, [activeTab, setValue]);

  const onSubmit = (data: FormData) => {
    setError("");
    setIsSaving(true);

    try {
      if (data.propertyType === "Lote" && (!data.area_m2 || !data.sectorName || !data.unitNumber)) {
        throw new Error("Completá Superficie, Manzana y Nro de Lote.");
      }
      if (["Cochera", "Local"].includes(data.propertyType) && !data.unitNumber) {
        throw new Error("Completá el número de la unidad.");
      }

      const nextProperty: Property = {
        id: crypto.randomUUID(),
        companyId,
        title: data.title.trim(),
        operation: data.operation || "sale",
        propertyType: data.propertyType,
        price: Number(data.price),
        currency: "USD",
        city: data.city.trim(),
        neighborhood: data.neighborhood.trim(),
        bedrooms: data.bedrooms ? Number(data.bedrooms) : 0,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : 0,
        area_m2: data.area_m2 ? Number(data.area_m2) : undefined,
        description: data.description,
        sectorName: data.propertyType === "Lote" ? data.sectorName : undefined,
        unitNumber: data.floor ? `${data.floor}-${data.unitNumber}` : data.unitNumber,
        status: "available",
        landFeatures: data.propertyType === "Lote" ? {
          water: !!data.water,
          electricity: !!data.electricity,
          curb: !!data.curb,
          gravel: !!data.gravel,
          sewage: !!data.sewage,
          spaceType: data.spaceType,
        } : undefined,
      };

      const existingProperties = loadPropertyList(sampleProperties, companyId);
      savePropertyList([nextProperty, ...existingProperties]);
      router.push("/admin/properties");
    } catch (e: any) {
      setError(e.message || "Error al guardar el activo.");
      setIsSaving(false);
    }
  };

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setStep(2);
  };

  if (step === 1) {
    return <CategorySelector onSelect={handleCategorySelect} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver a categorías
      </button>

      <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-xl rounded-3xl p-0">
        <div className="bg-slate-950 px-6 py-8 text-white flex flex-col items-center">
          <CardTitle className="text-2xl font-bold mb-2">
            {category === "tradicional" && "Añadir Propiedad Tradicional"}
            {category === "loteo" && "Añadir Lote o Terreno"}
            {category === "comercial" && "Añadir Activo Comercial"}
          </CardTitle>
          <CardDescription className="text-slate-400">
            Completá los datos requeridos para ingresar la unidad al inventario.
          </CardDescription>

          {/* Sub-Tabs based on category */}
          <div className="flex gap-2 mt-6 p-1 bg-slate-900 rounded-xl overflow-x-auto w-full sm:w-auto">
            {category === "tradicional" && (
              <>
                <button type="button" onClick={() => setActiveTab("Casa")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap", activeTab === "Casa" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800")}>
                  <Home className="w-4 h-4" /> Casa
                </button>
                <button type="button" onClick={() => setActiveTab("Departamento")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap", activeTab === "Departamento" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800")}>
                  <Building2 className="w-4 h-4" /> Departamento
                </button>
              </>
            )}

            {category === "loteo" && (
              <button type="button" onClick={() => setActiveTab("Lote")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap", activeTab === "Lote" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800")}>
                <Map className="w-4 h-4" /> Lote
              </button>
            )}

            {category === "comercial" && (
              <>
                <button type="button" onClick={() => setActiveTab("Local")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap", activeTab === "Local" ? "bg-amber-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800")}>
                  <Store className="w-4 h-4" /> Local Comercial
                </button>
                <button type="button" onClick={() => setActiveTab("Cochera")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap", activeTab === "Cochera" ? "bg-amber-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800")}>
                  <Car className="w-4 h-4" /> Cochera
                </button>
              </>
            )}
          </div>
        </div>

        <CardContent className="px-6 py-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup className="grid gap-6 md:grid-cols-2">
              
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="title" className="text-sm font-bold text-slate-800">
                  Título Público <span className="text-rose-500">*</span>
                </FieldLabel>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder={
                    category === 'tradicional' ? "Casa minimalista de 3 dormitorios" :
                    category === 'loteo' ? "Lote Central en Manzana A" : "Unidad Comercial 12A"
                  }
                  className={cn("h-11 rounded-xl bg-slate-50", errors.title && "border-rose-500")}
                />
                {errors.title && <FieldError>{errors.title.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="city" className="text-sm font-bold text-slate-800">Ciudad</FieldLabel>
                <Input id="city" {...register("city")} placeholder="San Salvador de Jujuy" className="h-11 rounded-xl bg-slate-50" />
                {errors.city && <FieldError>{errors.city.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="neighborhood" className="text-sm font-bold text-slate-800">Ubicación / Zona</FieldLabel>
                <Input id="neighborhood" {...register("neighborhood")} placeholder="Alto Comedero" className="h-11 rounded-xl bg-slate-50" />
                {errors.neighborhood && <FieldError>{errors.neighborhood.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="price" className="text-sm font-bold text-slate-800">Precio (USD) <span className="text-rose-500">*</span></FieldLabel>
                <Input id="price" type="number" step="0.01" {...register("price")} placeholder="15000" className="h-11 rounded-xl bg-slate-50" />
                {errors.price && <FieldError>{errors.price.message}</FieldError>}
              </Field>

              {category === "tradicional" && <TraditionalFields register={register} />}
              {category === "loteo" && <LoteFields register={register} />}
              {category === "comercial" && <CommercialFields register={register} activeTab={activeTab} />}

              <Field className="md:col-span-2 border-t border-slate-100 pt-4">
                <FieldLabel htmlFor="description" className="text-sm font-bold text-slate-800">Descripción / Referencia</FieldLabel>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Añade detalles adicionales..."
                  rows={3}
                  className="rounded-xl bg-slate-50 border-slate-200"
                />
              </Field>

            </FieldGroup>

            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold">{error}</div>}

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Button type="button" variant="outline" className="rounded-xl px-6" onClick={() => setStep(1)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-md">
                {isSaving ? "Guardando..." : `Guardar ${activeTab}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
