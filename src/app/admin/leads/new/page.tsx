import NewLeadForm from "@/components/admin/NewLeadForm";

export default function NewLeadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nuevo lead</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cargá un nuevo contacto y se guardará en localStorage para el MVP.
        </p>
      </div>

      <NewLeadForm />
    </div>
  );
}
