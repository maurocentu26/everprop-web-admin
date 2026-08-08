"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  MapPin,
  Building2,
  Store,
  Car,
  Home,
  Search,
  Check,
  ChevronRight,
  User,
  Phone,
  Mail,
  Sparkles,
  ArrowLeft,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { leads as sampleLeads, properties as sampleProperties, projects as sampleProjects, type Lead, type Property } from "@/data/admin-sample";
import { loadLeadList, loadPropertyList, loadProjectList, saveLeadList } from "@/lib/admin-storage";
import { useAuth } from "@/lib/auth-context";
import { MOCK_USERS } from "@/data/auth-sample";
import { cn } from "@/lib/utils";

export type AssetCategory = "loteo" | "local" | "cochera" | "tradicional";

interface AssetCategoryOption {
  id: AssetCategory;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  badgeBg: string;
}

const CATEGORIES: AssetCategoryOption[] = [
  {
    id: "loteo",
    title: "Loteos",
    subtitle: "Lotes en barrios privados y desarrollos",
    icon: MapPin,
    color: "text-emerald-600 border-emerald-200 bg-emerald-50",
    badgeBg: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "local",
    title: "Locales",
    subtitle: "Locales comerciales y espacios gastronómicos",
    icon: Store,
    color: "text-indigo-600 border-indigo-200 bg-indigo-50",
    badgeBg: "bg-indigo-100 text-indigo-700",
  },
  {
    id: "cochera",
    title: "Cocheras",
    subtitle: "Espacios de estacionamiento por piso/número",
    icon: Car,
    color: "text-blue-600 border-blue-200 bg-blue-50",
    badgeBg: "bg-blue-100 text-blue-700",
  },
  {
    id: "tradicional",
    title: "Inmobiliaria Tradicional",
    subtitle: "Casas, departamentos reventa y alquileres",
    icon: Home,
    color: "text-amber-600 border-amber-200 bg-amber-50",
    badgeBg: "bg-amber-100 text-amber-700",
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
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Ingresá un email válido."),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\+?[0-9\s().-]{7,20}$/.test(val), "Ingresá un teléfono válido."),
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
  const router = useRouter();
  const { currentUser } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Property | null>(null);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      setAllProperties(loadPropertyList(sampleProperties, companyId));
      setAllProjects(loadProjectList(sampleProjects, companyId));
    }
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

  // Filtered Assets based on Step 1 Category selection and Step 2 Search query
  const availableAssets = useMemo(() => {
    if (!selectedCategory) return [];

    let filtered = allProperties.filter((p) => {
      if (selectedCategory === "loteo") {
        return (
          p.propertyType === "Lote" ||
          p.sectorName?.toLowerCase().includes("manzana") ||
          p.title.toLowerCase().includes("lote")
        );
      }
      if (selectedCategory === "local") {
        return p.propertyType === "Local" || p.commercialFeatures !== undefined;
      }
      if (selectedCategory === "cochera") {
        return p.propertyType === "Cochera" || p.isCovered !== undefined;
      }
      if (selectedCategory === "tradicional") {
        return p.propertyType === "Casa" || (p.propertyType === "Departamento" && !p.projectId);
      }
      return true;
    });

    if (assetSearchQuery.trim()) {
      const q = assetSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesUnit = p.unitNumber?.toLowerCase().includes(q);
        const matchesSector = p.sectorName?.toLowerCase().includes(q);
        const matchesNeighborhood = p.neighborhood.toLowerCase().includes(q);

        const project = p.projectId ? allProjects.find((proj) => proj.id === p.projectId) : null;
        const matchesProject = project ? project.name.toLowerCase().includes(q) : false;

        return matchesTitle || matchesUnit || matchesSector || matchesNeighborhood || matchesProject;
      });
    }

    return filtered;
  }, [selectedCategory, assetSearchQuery, allProperties, allProjects]);

  const handleCategorySelect = (cat: AssetCategory) => {
    setSelectedCategory(cat);
    setSelectedAsset(null);
    setAssetSearchQuery("");
    setStep(2);
  };

  const handleAssetSelect = (asset: Property) => {
    setSelectedAsset(asset);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedCategory(null);
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

  const onSubmit = (data: FormValues) => {
    const trimmedName = data.name.trim();

    const nextLead: Lead = {
      id: crypto.randomUUID(),
      companyId,
      name: trimmedName,
      origin: data.origin,
      propertyIds: selectedAsset ? [selectedAsset.id] : [],
      projectId: selectedAsset?.projectId,
      stage: data.stage,
      lastActivity: new Date().toISOString(),
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      agentId: currentUser?.role === "ADVISOR" ? currentUser.id : data.agentId,
    };

    const existingLeads = loadLeadList(sampleLeads, companyId);
    saveLeadList([...existingLeads, nextLead]);

    toast.success("Lead registrado con éxito", {
      description: `${trimmedName} fue asociado a ${selectedAsset?.title || "inventario"}.`,
    });

    handleReset();
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  return (
    <Sheet open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) handleReset(); }}>
      <SheetContent side="right" className="sm:max-w-xl w-full p-0 flex flex-col bg-slate-950 text-white border-l border-slate-800 shadow-2xl">
        {/* Header */}
        <SheetHeader className="p-6 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-600/20">
                <Sparkles size={16} />
              </span>
              <div>
                <SheetTitle className="text-xl font-bold text-white tracking-tight">Nuevo Interesado (Lead)</SheetTitle>
                <SheetDescription className="text-xs text-slate-400">Proceso jerárquico de vinculación de activos</SheetDescription>
              </div>
            </div>
          </div>

          {/* Stepper indicator */}
          <div className="mt-6 flex items-center justify-between gap-2 px-2">
            {[
              { num: 1, label: "Categoría" },
              { num: 2, label: "Búsqueda" },
              { num: 3, label: "Datos Lead" },
            ].map((st) => (
              <div key={st.num} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-full h-1.5 rounded-full transition-all duration-300",
                    step >= st.num ? "bg-blue-500 shadow-sm shadow-blue-500/50" : "bg-slate-800"
                  )}
                />
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", step >= st.num ? "text-blue-400" : "text-slate-500")}>
                  {st.num}. {st.label}
                </span>
              </div>
            ))}
          </div>
        </SheetHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Paso 1: Seleccioná la categoría del activo</h3>
                <p className="text-xs text-slate-400 mt-1">Identificá el tipo de propiedad que busca o consultó el cliente.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={cn(
                        "flex flex-col text-left p-4 rounded-xl border transition-all group hover:scale-[1.02]",
                        "bg-slate-900 border-slate-800 hover:border-blue-500 hover:bg-slate-850"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={cn("p-2.5 rounded-lg border", cat.color)}>
                          <Icon size={20} />
                        </div>
                        <ChevronRight size={16} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <span className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{cat.title}</span>
                      <span className="text-xs text-slate-400 mt-1 leading-snug">{cat.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DYNAMIC COMMAND SEARCH */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} /> Volver a categorías
                </button>
                {selectedCategory && (
                  <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider", CATEGORIES.find(c => c.id === selectedCategory)?.badgeBg)}>
                    {CATEGORIES.find((c) => c.id === selectedCategory)?.title}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Paso 2: Buscá el activo específico</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedCategory === "loteo" && "Buscá por nombre de Proyecto, Manzana o Lote."}
                  {selectedCategory === "cochera" && "Buscá por número de Cochera o Piso."}
                  {selectedCategory === "local" && "Buscá por número de Local o Paseo Comercial."}
                  {selectedCategory === "tradicional" && "Buscá por dirección o título de propiedad."}
                </p>
              </div>

              {/* Command Input */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={assetSearchQuery}
                  onChange={(e) => setAssetSearchQuery(e.target.value)}
                  placeholder={
                    selectedCategory === "loteo" ? "Ej: Lote 14, Manzana A, Terrazas..." :
                    selectedCategory === "cochera" ? "Ej: Cochera 12, Piso 1..." :
                    selectedCategory === "local" ? "Ej: Local 3, San Martín..." : "Ej: Depto Palermo, Casa Central..."
                  }
                  className="pl-10 h-11 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
                {assetSearchQuery && (
                  <X
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    onClick={() => setAssetSearchQuery("")}
                  />
                )}
              </div>

              {/* Results list */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {availableAssets.length > 0 ? (
                  availableAssets.map((asset) => {
                    const isSelected = selectedAsset?.id === asset.id;
                    const project = asset.projectId ? allProjects.find((p) => p.id === asset.projectId) : null;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => handleAssetSelect(asset)}
                        className={cn(
                          "w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all",
                          isSelected
                            ? "bg-blue-600/20 border-blue-500 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                            {asset.unitNumber || asset.title.slice(0, 3)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white">{asset.title}</p>
                            <p className="text-xs text-slate-400">
                              {project?.name ? `${project.name} • ` : ""}
                              {asset.sectorName ? `${asset.sectorName} • ` : ""}
                              {asset.currency} {asset.price.toLocaleString("es-AR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            (!asset.status || asset.status === 'available') ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400 border border-amber-800"
                          )}>
                            {(!asset.status || asset.status === 'available') ? 'Disponible' : asset.status}
                          </span>
                          <ChevronRight size={16} className="text-slate-500" />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center bg-slate-900 rounded-xl border border-dashed border-slate-800 text-slate-500">
                    No se encontraron activos para la búsqueda.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: ASSET PREVIEW & CONTACT FORM */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} /> Cambiar activo seleccionado
                </button>
              </div>

              {/* ASSET PREVIEW CARD */}
              {selectedAsset && (
                <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 p-4 rounded-xl border border-blue-500/30 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block mb-1">
                        Activo Seleccionado
                      </span>
                      <h4 className="text-lg font-bold text-white">{selectedAsset.title}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {selectedAsset.neighborhood}, {selectedAsset.city}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedAsset.currency} {selectedAsset.price.toLocaleString("es-AR")}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs text-slate-300">
                    <div><span className="text-slate-500">Tipo:</span> <strong className="text-white">{selectedAsset.propertyType}</strong></div>
                    {selectedAsset.sectorName && <div><span className="text-slate-500">Sector:</span> <strong className="text-white">{selectedAsset.sectorName}</strong></div>}
                    {selectedAsset.area_m2 && <div><span className="text-slate-500">Superficie:</span> <strong className="text-white">{selectedAsset.area_m2} m²</strong></div>}
                  </div>
                </div>
              )}

              {/* CONTACT FORM */}
              <form id="drawer-lead-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <User size={16} className="text-blue-400" /> Paso 3: Datos de Contacto del Lead
                </h3>

                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xs font-semibold text-slate-300">
                        Nombre completo <span className="text-rose-400">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        placeholder="Ej: Marcos Gallardo"
                        className="h-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-rose-400" />}
                    </Field>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-xs font-semibold text-slate-300">WhatsApp / Teléfono</FieldLabel>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <Input
                            {...field}
                            placeholder="+54 9 11 1234 5678"
                            className="pl-9 h-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                          />
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-rose-400" />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-xs font-semibold text-slate-300">Email</FieldLabel>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="lead@ejemplo.com"
                            className="pl-9 h-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                          />
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-rose-400" />}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name="origin"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs font-semibold text-slate-300">Origen de contacto</FieldLabel>
                        <select
                          {...field}
                          className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-white outline-none focus:border-blue-500"
                        >
                          {ORIGINS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </Field>
                    )}
                  />

                  <Controller
                    name="stage"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs font-semibold text-slate-300">Estado inicial</FieldLabel>
                        <select
                          {...field}
                          className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-white outline-none focus:border-blue-500"
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
                      <FieldLabel className="text-xs font-semibold text-slate-300">Notas / Preferencias</FieldLabel>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Comentarios adicionales del interesado..."
                        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-rose-400" />}
                    </Field>
                  )}
                />

                {currentUser?.role === "ADMIN" && (
                  <Controller
                    name="agentId"
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel className="text-xs font-semibold text-slate-300">Asesor Comercial Asignado</FieldLabel>
                        <select
                          {...field}
                          className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-white outline-none focus:border-blue-500"
                        >
                          <option value="">Sin asignar (Global)</option>
                          {MOCK_USERS.filter(u => u.role === "ADVISOR").map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </Field>
                    )}
                  />
                )}
              </form>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <SheetFooter className="p-6 border-t border-slate-800 bg-slate-900/90 flex flex-row items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Reiniciar
          </Button>

          {step === 3 ? (
            <Button
              type="submit"
              form="drawer-lead-form"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-lg shadow-blue-600/30"
            >
              Guardar Lead
            </Button>
          ) : (
            <Button
              type="button"
              disabled={step === 1 && !selectedCategory}
              onClick={() => {
                if (step === 1 && selectedCategory) setStep(2);
                else if (step === 2 && selectedAsset) setStep(3);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 disabled:opacity-50"
            >
              Continuar <ChevronRight size={16} className="ml-1" />
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
