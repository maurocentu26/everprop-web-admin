"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, CircleAlert, CircleCheck, Edit3, ExternalLink, Layers3, Plus, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  leads as sampleLeads,
  projects as sampleProjects,
  properties as sampleProperties,
  type Lead,
  type LeadInterest,
  type LeadInterestCategory,
  type Project,
  type Property,
  type Visit,
} from "@/data/admin-sample";
import { MOCK_USERS } from "@/data/auth-sample";
import { loadLeadList, loadProjectList, loadPropertyList, saveLeadList, savePropertyList, updateLeadAgent } from "@/lib/admin-storage";
import {
  createInterestForProperty,
  getInterestAssetIds,
  getInterestPendingFields,
  normalizeLeadInterests,
  syncLeadWithInterests,
} from "@/lib/lead-interests";
import { useAuth } from "@/lib/auth-context";
import { createNotification } from "@/lib/notifications";
import { deferEffectUpdate } from "@/lib/deferred-effect";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VisitManager from "@/components/admin/VisitManager";
import FinancingCalculator from "@/components/admin/FinancingCalculator";
import { LeadInterestEditor } from "@/components/admin/LeadInterestEditor";
import { LeadProfileEditor } from "@/components/admin/LeadProfileEditor";
import { LeadAdvisorEditor } from "@/components/admin/LeadAdvisorEditor";
import { LeadFollowUpEditor } from "@/components/admin/LeadFollowUpEditor";
import { LeadFollowUpStatus } from "@/components/admin/LeadFollowUpStatus";

const CATEGORY_LABELS: Record<LeadInterestCategory, string> = {
  loteo: "Loteos",
  local: "Locales",
  cochera: "Cocheras",
  tradicional: "Inmobiliaria tradicional",
};

type InterestEditorState = { mode: "new" } | { mode: "edit"; interest: LeadInterest } | null;

export default function LeadDetailView({ leadId }: { leadId: string }) {
  const { currentUser } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [advisorEditorOpen, setAdvisorEditorOpen] = useState(false);
  const [followUpEditorOpen, setFollowUpEditorOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [interestEditor, setInterestEditor] = useState<InterestEditorState>(null);
  const [interestToDelete, setInterestToDelete] = useState<LeadInterest | null>(null);

  useEffect(() => {
    return deferEffectUpdate(() => {
      const initialLeads = loadLeadList(sampleLeads, "c1");
      const foundLead = initialLeads.find((candidate) => candidate.id === leadId) ?? null;
      const companyId = foundLead?.companyId ?? "c1";
      setAllLeads(initialLeads);
      setAllProperties(loadPropertyList(sampleProperties, companyId));
      setAllProjects(loadProjectList(sampleProjects, companyId));
      setLead(foundLead);
    });
  }, [leadId]);

  const interests = useMemo(() => lead ? normalizeLeadInterests(lead, allProperties) : [], [allProperties, lead]);
  const projectById = useMemo(() => new Map(allProjects.map((project) => [project.id, project])), [allProjects]);
  const propertyById = useMemo(() => new Map(allProperties.map((property) => [property.id, property])), [allProperties]);

  function updateLeadData(nextLead: Lead) {
    if (!lead || nextLead.companyId !== lead.companyId) {
      toast.error("No se puede guardar información de otra empresa.");
      return;
    }
    const nextLeads = allLeads.map((candidate) => candidate.id === nextLead.id ? nextLead : candidate);
    saveLeadList(nextLeads, nextLead.companyId);
    setAllLeads(nextLeads);
    setLead(nextLead);
  }

  function handleSaveProfile(nextLead: Lead) {
    updateLeadData(nextLead);
    setProfileEditorOpen(false);
    toast.success("Ficha del cliente actualizada");
  }

  function handleSaveInterest(nextInterest: LeadInterest) {
    if (!lead || nextInterest.companyId !== lead.companyId) {
      toast.error("El interés no pertenece a la empresa activa.");
      return;
    }
    const nextInterests = interestEditor?.mode === "edit"
      ? interests.map((interest) => interest.id === nextInterest.id ? nextInterest : interest)
      : [...interests, nextInterest];
    updateLeadData(syncLeadWithInterests(lead, nextInterests, allProperties));
    setInterestEditor(null);
    toast.success(interestEditor?.mode === "edit" ? "Interés actualizado" : "Interés agregado");
  }

  function handleDeleteInterest() {
    if (!lead || !interestToDelete) return;
    const nextInterests = interests.filter((interest) => interest.id !== interestToDelete.id);
    updateLeadData(syncLeadWithInterests(lead, nextInterests, allProperties));
    setInterestToDelete(null);
    toast.success("Interés eliminado", { description: `${lead.name} continúa registrado y conserva sus demás intereses.` });
  }

  function handleScheduleVisit(visit: Visit) {
    if (!lead) return;
    const finalVisit: Visit = {
      ...visit,
      leadId: lead.id,
      leadName: lead.name,
      agentId: visit.agentId ?? lead.agentId,
    };
    const propertyId = visit.propertyId;
    let nextInterests = interests;
    if (propertyId && !getInterestAssetIds(interests).includes(propertyId)) {
      const property = allProperties.find((candidate) => candidate.id === propertyId);
      if (property) nextInterests = [...interests, createInterestForProperty(lead, property)];
    }
    const syncedLead = syncLeadWithInterests(lead, nextInterests, allProperties);
    const nextLead: Lead = { ...syncedLead, visits: [...(lead.visits ?? []), finalVisit], lastActivity: new Date().toISOString() };
    const nextProperties = propertyId
      ? allProperties.map((property) => property.id === propertyId ? { ...property, visits: [...(property.visits ?? []), finalVisit] } : property)
      : allProperties;
    const nextLeads = allLeads.map((candidate) => candidate.id === nextLead.id ? nextLead : candidate);
    setLead(nextLead);
    setAllLeads(nextLeads);
    setAllProperties(nextProperties);
    saveLeadList(nextLeads, lead.companyId);
    savePropertyList(nextProperties, lead.companyId);
    toast.success("Visita agendada y sincronizada con la propiedad");
  }

  function handleReassignAgentConfirmed(agentId?: string) {
    if (!lead) return;
    const nextLeads = updateLeadAgent(lead.id, agentId, allLeads, lead.companyId);
    setAllLeads(nextLeads);
    setLead(nextLeads.find((candidate) => candidate.id === lead.id) ?? null);
    if (agentId) {
      try {
        const channel = new BroadcastChannel("everprop_events");
        channel.postMessage({ type: "LEAD_REASSIGNED", targetAgentId: agentId, leadName: lead.name });
        channel.close();
        createNotification(agentId, `Se te ha reasignado el lead "${lead.name}"`);
      } catch (error) {
        console.error(error);
      }
    }
    setAdvisorEditorOpen(false);
    toast.success(agentId ? "Asesor responsable actualizado" : "Lead dejado sin asignar");
  }

  function handleUpdateFollowUp() {
    if (!lead) return;
    updateLeadData({ ...lead, followUpUpdatedAt: new Date().toISOString() });
    setFollowUpEditorOpen(false);
    toast.success("Seguimiento actualizado");
  }

  if (!lead) return null;

  const generalPendingData = [
    !lead.phone ? "Teléfono" : null,
    !lead.email ? "Email" : null,
    !lead.notes ? "Notas generales" : null,
    interests.length === 0 ? "Interés inmobiliario" : null,
  ].filter((item): item is string => item !== null);
  const interestAssetIds = getInterestAssetIds(interests);
  const primaryProperty = interestAssetIds[0]
    ? propertyById.get(interestAssetIds[0])
    : undefined;
  const assignedAgent = lead.agentId
    ? MOCK_USERS.find((user) => user.id === lead.agentId)
    : undefined;

  return (
    <div className="mx-auto w-full max-w-[120rem] space-y-6 pb-12">
      <Link href="/admin#leads" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-700">
        <ArrowLeft className="size-5" aria-hidden="true" /> Volver al pipeline
      </Link>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8" aria-labelledby="lead-name">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar className="size-20 shrink-0 rounded-2xl bg-blue-600 text-2xl font-bold text-white">
              <AvatarFallback className="bg-blue-600 text-white">{lead.name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 id="lead-name" className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{lead.name}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="default" className="px-3 py-1 text-sm">{lead.origin}</Badge>
                <Badge className="border-0 bg-blue-50 px-3 py-1 text-sm capitalize text-blue-700">{lead.stage}</Badge>
                <Badge className="border-0 bg-slate-100 px-3 py-1 text-sm text-slate-700">{interests.length} {interests.length === 1 ? "interés" : "intereses"}</Badge>
              </div>
              <div className="mt-5 grid gap-3 text-base text-slate-700 sm:grid-cols-2">
                <p><span className="font-bold text-slate-950">Teléfono:</span> {lead.phone || "Sin informar"}</p>
                <p><span className="font-bold text-slate-950">Email:</span> {lead.email || "Sin informar"}</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setProfileEditorOpen(true)} className="h-14 w-full gap-2 bg-blue-600 px-6 text-lg font-bold text-white hover:bg-blue-700 xl:w-auto">
            <Edit3 className="size-5" aria-hidden="true" /> Completar ficha
          </Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5" aria-labelledby="lead-advisor-title">
            <div>
              <p id="lead-advisor-title" className="text-sm font-semibold text-slate-500">Asesor responsable</p>
              <p className="mt-1 text-xl font-bold text-slate-950">{assignedAgent?.name ?? "Sin asignar"}</p>
              <p className="mt-1 text-base leading-7 text-slate-600">Cada lead conserva un único asesor responsable.</p>
            </div>
            {currentUser?.role === "ADMIN" && (
              <Button variant="outline" onClick={() => setAdvisorEditorOpen(true)} className="h-12 w-full px-5 text-base font-semibold sm:w-auto sm:self-start">
                Cambiar asesor
              </Button>
            )}
          </section>

          <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5" aria-labelledby="lead-follow-up-title">
            <div>
              <p id="lead-follow-up-title" className="text-sm font-semibold text-slate-500">Seguimiento comercial</p>
              <LeadFollowUpStatus updatedAt={lead.followUpUpdatedAt} className="mt-3" />
            </div>
            <Button onClick={() => setFollowUpEditorOpen(true)} className="h-12 w-full bg-blue-600 px-5 text-base font-bold text-white hover:bg-blue-700 sm:w-auto sm:self-start">
              Actualizar seguimiento
            </Button>
          </section>
        </div>

        {generalPendingData.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5" role="status">
            <div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-6 shrink-0 text-amber-700" aria-hidden="true" /><div>
              <p className="text-base font-bold text-amber-950">Información pendiente</p>
              <p className="mt-1 text-base leading-7 text-amber-800">El cliente ya está registrado. Estos datos pueden completarse cuando estén disponibles.</p>
              <div className="mt-3 flex flex-wrap gap-2">{generalPendingData.map((item) => <span key={item} className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-sm font-semibold text-amber-900">{item}</span>)}</div>
            </div></div>
          </div>
        ) : (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-base font-semibold text-emerald-800" role="status"><CircleCheck className="size-6 shrink-0" aria-hidden="true" /> La información general del cliente está completa.</div>
        )}

        {lead.notes && <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500"><StickyNote className="size-4" aria-hidden="true" /> Notas generales</p><p className="mt-2 whitespace-pre-wrap text-base leading-7 text-slate-700">{lead.notes}</p></div>}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8" aria-labelledby="lead-interests-title">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-[0.12em] text-blue-700">Calificación comercial</p><h2 id="lead-interests-title" className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Intereses independientes</h2><p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">Cada ficha conserva su propio proyecto, propiedad, unidad, preferencias y notas.</p></div>
          <Button onClick={() => setInterestEditor({ mode: "new" })} className="h-14 w-full gap-2 bg-blue-600 px-6 text-lg font-bold text-white hover:bg-blue-700 sm:w-auto"><Plus className="size-5" aria-hidden="true" /> Agregar interés</Button>
        </div>

        {interests.length === 0 ? (
          <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-7 text-center"><Layers3 className="size-11 text-slate-400" aria-hidden="true" /><h3 className="mt-4 text-xl font-bold text-slate-950">Todavía no hay intereses cargados</h3><p className="mt-2 max-w-xl text-base leading-7 text-slate-600">Podés registrar una ficha vacía y completarla durante la calificación.</p></div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {interests.map((interest, index) => {
              const project = interest.projectId ? projectById.get(interest.projectId) : undefined;
              const property = interest.propertyId ? propertyById.get(interest.propertyId) : undefined;
              const unit = interest.unitId ? propertyById.get(interest.unitId) : undefined;
              const pendingFields = getInterestPendingFields(interest);
              return (
                <article key={interest.id} className="flex min-h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-sm font-bold uppercase tracking-wider text-blue-700">Interés {index + 1}</p><h3 className="mt-2 text-2xl font-bold text-slate-950">{interest.category ? CATEGORY_LABELS[interest.category] : "Sin categoría"}</h3></div><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm"><Building2 className="size-6" aria-hidden="true" /></span></div>
                  <dl className="mt-5 space-y-3 text-base">
                    <div><dt className="font-semibold text-slate-500">Proyecto</dt><dd className="mt-1 font-bold text-slate-900">{project?.name || "Sin informar"}</dd></div>
                    <div><dt className="font-semibold text-slate-500">Propiedad</dt><dd className="mt-1 font-bold text-slate-900">{property?.title || "Sin informar"}</dd></div>
                    <div><dt className="font-semibold text-slate-500">Unidad</dt><dd className="mt-1 font-bold text-slate-900">{unit ? `${unit.unitNumber || unit.title}${unit.sectorName ? ` · ${unit.sectorName}` : ""}` : "Sin informar"}</dd></div>
                  </dl>
                  <div className="mt-5 space-y-3 border-t border-slate-200 pt-5"><div><p className="text-sm font-semibold text-slate-500">Preferencias</p><p className="mt-1 whitespace-pre-wrap text-base leading-7 text-slate-800">{interest.preferences || "Sin informar"}</p></div><div><p className="text-sm font-semibold text-slate-500">Notas</p><p className="mt-1 whitespace-pre-wrap text-base leading-7 text-slate-800">{interest.notes || "Sin informar"}</p></div></div>
                  <div className="mt-5"><p className="text-sm font-bold text-amber-800">Datos sin informar</p><div className="mt-2 flex flex-wrap gap-2">{pendingFields.length > 0 ? pendingFields.map((field) => <span key={field} className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-900">{field}</span>) : <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-800">Ficha completa</span>}</div><p className="mt-2 text-sm leading-6 text-slate-500">Algunos datos pueden no corresponder; nunca bloquean la ficha.</p></div>
                  <div className="mt-auto grid grid-cols-2 gap-3 pt-6"><Button variant="outline" onClick={() => setInterestEditor({ mode: "edit", interest })} className="h-12 gap-2 text-base font-semibold"><Edit3 className="size-4" aria-hidden="true" /> Editar</Button><Button variant="outline" onClick={() => setInterestToDelete(interest)} className="h-12 gap-2 border-rose-200 text-base font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-800"><Trash2 className="size-4" aria-hidden="true" /> Eliminar</Button></div>
                  {(property || unit) && <Link href={`/admin/properties/${(unit ?? property)?.id}`} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-base font-semibold text-blue-700 hover:bg-blue-50">Ver activo <ExternalLink className="size-4" aria-hidden="true" /></Link>}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <FinancingCalculator defaultPrice={primaryProperty?.price} defaultCurrency={primaryProperty?.currency ?? "USD"} leadName={lead.name} />
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><VisitManager title="Gestión de visitas" subtitle="Agendá citas para cualquiera de sus activos de interés." visits={lead.visits ?? []} onSchedule={handleScheduleVisit} defaultGuestName={lead.name} defaultPhone={lead.phone} defaultEmail={lead.email} defaultAgentId={lead.agentId} propertyOptions={allProperties.filter((property) => interestAssetIds.includes(property.id))} /></section>
      </div>

      {profileEditorOpen && <LeadProfileEditor key={lead.lastActivity} lead={lead} onClose={() => setProfileEditorOpen(false)} onSave={handleSaveProfile} />}
      {interestEditor && <LeadInterestEditor key={interestEditor.mode === "edit" ? interestEditor.interest.id : "new-interest"} companyId={lead.companyId} interest={interestEditor.mode === "edit" ? interestEditor.interest : undefined} projects={allProjects} properties={allProperties} onClose={() => setInterestEditor(null)} onSave={handleSaveInterest} />}
      {followUpEditorOpen && <LeadFollowUpEditor leadName={lead.name} updatedAt={lead.followUpUpdatedAt} onClose={() => setFollowUpEditorOpen(false)} onConfirm={handleUpdateFollowUp} />}
      {advisorEditorOpen && currentUser?.role === "ADMIN" && <LeadAdvisorEditor leadName={lead.name} currentAgentId={lead.agentId} onClose={() => setAdvisorEditorOpen(false)} onSave={handleReassignAgentConfirmed} />}

      <Dialog open={Boolean(interestToDelete)} onOpenChange={(open) => !open && setInterestToDelete(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Eliminar este interés</DialogTitle><DialogDescription>Se quitará solamente esta ficha. El cliente y sus demás intereses no serán eliminados.</DialogDescription></DialogHeader><DialogFooter className="mt-4 gap-2"><Button variant="outline" onClick={() => setInterestToDelete(null)}>Cancelar</Button><Button variant="destructive" onClick={handleDeleteInterest}>Eliminar interés</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
