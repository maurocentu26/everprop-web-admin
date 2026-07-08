"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { properties as sampleProperties, type Property } from "@/data/admin-sample";
import { loadPropertyList, savePropertyList } from "@/lib/admin-storage";

type Props = {
  companyId?: string;
};

const OPERATIONS: Property["operation"][] = ["sale", "rent", "temporal"];
const OPERATION_LABELS: Record<Property["operation"], string> = {
  sale: "Venta",
  rent: "Alquiler",
  temporal: "Temporal",
};
const PROPERTY_TYPES = ["Departamento", "Casa", "PH", "Local", "Terreno", "Oficina"];
const CURRENCIES: Property["currency"][] = ["USD", "ARS"];

export default function NewPropertyForm({ companyId = "c1" }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    operation: "sale" as Property["operation"],
    propertyType: "Departamento",
    price: "",
    currency: "USD" as Property["currency"],
    city: "",
    neighborhood: "",
    bedrooms: "",
    bathrooms: "",
    area_m2: "",
    description: "",
  });

  useEffect(() => {
    // No-op: el formulario solo necesita montar en cliente para usar localStorage al guardar.
  }, []);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const title = form.title.trim();
      const city = form.city.trim();
      const neighborhood = form.neighborhood.trim();
      const price = Number(form.price);
      const bedrooms = Number(form.bedrooms);
      const bathrooms = Number(form.bathrooms);
      const area_m2 = form.area_m2 ? Number(form.area_m2) : undefined;

      if (!title || !city || !neighborhood || !Number.isFinite(price)) {
        setError("Completá título, ubicación y precio.");
        setIsSaving(false);
        return;
      }

      const nextProperty: Property = {
        id: crypto.randomUUID(),
        companyId,
        title,
        operation: form.operation,
        propertyType: form.propertyType,
        price,
        currency: form.currency,
        city,
        neighborhood,
        bedrooms: Number.isFinite(bedrooms) ? bedrooms : 0,
        bathrooms: Number.isFinite(bathrooms) ? bathrooms : 0,
        area_m2: Number.isFinite(area_m2 ?? NaN) ? area_m2 : undefined,
        mainImage: "",
      };

      const existingProperties = loadPropertyList(sampleProperties, companyId);
      savePropertyList([...existingProperties, nextProperty]);
      router.push("/admin#properties");
    } catch {
      setError("No se pudo guardar la propiedad.");
      setIsSaving(false);
    }
  }

  return (
    <Card className="w-full overflow-hidden border border-slate-200 bg-white shadow-[0_16px_50px_-24px_rgba(15,23,42,0.35)] max-w-4xl ml-auto mr-auto py-0">
      <div className="bg-slate-950/95 px-6 py-5 text-white">
        <CardHeader className="p-0">
          <CardTitle className="text-xl font-semibold text-white">Nueva propiedad</CardTitle>
          <CardDescription className="mt-2 text-sm text-slate-300">
            Cargá un nuevo inmueble y se guardará en localStorage para el MVP.
          </CardDescription>
        </CardHeader>
      </div>

      <CardContent className="px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="property-title" className="text-sm font-medium text-slate-800">
                Título <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                id="property-title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Departamento 3 Ambientes con Cochera"
                className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="property-operation" className="text-sm font-medium text-slate-800">
                Operación
              </FieldLabel>
              <select
                id="property-operation"
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={form.operation}
                onChange={(event) => setForm((current) => ({ ...current, operation: event.target.value as Property["operation"] }))}
              >
                {OPERATIONS.map((operation) => (
                  <option key={operation} value={operation}>
                    {OPERATION_LABELS[operation]}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor="property-type" className="text-sm font-medium text-slate-800">
                Tipo de propiedad
              </FieldLabel>
              <select
                id="property-type"
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={form.propertyType}
                onChange={(event) => setForm((current) => ({ ...current, propertyType: event.target.value }))}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor="property-price" className="text-sm font-medium text-slate-800">
                Precio <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                id="property-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                placeholder="245000"
                className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="property-currency" className="text-sm font-medium text-slate-800">
                Moneda
              </FieldLabel>
              <select
                id="property-currency"
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={form.currency}
                onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value as Property["currency"] }))}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor="property-city" className="text-sm font-medium text-slate-800">
                Ciudad <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                id="property-city"
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                placeholder="Buenos Aires"
                className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="property-neighborhood" className="text-sm font-medium text-slate-800">
                Barrio / Zona <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                id="property-neighborhood"
                value={form.neighborhood}
                onChange={(event) => setForm((current) => ({ ...current, neighborhood: event.target.value }))}
                placeholder="Palermo"
                className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="property-bedrooms" className="text-sm font-medium text-slate-800">
                Dormitorios
              </FieldLabel>
              <Input
                id="property-bedrooms"
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={(event) => setForm((current) => ({ ...current, bedrooms: event.target.value }))}
                placeholder="2"
                className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="property-bathrooms" className="text-sm font-medium text-slate-800">
                Baños
              </FieldLabel>
              <Input
                id="property-bathrooms"
                type="number"
                min="0"
                value={form.bathrooms}
                onChange={(event) => setForm((current) => ({ ...current, bathrooms: event.target.value }))}
                placeholder="2"
                className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="property-area" className="text-sm font-medium text-slate-800">
                Superficie total m²
              </FieldLabel>
              <Input
                id="property-area"
                type="number"
                min="0"
                value={form.area_m2}
                onChange={(event) => setForm((current) => ({ ...current, area_m2: event.target.value }))}
                placeholder="85"
                className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200"
              />
            </Field>
          </FieldGroup>

          <Field className="mt-2">
            <FieldLabel htmlFor="property-description" className="text-sm font-medium text-slate-800">
              Descripción
            </FieldLabel>
            <Textarea
              id="property-description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Detalle del inmueble, amenities, entorno..."
              rows={5}
              className="min-h-24 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200"
            />
            <FieldDescription className="text-slate-500">
              Agregá datos útiles para identificar rápido el inmueble.
            </FieldDescription>
          </Field>

          {error && <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <CardFooter className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-0 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={() => {
                setForm({
                  title: "",
                  operation: "sale" as Property["operation"],
                  propertyType: "Departamento",
                  price: "",
                  currency: "USD" as Property["currency"],
                  city: "",
                  neighborhood: "",
                  bedrooms: "",
                  bathrooms: "",
                  area_m2: "",
                  description: "",
                });
                setError("");
              }}
            >
              Limpiar
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-slate-950 text-white shadow-sm transition hover:bg-slate-800">
              {isSaving ? "Guardando..." : "Guardar propiedad"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
