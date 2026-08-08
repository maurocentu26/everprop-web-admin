export type UserRole = "ADMIN" | "ENGINEER" | "ADVISOR";

export type UserProfile = {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar: string;
  title: string;
  permissions: string[];
};

export const MOCK_USERS: UserProfile[] = [
  {
    id: "usr-admin",
    email: "marcos.bellomo@everprop.local",
    role: "ADMIN",
    name: "Marcos Bellomo",
    avatar: "MB",
    title: "Director General",
    permissions: ["full_access", "view_all_stats", "reassign_leads", "manage_inventory"],
  },
  {
    id: "usr-manager",
    email: "sofia.ingeniera@everprop.local",
    role: "ENGINEER",
    name: "Ing. Sofía",
    avatar: "IS",
    title: "Ingeniera / Directora de Obra",
    permissions: ["desarrolladora_workspace", "manage_inventory", "construction_progress"],
  },
  {
    id: "usr-sales",
    email: "carlos.vendedor@everprop.local",
    role: "ADVISOR",
    name: "Carlos Vendedor",
    avatar: "CV",
    title: "Asesor Comercial",
    permissions: ["assigned_leads_only", "assigned_visits_only"],
  },
  {
    id: "usr-sales-2",
    email: "lucia.vendedora@everprop.local",
    role: "ADVISOR",
    name: "Lucía Vendedora",
    avatar: "LV",
    title: "Asesora Comercial",
    permissions: ["assigned_leads_only", "assigned_visits_only"],
  },
];
