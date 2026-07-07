"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { leads as sampleLeads, properties as sampleProperties, type Lead } from "@/data/admin-sample";
import { loadLeadList, loadPropertyList, saveLeadList } from "@/lib/admin-storage";
import { SuccessModal } from "./SuccessModal";

type Props = {
  companyId?: string;
};

const ORIGINS = ["Web", "WhatsApp", "Portal", "Referido", "Instagram"];
const STAGES: Lead["stage"][] = ["new", "contacted", "visiting", "negotiation", "closing"];

export default function NewLeadForm({ companyId = "c1" }: Props) {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter();
  const [propertyOptions, setPropertyOptions] = useState(sampleProperties.filter((property) => property.companyId === companyId));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    origin: "Web",
    propertyId: sampleProperties[0]?.id ?? "",
    stage: "new" as Lead["stage"],
    notes: "",
  });

  useEffect(() => {
    const nextProperties = loadPropertyList(sampleProperties, companyId);
    setPropertyOptions(nextProperties);
    setForm((current) => ({
      ...current,
      propertyId: current.propertyId || nextProperties[0]?.id || "",
    }));
  }, [companyId]);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    setIsSubmitting(true);

    try {
      const trimmedName = form.name.trim();
      if (!trimmedName) {
        setError("El nombre del lead es obligatorio.");
        setIsSaving(false);
        return;
      }

      const nextLead: Lead = {
        id: crypto.randomUUID(),
        companyId,
        name: trimmedName,
        origin: form.origin,
        propertyId: form.propertyId || undefined,
        stage: form.stage,
        lastActivity: new Date().toISOString(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
      };

      if (propertyOptions.length === 0) {
        setError("No hay propiedades disponibles para asociar.");
        setIsSaving(false);
        return;
      }

      const existingLeads = loadLeadList(sampleLeads, companyId);
      saveLeadList([...existingLeads, nextLead]);
      router.push("/admin#leads");
      setIsSuccessOpen(true)
    } catch {
      setError("No se pudo guardar el lead.");
      setIsSaving(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Nuevo lead</CardTitle>
        <p className="mt-1 text-sm text-slate-500">
          Cargá un nuevo contacto y se guardará en localStorage para el MVP.
        </p>
      </CardHeader>
      <CardContent>
        <Form onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Carla Méndez"
                  required
                />
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Origen</FormLabel>
              <FormControl>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={form.origin}
                  onChange={(event) => setForm((current) => ({ ...current, origin: event.target.value }))}
                >
                  {ORIGINS.map((origin) => (
                    <option key={origin} value={origin}>
                      {origin}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="carla@example.com"
                />
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="+54 9 11 ..."
                />
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Propiedad de interés</FormLabel>
              <FormControl>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={form.propertyId}
                  onChange={(event) => setForm((current) => ({ ...current, propertyId: event.target.value }))}
                >
                  {propertyOptions.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormField>

            <FormField>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={form.stage}
                  onChange={(event) => setForm((current) => ({ ...current, stage: event.target.value as Lead["stage"] }))}
                >
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormField>
          </div>

          <FormField>
            <FormLabel>Notas</FormLabel>
            <FormControl>
              <Textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Contexto del contacto, pedidos, próximos pasos..."
              />
            </FormControl>
          </FormField>

          {error && <FormMessage>{error}</FormMessage>}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar lead"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin#leads") }>
              Volver al pipeline
            </Button>
          </div>
        </Form>
        <SuccessModal 
          isOpen={isSuccessOpen} 
          onOpenChange={setIsSuccessOpen}
        />
      </CardContent>
    </Card>
  );
}
