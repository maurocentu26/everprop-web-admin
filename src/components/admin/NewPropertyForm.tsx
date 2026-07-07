"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { properties as sampleProperties, type Property } from "@/data/admin-sample";
import { loadPropertyList, savePropertyList } from "@/lib/admin-storage";

type Props = {
  companyId?: string;
};

const OPERATIONS: Property["operation"][] = ["sale", "rent", "temporal"];
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Nueva propiedad</CardTitle>
        <p className="mt-1 text-sm text-slate-500">
          Cargá un nuevo inmueble y se guardará en localStorage para el MVP.
        </p>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField className="md:col-span-2">
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Departamento 3 Ambientes con Cochera"
                  required
                />
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Operación</FormLabel>
              <FormControl>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={form.operation}
                  onChange={(event) => setForm((current) => ({ ...current, operation: event.target.value as Property["operation"] }))}
                >
                  {OPERATIONS.map((operation) => (
                    <option key={operation} value={operation}>
                      {operation}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Tipo de propiedad</FormLabel>
              <FormControl>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={form.propertyType}
                  onChange={(event) => setForm((current) => ({ ...current, propertyType: event.target.value }))}
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Precio *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  placeholder="245000"
                  required
                />
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Moneda</FormLabel>
              <FormControl>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={form.currency}
                  onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value as Property["currency"] }))}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Ciudad *</FormLabel>
              <FormControl>
                <Input
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  placeholder="Buenos Aires"
                  required
                />
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Barrio / Zona *</FormLabel>
              <FormControl>
                <Input
                  value={form.neighborhood}
                  onChange={(event) => setForm((current) => ({ ...current, neighborhood: event.target.value }))}
                  placeholder="Palermo"
                  required
                />
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Dormitorios</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={(event) => setForm((current) => ({ ...current, bedrooms: event.target.value }))}
                  placeholder="2"
                />
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Baños</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={(event) => setForm((current) => ({ ...current, bathrooms: event.target.value }))}
                  placeholder="2"
                />
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Superficie total m²</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  value={form.area_m2}
                  onChange={(event) => setForm((current) => ({ ...current, area_m2: event.target.value }))}
                  placeholder="85"
                />
              </FormControl>
            </FormField>
          </div>

          <FormField>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Detalle del inmueble, amenities, entorno..."
              />
            </FormControl>
          </FormField>

          {error && <FormMessage>{error}</FormMessage>}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar propiedad"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin#properties") }>
              Volver al inventario
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
