import { Plus, Download, type LucideIcon } from "lucide-react";

export interface QuickAction {
  title: string;
  href: string;
  icon: LucideIcon;
  className: string;
}

export const quickActionsConfig: QuickAction[] = [
  { 
    title: "Nuevo Lead", 
    href: "/admin/leads/new", 
    icon: Plus, 
    className: "bg-blue-600 hover:bg-blue-700 text-white" 
  },
  { 
    title: "Nueva Propiedad", 
    href: "/admin/properties/new", 
    icon: Plus, 
    className: "bg-slate-800 hover:bg-slate-700 text-white" 
  },
  { 
    title: "Exportar Datos", 
    href: "#", 
    icon: Download, 
    className: "text-slate-400 hover:text-white" 
  },
];