import LeadKanban from "@/components/admin/LeadKanban";
import Link from "next/link";

export default function AllLeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-500">Todos los leads del sistema</p>
        </div>
        <Link href="/admin">
          <button className="text-sm font-medium text-blue-700">Volver al dashboard</button>
        </Link>
      </div>

      <div>
        {/* Reuse Kanban but could be switched to table if desired */}
        <LeadKanban />
      </div>
    </div>
  );
}
