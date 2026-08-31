/**
 * EverProp API Client
 * Connects Next.js Frontend to Laravel 13 Sanctum Stateful API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:18080";
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT || "bellomo";

export interface LaravelUser {
  id: string;
  display_name: string;
  email: string;
  phone_e164?: string | null;
  role: "SUPER_ADMIN" | "TENANT_ADMIN" | "SALES_MANAGER" | "SALES_ADVISOR" | "BOT_OPERATOR" | "READ_ONLY";
  status: string;
  capabilities: string[];
  tenant?: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    status: string;
  };
}

/** Helper to get cookie value by name in browser */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

let csrfPromise: Promise<void> | null = null;

/** Ensure Sanctum CSRF cookie is initialized before mutating requests */
export async function ensureCsrfCookie(): Promise<void> {
  if (typeof window === "undefined") return;

  if (!csrfPromise) {
    csrfPromise = fetch(`${API_URL}/sanctum/csrf-cookie`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok && res.status !== 204) {
          throw new Error("Failed to initialize CSRF cookie");
        }
      })
      .catch((err) => {
        csrfPromise = null;
        console.warn("CSRF cookie initialization warning:", err);
      });
  }

  return csrfPromise;
}

/** Standard API Fetch wrapper with credentials and tenant resolution */
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; error?: null } | { data?: null; error: string }> {
  const method = (options.method || "GET").toUpperCase();
  const requiresCsrf = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (requiresCsrf) {
    await ensureCsrfCookie();
  }

  const xsrfToken = getCookie("XSRF-TOKEN");

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Everprop-Tenant": TENANT_SLUG,
    ...(options.headers as Record<string, string>),
  };

  if (xsrfToken) {
    headers["X-XSRF-TOKEN"] = xsrfToken;
  }

  try {
    const url = path.startsWith("http") ? path : `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    if (response.status === 204) {
      return { data: {} as T };
    }

    const json = await response.json();

    if (!response.ok) {
      const message =
        json.message ||
        (json.errors ? Object.values(json.errors).flat().join(" ") : "Error en el servidor");
      return { error: message };
    }

    return { data: json.data || json };
  } catch (err: any) {
    return { error: err.message || "No se pudo conectar con el servidor backend." };
  }
}

/** Auth API Methods */
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return apiFetch<LaravelUser>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  me: async () => {
    return apiFetch<LaravelUser>("/api/v1/auth/me", {
      method: "GET",
    });
  },

  logout: async () => {
    return apiFetch("/api/v1/auth/logout", {
      method: "POST",
    });
  },
};
