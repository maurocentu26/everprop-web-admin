import NewPropertyForm from "@/components/admin/NewPropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nueva propiedad</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cargá un nuevo inmueble y se guardará en localStorage para el MVP.
        </p>
      </div>

      <NewPropertyForm />
    </div>
  );
}
