"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import NewProjectForm from "@/components/admin/NewProjectForm";

export default function NewProjectPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/desarrollos">
          <button className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Desarrollo</h1>
          <p className="text-sm text-slate-500">Completá los datos para registrar un nuevo loteo, edificio o proyecto comercial.</p>
        </div>
      </div>

      <NewProjectForm />
    </div>
  );
}
