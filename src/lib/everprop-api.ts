import type { Project, Property } from "@/data/admin-sample";
import type { UserProfile, UserRole } from "@/data/auth-sample";

const API_URL = process.env.NEXT_PUBLIC_EVERPROP_API_URL || "http://127.0.0.1:18080";
const TENANT = process.env.NEXT_PUBLIC_EVERPROP_TENANT || "bellomo";

type ApiEnvelope<T> = { data: T };
type ApiPage<T> = { data: T[]; meta?: { total?: number } };

type ApiUser = {
  id: string;
  display_name: string;
  email: string;
  role: string;
  capabilities: string[];
  tenant?: { name?: string };
};

type ApiProject = {
  public_id: string;
  name: string;
  project_type: string;
  status: string;
  progress?: number | string | null;
  total_units?: number | null;
  city?: string | null;
  province?: string | null;
  address?: string | null;
  description?: string | null;
  masterplan_image_url?: string | null;
};

type ApiProperty = {
  public_id: string;
  title: string;
  operation: string;
  category: string;
  status: string;
  price?: number | string | null;
  currency_code?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_m2?: number | string | null;
  main_image_url?: string | null;
  description?: string | null;
  sector_name?: string | null;
  unit_number?: string | null;
  project?: { public_id?: string } | null;
  services?: Property["services"] | null;
  commercial_features?: Property["commercialFeatures"] | null;
};

export class EverpropApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "EverpropApiError";
  }
}

export function isInvalidEverpropSession(error: unknown) {
  return error instanceof EverpropApiError && [401, 403, 419].includes(error.status);
}

function xsrfToken() {
  if (typeof document === "undefined") return "";
  const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith("XSRF-TOKEN="));
  return entry ? decodeURIComponent(entry.split("=").slice(1).join("=")) : "";
}

async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Everprop-Tenant", TENANT);

  if (init.body) headers.set("Content-Type", "application/json");
  if (init.method && !["GET", "HEAD"].includes(init.method.toUpperCase())) {
    const token = xsrfToken();
    if (token) headers.set("X-XSRF-TOKEN", token);
  }

  let response: Response;
  try {
    response = await fetch(new URL(path, API_URL), {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
      signal: init.signal || AbortSignal.timeout(10_000),
    });
  } catch (reason) {
    const timedOut =
      reason instanceof DOMException && ["AbortError", "TimeoutError"].includes(reason.name);
    throw new EverpropApiError(
      timedOut
        ? "La API EverProp demoró más de 10 segundos en responder."
        : "No se pudo conectar con la API EverProp.",
      0,
    );
  }

  if (response.status === 204) return null as T;

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; error?: { message?: string }; errors?: Record<string, string[]> }
    | null;

  if (!response.ok) {
    const validationMessage = payload?.errors ? Object.values(payload.errors).flat()[0] : null;
    throw new EverpropApiError(
      validationMessage || payload?.error?.message || payload?.message || `La API respondió ${response.status}.`,
      response.status,
    );
  }

  return payload as T;
}

function mapRole(role: string): UserRole {
  if (role === "SUPER_ADMIN" || role === "TENANT_ADMIN" || role === "SALES_MANAGER") return "ADMIN";
  return "ADVISOR";
}

function mapUser(user: ApiUser): UserProfile {
  const name = user.display_name || user.email;
  const avatar = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return {
    id: user.id,
    email: user.email,
    role: mapRole(user.role),
    apiRole: user.role,
    name,
    avatar: avatar || "EP",
    title: user.tenant?.name ? `${user.tenant.name} · API` : "Usuario EverProp",
    permissions: user.capabilities,
    source: "api",
  };
}

function mapProject(project: ApiProject): Project {
  const type = project.project_type.toUpperCase();
  const status = project.status.toUpperCase();

  return {
    id: project.public_id,
    companyId: "c1",
    name: project.name,
    type: type.includes("LAND") ? "land_development" : type.includes("BUILD") ? "building" : "commercial",
    status:
      status === "COMPLETED"
        ? "completed"
        : status.includes("CONSTRUCTION")
          ? "under_construction"
          : status.includes("SALE") || status === "PUBLISHED"
            ? "pre_sale"
            : "planning",
    progress: Number(project.progress || 0),
    location: {
      city: project.city || "Sin ciudad informada",
      province: project.province || "Jujuy",
      address: project.address || undefined,
    },
    totalUnits: Number(project.total_units || 0),
    description: project.description || undefined,
    coverImage: project.masterplan_image_url || undefined,
  };
}

function mapProperty(property: ApiProperty): Property {
  const categoryLabels: Record<string, string> = {
    LOT: "Lote",
    APARTMENT: "Departamento",
    LOCAL: "Local",
    GARAGE: "Cochera",
    HOUSE: "Casa",
    TRADITIONAL: "Propiedad",
  };
  const operation = property.operation.toUpperCase();
  const status = property.status.toUpperCase();

  return {
    id: property.public_id,
    companyId: "c1",
    title: property.title,
    operation: operation === "RENT" ? "rent" : operation === "TEMPORARY" ? "temporal" : "sale",
    propertyType: categoryLabels[property.category.toUpperCase()] || property.category,
    price: Number(property.price || 0),
    currency: property.currency_code === "ARS" ? "ARS" : "USD",
    city: property.city || "Sin ciudad informada",
    neighborhood: property.neighborhood || "",
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area_m2: property.area_m2 == null ? undefined : Number(property.area_m2),
    mainImage: property.main_image_url || undefined,
    description: property.description || undefined,
    projectId: property.project?.public_id || undefined,
    sectorName: property.sector_name || undefined,
    unitNumber: property.unit_number || undefined,
    status: status === "SOLD" ? "sold" : status === "RESERVED" ? "reserved" : "available",
    services: property.services || undefined,
    commercialFeatures: property.commercial_features || undefined,
  };
}

export async function loginEverprop(email: string, password: string) {
  await apiFetch<null>("/sanctum/csrf-cookie");
  const response = await apiFetch<ApiEnvelope<ApiUser>>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return mapUser(response.data);
}

export async function currentEverpropUser() {
  try {
    const response = await apiFetch<ApiEnvelope<ApiUser>>("/api/v1/auth/me");
    return mapUser(response.data);
  } catch (error) {
    if (isInvalidEverpropSession(error)) return null;
    throw error;
  }
}

export async function logoutEverprop() {
  await apiFetch<null>("/api/v1/auth/logout", { method: "POST" });
}

async function catalogFrom(prefix: "/api/v1/admin" | "/api/v1/public") {
  const [projects, properties] = await Promise.all([
    apiFetch<ApiPage<ApiProject>>(`${prefix}/projects?per_page=100`),
    apiFetch<ApiPage<ApiProperty>>(`${prefix}/properties?per_page=100`),
  ]);

  return {
    projects: projects.data.map(mapProject),
    properties: properties.data.map(mapProperty),
    source: prefix.includes("admin") ? ("admin-api" as const) : ("public-api" as const),
  };
}

export async function loadEverpropCatalog() {
  return catalogFrom("/api/v1/admin");
}

export async function everpropHealth() {
  const response = await apiFetch<{ status?: string }>("/healthz");
  return ["ok", "up", "ready"].includes(response.status || "");
}
