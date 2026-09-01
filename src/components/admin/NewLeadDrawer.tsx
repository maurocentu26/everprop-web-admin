"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Building2,
  Car,
  Check,
  Home,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Store,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import {
  inferLeadInterestCategory,
  leads as sampleLeads,
  projects as sampleProjects,
  properties as sampleProperties,
  type Lead,
  type LeadInterestCategory,
  type Project,
  type Property,
} from "@/data/admin-sample";
import { MOCK_USERS } from "@/data/auth-sample";
import { appendLeadToStorage, loadProjectList, loadPropertyList } from "@/lib/admin-storage";
import { useAuth } from "@/lib/auth-context";
import { deferEffectUpdate } from "@/lib/deferred-effect";
import { createLeadInterest, isProjectUnit } from "@/lib/lead-interests";
import { cn } from "@/lib/utils";

export type AssetCategory = LeadInterestCategory;

interface AssetCategoryOption {
  id: AssetCategory;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
}

const CATEGORIES: AssetCategoryOption[] = [
  {
    id: "loteo",
    title: "Loteos",
    subtitle: "Lotes en barrios privados y desarrollos",
    icon: MapPin,
    color: "text-emerald-300 border-emerald-700 bg-emerald-950/60",
  },
  {
    id: "local",
    title: "Locales",
    subtitle: "Locales comerciales y espacios gastronómicos",
    icon: Store,
    color: "text-indigo-300 border-indigo-700 bg-indigo-950/60",
  },
  {
    id: "cochera",
    title: "Cocheras",
    subtitle: "Espacios de estacionamiento por piso o número",
    icon: Car,
    color: "text-blue-300 border-blue-700 bg-blue-950/60",
  },
  {
    id: "tradicional",
    title: "Inmobiliaria tradicional",
    subtitle: "Casas, departamentos, reventa y alquileres",
    icon: Home,
    color: "text-amber-300 border-amber-700 bg-amber-950/60",
  },
];

const ORIGINS = ["Web", "WhatsApp", "Portal", "Referido", "Instagram"];

const leadSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(60, "El nombre no puede superar 60 caracteres."),
  origin: z.string().min(1, "Seleccioná un origen."),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Ingresá un email válido."),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\+?[0-9\s().-]{7,20}$/.test(value), "Ingresá un teléfono válido."),
  stage: z.enum(["new", "contacted", "visiting", "negotiation", "closing"]),
  notes: z.string().trim().max(250, "Las notas no pueden superar 250 caracteres.").optional().or(z.literal("")),
  agentId: z.string().optional(),
});

type FormValues = z.infer<typeof leadSchema>;

interface NewLeadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  onSuccess?: () => void;
}

export function NewLeadDrawer({ open, onOpenChange, companyId = "c1", onSuccess }: NewLeadDrawerProps) {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Property | null>(null);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  useEffect(() => {
    return deferEffectUpdate(() => {
      if (!open) return;
      setAllProperties(loadPropertyList(sampleProperties, companyId));
      setAllProjects(loadProjectList(sampleProjects, companyId));
    });
  }, [open, companyId]);

  const form = useForm<FormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      origin: "WhatsApp",
      email: "",
      phone: "",
      stage: "new",
      notes: "",
      agentId: currentUser?.role === "ADVISOR" ? currentUser.id : "",
    },
  });

  const availableAssets = useMemo(() => {
    const query = assetSearchQuery.toLowerCase().trim();

    return allProperties
      .filter((property) => !selectedCategory || inferLeadInterestCategory(property) === selectedCategory)
      .filter((property) => !selectedProjectId || property.projectId === selectedProjectId)
      .filter((property) => {
        if (!query) return true;
        const project = property.projectId ? allProjects.find((candidate) => candidate.id === property.projectId) : null;
        return [property.title, property.unitNumber, property.sectorName, property.neighborhood, project?.name]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(query));
      });
  }, [allProjects, allProperties, assetSearchQuery, selectedCategory, selectedProjectId]);

  const selectedProject = allProjects.find((project) => project.id === selectedProjectId);

  const handleCategorySelect = (category: AssetCategory) => {
    const nextCategory = selectedCategory === category ? null : category;
    setSelectedCategory(nextCategory);

    if (selectedAsset && nextCategory && inferLeadInterestCategory(selectedAsset) !== nextCategory) {
      setSelectedAsset(null);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    if (selectedAsset && selectedAsset.projectId !== projectId) setSelectedAsset(null);
  };

  const handleAssetSelect = (asset: Property) => {
    setSelectedAsset(asset);
    setSelectedCategory(inferLeadInterestCategory(asset));
    setSelectedProjectId(asset.projectId ?? "");
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedProjectId("");
    setSelectedAsset(null);
    setAssetSearchQuery("");
    form.reset({
      name: "",
      origin: "WhatsApp",
      email: "",
      phone: "",
      stage: "new",
      notes: "",
      agentId: currentUser?.role === "ADVISOR" ? currentUser.id : "",
    });
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues) => {
    const trimmedName = data.name.trim();
    const projectId = selectedAsset?.projectId ?? (selectedProjectId || undefined);
    const selectedAssetIsUnit = isProjectUnit(selectedAsset ?? undefined);
    const firstInterest = selectedCategory || projectId || selectedAsset
      ? createLeadInterest(companyId, {
          category: selectedCategory ?? undefined,
          projectId,
          propertyId: selectedAsset && !selectedAssetIsUnit ? selectedAsset.id : undefined,
          unitId: selectedAsset && selectedAssetIsUnit ? selectedAsset.id : undefined,
        })
      : undefined;

    const nextLead: Lead = {
      id: crypto.randomUUID(),
      companyId,
      name: trimmedName,
      origin: data.origin,
      propertyIds: selectedAsset ? [selectedAsset.id] : [],
      unitIds: selectedAsset && selectedAssetIsUnit ? [selectedAsset.id] : undefined,
      projectId,
      interestCategory: selectedCategory ?? undefined,
      stage: data.stage,
      lastActivity: new Date().toISOString(),
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      interests: firstInterest ? [firstInterest] : [],
      agentId: currentUser?.role === "ADVISOR" ? currentUser.id : data.agentId,
    };

    try {
      appendLeadToStorage(nextLead, sampleLeads, companyId);

      toast.success("Lead registrado con éxito", {
        description: selectedAsset
          ? `${trimmedName} fue asociado a ${selectedAsset.title}.`
          : `${trimmedName} se registró sin una propiedad asociada. Podés completar el interés después.`,
      });

      handleReset();
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("No pudimos guardar el lead", {
        description: "Revisá el almacenamiento del navegador e intentá nuevamente.",
      });
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) handleReset();
      }}
    >
      <SheetContent
        side="right"
        data-theme-panel="lead"
        showCloseButton={false}
        className="inset-0 h-dvh !w-screen !max-w-none gap-0 border-0 bg-slate-950 p-0 text-white shadow-none data-[side=right]:!left-0 data-[side=right]:!right-0 data-[side=right]:!w-screen data-[side=right]:sm:!max-w-none motion-reduce:transition-none"
      >
        <SheetHeader className="shrink-0 border-b border-slate-700 bg-slate-900 px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-[min(94vw,2800px)] items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 sm:h-14 sm:w-14">
                <Sparkles size={26} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <SheetTitle className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Alta de nuevo lead</SheetTitle>
                <SheetDescription className="mt-1 text-base leading-7 text-slate-300 sm:text-lg">
                  Registrá primero al contacto. El interés inmobiliario es opcional y puede completarse después.
                </SheetDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-12 shrink-0 border-slate-600 bg-slate-800 px-4 text-base font-semibold text-white hover:bg-slate-700 hover:text-white sm:px-5"
            >
              <X size={22} aria-hidden="true" />
              <span className="hidden sm:inline">Cerrar</span>
            </Button>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-950">
          <form id="drawer-lead-form" onSubmit={form.handleSubmit(onSubmit)} className="mx-auto w-full max-w-[min(94vw,2800px)] p-5 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] xl:gap-8">
              <section className="space-y-6 rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-xl sm:p-7 lg:p-8" aria-labelledby="lead-basic-data">
                <div className="flex items-start gap-4 border-b border-slate-700 pb-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-blue-300">
                    <User size={25} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="lead-basic-data" className="text-2xl font-bold text-white">Datos básicos del lead</h2>
                    <p className="mt-2 text-base leading-7 text-slate-300">
                      Completá la información que ya conocés. Estos datos aparecen primero para registrar el contacto rápidamente.
                    </p>
                  </div>
                </div>

                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="lead-name" className="text-base font-bold text-slate-100">
                        Nombre completo <span className="text-rose-400">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="lead-name"
                        autoComplete="name"
                        autoFocus
                        aria-invalid={fieldState.invalid}
                        placeholder="Ejemplo: Marcos Gallardo"
                        className="h-14 border-slate-600 bg-slate-950 px-4 text-lg text-white placeholder:text-slate-500 focus:border-blue-500"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-base font-medium text-rose-400" />}
                    </Field>
                  )}
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="lead-phone" className="text-base font-bold text-slate-100">WhatsApp / Teléfono</FieldLabel>
                        <div className="relative">
                          <Phone size={21} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                          <Input
                            {...field}
                            id="lead-phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            aria-invalid={fieldState.invalid}
                            placeholder="+54 9 11 1234 5678"
                            className="h-14 border-slate-600 bg-slate-950 pl-12 pr-4 text-lg text-white placeholder:text-slate-500 focus:border-blue-500"
                          />
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-base font-medium text-rose-400" />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="lead-email" className="text-base font-bold text-slate-100">Email</FieldLabel>
                        <div className="relative">
                          <Mail size={21} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                          <Input
                            {...field}
                            id="lead-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            aria-invalid={fieldState.invalid}
                            placeholder="lead@ejemplo.com"
                            className="h-14 border-slate-600 bg-slate-950 pl-12 pr-4 text-lg text-white placeholder:text-slate-500 focus:border-blue-500"
                          />
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-base font-medium text-rose-400" />}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Controller
                    name="origin"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="lead-origin" className="text-base font-bold text-slate-100">Origen del contacto</FieldLabel>
                        <select
                          {...field}
                          id="lead-origin"
                          aria-invalid={fieldState.invalid}
                          className="h-14 w-full rounded-lg border border-slate-600 bg-slate-950 px-4 text-lg text-white outline-none focus:border-blue-500"
                        >
                          {ORIGINS.map((origin) => <option key={origin} value={origin}>{origin}</option>)}
                        </select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-base font-medium text-rose-400" />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="stage"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="lead-stage" className="text-base font-bold text-slate-100">Estado inicial</FieldLabel>
                        <select
                          {...field}
                          id="lead-stage"
                          className="h-14 w-full rounded-lg border border-slate-600 bg-slate-950 px-4 text-lg text-white outline-none focus:border-blue-500"
                        >
                          <option value="new">Nuevo</option>
                          <option value="contacted">Contactado</option>
                          <option value="visiting">Visitando</option>
                          <option value="negotiation">Negociación</option>
                          <option value="closing">Cierre</option>
                        </select>
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name="notes"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="lead-notes" className="text-base font-bold text-slate-100">Notas / Preferencias</FieldLabel>
                      <Textarea
                        {...field}
                        id="lead-notes"
                        rows={4}
                        aria-invalid={fieldState.invalid}
                        placeholder="Comentarios adicionales del interesado..."
                        className="min-h-32 border-slate-600 bg-slate-950 px-4 py-3 text-lg leading-7 text-white placeholder:text-slate-500 focus:border-blue-500"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-base font-medium text-rose-400" />}
                    </Field>
                  )}
                />

                {currentUser?.role === "ADMIN" && (
                  <Controller
                    name="agentId"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor="lead-agent" className="text-base font-bold text-slate-100">Asesor comercial asignado</FieldLabel>
                        <select
                          {...field}
                          id="lead-agent"
                          className="h-14 w-full rounded-lg border border-slate-600 bg-slate-950 px-4 text-lg text-white outline-none focus:border-blue-500"
                        >
                          <option value="">Sin asignar (Global)</option>
                          {MOCK_USERS.filter((user) => user.role === "ADVISOR").map((user) => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>
                      </Field>
                    )}
                  />
                )}

                <div className="rounded-2xl border border-blue-700 bg-blue-950/60 p-5 text-base leading-7 text-blue-100">
                  Podés guardar el lead aunque todavía no conozcas su categoría, proyecto o propiedad de interés.
                </div>
              </section>

              <section className="space-y-6 rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-xl sm:p-7 lg:p-8" aria-labelledby="lead-interest-data">
                <div className="flex items-start gap-4 border-b border-slate-700 pb-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-950 text-violet-300">
                    <Building2 size={25} aria-hidden="true" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 id="lead-interest-data" className="text-2xl font-bold text-white">Interés inmobiliario</h2>
                      <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-base font-semibold text-slate-200">Opcional</span>
                    </div>
                    <p className="mt-2 text-base leading-7 text-slate-300">
                      Si todavía no conocés estos datos, dejalos vacíos y completalos más adelante.
                    </p>
                  </div>
                </div>

                <Field>
                  <FieldLabel className="text-lg font-bold text-slate-100">Categoría</FieldLabel>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      const isSelected = selectedCategory === category.id;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleCategorySelect(category.id)}
                          className={cn(
                            "flex min-h-28 items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
                            isSelected ? "border-blue-400 bg-blue-950/70 ring-2 ring-blue-500/30" : "border-slate-600 bg-slate-950 hover:border-slate-400",
                          )}
                        >
                          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border", category.color)}>
                            <Icon size={23} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-lg font-bold leading-6 text-white">{category.title}</span>
                            <span className="mt-1 block text-base leading-6 text-slate-300">{category.subtitle}</span>
                          </span>
                          {isSelected && <Check size={22} className="shrink-0 text-blue-300" aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                  <FieldDescription className="text-base leading-7 text-slate-400">Volvé a tocar una categoría para quitarla.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="lead-project" className="text-lg font-bold text-slate-100">Proyecto</FieldLabel>
                  <select
                    id="lead-project"
                    value={selectedProjectId}
                    onChange={(event) => handleProjectSelect(event.target.value)}
                    className="h-14 w-full rounded-lg border border-slate-600 bg-slate-950 px-4 text-lg text-white outline-none focus:border-blue-500"
                  >
                    <option value="">Sin proyecto identificado</option>
                    {allProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                  </select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="lead-property-search" className="text-lg font-bold text-slate-100">Propiedad</FieldLabel>

                  {selectedAsset && (
                    <div className="mb-3 flex items-center gap-4 rounded-2xl border border-blue-500 bg-blue-950/60 p-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-blue-200">
                        <Building2 size={23} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-bold text-white">{selectedAsset.title}</p>
                        <p className="mt-1 text-base leading-6 text-slate-300">
                          {selectedProject?.name ?? `${selectedAsset.neighborhood}, ${selectedAsset.city}`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedAsset(null)}
                        className="h-12 w-12 shrink-0 text-slate-200 hover:bg-slate-800 hover:text-white"
                        aria-label="Quitar propiedad seleccionada"
                      >
                        <X size={23} aria-hidden="true" />
                      </Button>
                    </div>
                  )}

                  <div className="relative">
                    <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <Input
                      id="lead-property-search"
                      value={assetSearchQuery}
                      onChange={(event) => setAssetSearchQuery(event.target.value)}
                      placeholder="Buscar propiedad, unidad, barrio o proyecto"
                      className="h-14 border-slate-600 bg-slate-950 pl-12 pr-4 text-lg text-white placeholder:text-slate-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-2">
                    {availableAssets.length > 0 ? (
                      availableAssets.slice(0, 8).map((asset) => {
                        const project = asset.projectId ? allProjects.find((candidate) => candidate.id === asset.projectId) : null;
                        const isSelected = selectedAsset?.id === asset.id;
                        return (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => handleAssetSelect(asset)}
                            className={cn(
                              "flex min-h-20 w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
                              isSelected ? "border-blue-400 bg-blue-950/70" : "border-slate-600 bg-slate-950 hover:border-slate-400",
                            )}
                          >
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-base font-bold text-blue-300">
                              {asset.unitNumber || asset.title.slice(0, 3)}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-lg font-bold leading-6 text-white">{asset.title}</span>
                              <span className="mt-1 block text-base leading-6 text-slate-300">
                                {project?.name ? `${project.name} · ` : ""}{asset.neighborhood}
                              </span>
                            </span>
                            {isSelected && <Check size={22} className="shrink-0 text-blue-300" aria-hidden="true" />}
                          </button>
                        );
                      })
                    ) : (
                      <p className="rounded-2xl border border-dashed border-slate-600 p-7 text-center text-base leading-7 text-slate-300">
                        No se encontraron propiedades con esos filtros.
                      </p>
                    )}
                  </div>
                  <FieldDescription className="text-base leading-7 text-slate-400">No es necesario elegir una propiedad para guardar el lead.</FieldDescription>
                </Field>
              </section>
            </div>
          </form>
        </div>

        <SheetFooter className="shrink-0 border-t border-slate-700 bg-slate-900 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-[min(94vw,2800px)] flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="h-14 w-full border-slate-600 bg-slate-800 px-6 text-lg font-semibold text-white hover:bg-slate-700 hover:text-white sm:w-auto"
            >
              Limpiar formulario
            </Button>

            <Button
              type="submit"
              form="drawer-lead-form"
              className="h-14 w-full bg-blue-600 px-9 text-lg font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 sm:min-w-56 sm:w-auto"
            >
              Guardar lead
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
