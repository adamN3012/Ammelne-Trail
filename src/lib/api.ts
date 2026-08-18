// ── Client API centralisé vers le backend PHP ─────────────────
// Toutes les communications avec le backend passent par ce fichier.

const BASE = import.meta.env.VITE_API_BASE ?? "/backend";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Erreur ${res.status}`);
  }

  return json as T;
}

// ── Auth admin ────────────────────────────────────────────────

export async function adminLogin(
  email: string,
  password: string
): Promise<{ token: string }> {
  return request<{ token: string }>("/login.php", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ── Site settings ─────────────────────────────────────────────

export type SiteSettings = Record<string, string>;

export async function fetchSettings(): Promise<SiteSettings> {
  return request<SiteSettings>("/settings.php");
}

export async function saveSettings(
  data: Partial<SiteSettings>,
  password: string
): Promise<void> {
  await request("/settings.php", {
    method: "POST",
    headers: { "X-Admin-Password": password },
    body: JSON.stringify(data),
  });
}

// ── Inscriptions ──────────────────────────────────────────────

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  parcours: string;
  tshirt: string;
  amount: string;
  paymentStatus: string;
  paymentRef: string;
  date: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  parcours: string;
  tshirt: string;
  amount: number;
  card: {
    number: string;
    name: string;
    exp: string;
    cvc: string;
  };
}

export interface RegisterResult {
  success: boolean;
  id: number;
  paymentRef: string;
}

export async function submitRegistration(
  payload: RegisterPayload
): Promise<RegisterResult> {
  return request<RegisterResult>("/register.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchRegistrations(
  password: string
): Promise<Registration[]> {
  return request<Registration[]>("/registrations.php", {
    headers: { "X-Admin-Password": password },
  });
}

// ── Upload logo ───────────────────────────────────────────────

export async function uploadLogo(
  file: File,
  password: string
): Promise<{ url: string }> {
  const form = new FormData();
  form.append("logo", file);
  const res = await fetch(`${BASE}/upload.php`, {
    method: "POST",
    headers: { "X-Admin-Password": password },
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Erreur upload");
  return json as { url: string };
}

// ── Contact ───────────────────────────────────────────────────

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export async function sendContact(payload: ContactPayload): Promise<void> {
  await request("/contact.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Export Excel ──────────────────────────────────────────────

export function exportExcelUrl(password: string): string {
  return `${BASE}/export.php?pwd=${encodeURIComponent(password)}`;
}
