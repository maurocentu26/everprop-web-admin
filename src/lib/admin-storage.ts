import type { Lead, Property } from "@/data/admin-sample";

export const ADMIN_STORAGE_KEYS = {
  leads: "everprop:leads",
  properties: "everprop:properties",
} as const;

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadLeadList(seed: Lead[], companyId: string) {
  const stored = readList<Lead>(ADMIN_STORAGE_KEYS.leads);
  const source = stored.length > 0 ? stored : seed;
  return source.filter((lead) => lead.companyId === companyId);
}

export function loadPropertyList(seed: Property[], companyId: string) {
  const stored = readList<Property>(ADMIN_STORAGE_KEYS.properties);
  const source = stored.length > 0 ? stored : seed;
  return source.filter((property) => property.companyId === companyId);
}

export function appendLeadToStorage(nextLead: Lead, seed: Lead[], companyId: string) {
  const current = loadLeadList(seed, companyId);
  const next = [...current, nextLead];
  window.localStorage.setItem(ADMIN_STORAGE_KEYS.leads, JSON.stringify(next));
  return next;
}

export function appendPropertyToStorage(nextProperty: Property, seed: Property[], companyId: string) {
  const current = loadPropertyList(seed, companyId);
  const next = [...current, nextProperty];
  window.localStorage.setItem(ADMIN_STORAGE_KEYS.properties, JSON.stringify(next));
  return next;
}

export function saveLeadList(list: Lead[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_STORAGE_KEYS.leads, JSON.stringify(list));
}

export function savePropertyList(list: Property[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_STORAGE_KEYS.properties, JSON.stringify(list));
}
