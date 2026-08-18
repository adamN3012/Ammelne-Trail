import { useEffect, useRef, useState } from "react";
import {
  Download, Lock, LogOut, Users, CreditCard, RefreshCw,
  Search, ChevronUp, ChevronDown, MapPin, Settings, Save,
  Upload, Eye, LayoutDashboard,
} from "lucide-react";
import { DEFAULTS, invalidateSiteContent } from "@/hooks/use-site-content";
import { useToast } from "@/components/ui/toast-notify";
import rocksImg   from "@/assets/tafraout-rocks.jpg";
import villageImg from "@/assets/gallery-village.jpg";
import almondsImg from "@/assets/gallery-almonds.jpg";
import runnersImg from "@/assets/gallery-runners.jpg";

const ADMIN_PASSWORD = "trail2024";
const ADMIN_EMAIL    = "asvla2900@gmail.com";
const API = (import.meta as any).env?.VITE_API_URL ?? "";

type Registration = {
  id: string; date: string; fullName: string; email: string;
  phone: string; city: string; parcours: string; tshirt: string;
  amount: string; paymentStatus: string; paymentRef: string;
};
type SortKey = keyof Registration;
type SortDir = "asc" | "desc";
type Tab = "dashboard" | "editor" | "settings";

function parcoursColor(p: string) {
  if (p?.includes("23")) return "bg-orange-100 text-orange-700";
  if (p?.includes("10")) return "bg-violet-100 text-violet-700";
  return "bg-gray-100 text-gray-600";
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4 shadow-sm">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function ImageUploadField({ label, k, values, onChange, toast, fallback }: {
  label: string; k: string;
  values: Record<string, string>;
  onChange: (k: string, v: string) => void;
  toast: (msg: string, type: "success" | "error") => void;
  fallback?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const current   = values[k] ?? "";
  const preview   = current || fallback || "";
  const hasCustom = !!current;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png","image/jpeg","image/webp","image/svg+xml"].includes(file.type)) {
      toast("Format non autorisé (PNG, JPG, WEBP, SVG)", "error"); return;
    }
    if (file.size > 5 * 1024 * 1024) { toast("Max 5 Mo", "error"); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        onChange(k, dataUrl);
        const API2 = (import.meta as any).env?.VITE_API_URL ?? "";
        await fetch(`${API2}/api/settings`, {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ [k]: dataUrl }),
        });
        toast(`${label} mis à jour`, "success");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch { toast("Erreur upload", "error"); setUploading(false); }
    if (ref.current) ref.current.value = "";
  };

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <div className="flex items-start gap-3">
        <div className="h-20 w-28 rounded-xl border border-border bg-secondary/40 overflow-hidden shrink-0 relative">
          {preview
            ? <img src={preview} alt={label} className="h-full w-full object-cover" />
            : <div className="h-full w-full flex items-center justify-center"><Upload size={18} className="text-muted-foreground" /></div>
          }
          {!hasCustom && fallback && (
            <span className="absolute bottom-1 left-1 right-1 text-center text-[9px] font-medium bg-black/50 text-white rounded px-1 py-0.5">
              Par défaut
            </span>
          )}
          {hasCustom && (
            <span className="absolute bottom-1 left-1 right-1 text-center text-[9px] font-medium bg-green-600/80 text-white rounded px-1 py-0.5">
              Personnalisé
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition disabled:opacity-60">
            <Upload size={11} /> {uploading ? "Upload…" : hasCustom ? "Remplacer" : "Uploader"}
          </button>
          {hasCustom && (
            <button type="button"
              onClick={async () => {
                onChange(k, "");
                const API2 = (import.meta as any).env?.VITE_API_URL ?? "";
                await fetch(`${API2}/api/settings`, {
                  method: "POST", headers: { "content-type": "application/json" },
                  body: JSON.stringify({ [k]: "" }),
                });
                toast("Photo supprimée — image par défaut restaurée", "success");
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, k, values, onChange }: {
  label: string; k: string;
  values: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  const isLong = (values[k] ?? "").length > 80;
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {isLong ? (
        <textarea
          rows={3}
          value={values[k] ?? DEFAULTS[k] ?? ""}
          onChange={(e) => onChange(k, e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
        />
      ) : (
        <input
          type="text"
          value={values[k] ?? DEFAULTS[k] ?? ""}
          onChange={(e) => onChange(k, e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
        />
      )}
    </div>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border bg-secondary/30">
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <div className="p-5 grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export function AdminPage() {
  const [view, setView] = useState<"login" | "app">(() =>
    typeof window !== "undefined" && sessionStorage.getItem("admin_auth") === "1" ? "app" : "login"
  );
  const [tab, setTab]               = useState<Tab>("dashboard");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn]   = useState(false);

  // Dashboard
  const [rows, setRows]       = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch]   = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Editor
  const [values, setValues] = useState<Record<string, string>>({ ...DEFAULTS });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Settings
  const [adminEmail, setAdminEmail]       = useState(ADMIN_EMAIL);
  const [adminPassword, setAdminPassword] = useState(ADMIN_PASSWORD);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail]           = useState("");
  const [newPassword, setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingCreds, setSavingCreds]     = useState(false);
  // OTP flow — only for email change in settings
  const [otpStep, setOtpStep]       = useState(false);
  const [otpCode, setOtpCode]       = useState("");
  const [otpError, setOtpError]     = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/registrations`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  const fetchSettings = async () => {
    try {
      const res  = await fetch(`${API}/api/settings`);
      const data = await res.json();
      setValues((v) => ({ ...v, ...data }));
      if (data.admin_email)    setAdminEmail(data.admin_email);
      if (data.admin_password) setAdminPassword(data.admin_password);
    } catch {}
  };

  useEffect(() => {
    if (view === "app") { fetchData(); fetchSettings(); }
  }, [view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const res  = await fetch(`${API}/api/admin/verify-credentials`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error || "Email ou mot de passe incorrect"); return; }
      sessionStorage.setItem("admin_auth", "1");
      setView("app");
    } catch {
      setLoginError("Erreur réseau — réessayez.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res  = await fetch(`${API}/api/export`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `inscriptions-${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click(); URL.revokeObjectURL(url);
      toast("Fichier Excel téléchargé avec succès", "success");
    } catch { toast("Erreur lors de l'export Excel", "error"); }
    finally { setExporting(false); }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleChange = (k: string, v: string) => setValues((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/settings`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      invalidateSiteContent();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast("Modifications sauvegardées avec succès", "success");
    } catch { toast("Erreur lors de la sauvegarde", "error"); }
    finally { setSaving(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/png","image/jpeg","image/webp","image/svg+xml"];
    if (!allowed.includes(file.type)) {
      toast("Format non autorisé — PNG, JPG, WEBP ou SVG uniquement", "error"); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast("Fichier trop lourd — maximum 2 Mo", "error"); return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("logo", file);
      const res  = await fetch(`${API}/api/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur upload");
      if (data.url) {
        handleChange("logo_url", data.url);
        invalidateSiteContent();
        toast("Logo mis à jour avec succès", "success");
      }
    } catch (err: any) {
      toast(err.message || "Erreur lors de l'upload du logo", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const updateStatus = async (id: string, status: "Payé" | "Refusé" | "En attente") => {
    try {
      const res = await fetch(`${API}/api/registrations/${id}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, paymentStatus: status } : r));
      if (status === "Payé") toast(`Paiement #${id} confirmé`, "success");
      else if (status === "Refusé") toast(`Inscription #${id} refusée`, "error");
      else toast(`Inscription #${id} remise en attente`, "success");
    } catch {
      toast("Erreur lors de la mise à jour du statut", "error");
    }
  };

  const handleSaveCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword !== adminPassword) {
      toast("Mot de passe actuel incorrect", "error"); return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast("Les mots de passe ne correspondent pas", "error"); return;
    }
    if (newPassword && newPassword.length < 6) {
      toast("Le mot de passe doit faire au moins 6 caractères", "error"); return;
    }
    if (!newEmail.trim() && !newPassword.trim()) {
      toast("Aucune modification à enregistrer", "error"); return;
    }
    // Email change requires OTP
    if (newEmail.trim()) {
      setSavingCreds(true);
      try {
        const res  = await fetch(`${API}/api/admin/request-otp`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: adminEmail, password: currentPassword }),
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || "Erreur envoi OTP", "error"); return; }
        setPendingEmail(newEmail.trim());
        setOtpStep(true);
        setOtpCode("");
        setOtpError("");
        toast("Code de vérification envoyé sur votre email actuel", "success");
      } catch { toast("Erreur réseau", "error"); }
      finally { setSavingCreds(false); }
      return;
    }
    // Password-only change — save directly
    await saveCredentials({});
  };

  const handleVerifyOtpAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingOtp(true);
    setOtpError("");
    try {
      const res  = await fetch(`${API}/api/admin/verify-otp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ otp: otpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error || "Code incorrect"); return; }
      await saveCredentials({ admin_email: pendingEmail });
      setOtpStep(false); setOtpCode(""); setPendingEmail(""); setOtpError("");
    } catch { setOtpError("Erreur réseau"); }
    finally { setVerifyingOtp(false); }
  };

  const saveCredentials = async (extra: Record<string, string>) => {
    setSavingCreds(true);
    try {
      const updates: Record<string, string> = { ...extra };
      if (newPassword.trim()) updates.admin_password = newPassword.trim();
      await fetch(`${API}/api/settings`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (updates.admin_email)    setAdminEmail(updates.admin_email);
      if (updates.admin_password) setAdminPassword(updates.admin_password);
      setNewEmail(""); setNewPassword(""); setConfirmPassword(""); setCurrentPassword("");
      toast("Identifiants mis à jour avec succès", "success");
    } catch { toast("Erreur lors de la sauvegarde", "error"); }
    finally { setSavingCreds(false); }
  };

  const filtered = rows
    .filter((r) => {
      const q = search.toLowerCase();
      return r.fullName?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) ||
             r.city?.toLowerCase().includes(q) || r.parcours?.toLowerCase().includes(q) || r.phone?.includes(q);
    })
    .sort((a, b) => {
      const va = a[sortKey] ?? "", vb = b[sortKey] ?? "";
      return sortDir === "asc"
        ? va.localeCompare(vb, undefined, { numeric: true })
        : vb.localeCompare(va, undefined, { numeric: true });
    });

  const totalMAD       = rows.filter((r) => r.paymentStatus === "Payé").reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const totalConfirmed = rows.filter((r) => r.paymentStatus === "Payé").length;
  const totalPending   = rows.filter((r) => r.paymentStatus === "En attente").length;
  const t10 = rows.filter((r) => r.parcours === (values.p1_name || "Trail 10 km") && r.paymentStatus === "Payé").length;
  const t23 = rows.filter((r) => r.parcours === (values.p2_name || "Trail 23 km") && r.paymentStatus === "Payé").length;

  // ── Login view ─────────────────────────────────────────────
  if (view === "login") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-elevated p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock size={22} className="text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Espace administrateur</h1>
            <p className="mt-1 text-sm text-muted-foreground">Ammelne Trail — accès restreint</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input type="email" required autoFocus value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)} placeholder="Votre email admin"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe</label>
              <input type="password" required value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition" />
            </div>
            {loginError && <p className="text-sm text-red-500 font-medium">{loginError}</p>}
            <button type="submit" disabled={loggingIn}
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:scale-[1.01] disabled:opacity-60">
              {loggingIn ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── App view ───────────────────────────────────────────────
  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
      : <ChevronDown size={12} className="opacity-25" />;

  const COLS: { key: SortKey; label: string; hide?: boolean }[] = [
    { key: "id",            label: "ID" },
    { key: "fullName",      label: "Nom" },
    { key: "email",         label: "Email",    hide: true },
    { key: "phone",         label: "Tél.",     hide: true },
    { key: "city",          label: "Ville",    hide: true },
    { key: "parcours",      label: "Parcours" },
    { key: "tshirt",        label: "T-shirt",  hide: true },
    { key: "amount",        label: "Montant" },
    { key: "paymentStatus", label: "Statut" },
    { key: "date",          label: "Date",     hide: true },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">

      {/* ── Sidebar gauche ── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-card min-h-screen sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <MapPin size={15} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">Admin</p>
              <p className="text-xs font-semibold text-foreground leading-tight">Ammelne Trail</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {([
            ["dashboard", "Dashboard",      LayoutDashboard],
            ["editor",    "Éditeur du site", Settings],
            ["settings",  "Paramètres",      Lock],
          ] as const).map(([t, l, Icon]) => (
            <button key={t} onClick={() => setTab(t as Tab)}
              className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}>
              <Icon size={16} />
              {l}
            </button>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="px-3 py-4 border-t border-border">
          <button onClick={() => { sessionStorage.removeItem("admin_auth"); setView("login"); }}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header top */}
        <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-sm px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Logo mobile */}
            <div className="md:hidden flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <MapPin size={13} className="text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">Admin</span>
            </div>
            <p className="hidden md:block text-sm font-semibold text-foreground">
              {tab === "dashboard" ? "Dashboard" : tab === "editor" ? "Éditeur du site" : "Paramètres"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {tab === "dashboard" && (
              <>
                <button onClick={fetchData} disabled={loading} title="Actualiser"
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition disabled:opacity-40">
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </button>
                <button onClick={handleExport} disabled={exporting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60">
                  <Download size={13} />
                  {exporting ? "Export…" : "Exporter Excel"}
                </button>
              </>
            )}
            {tab === "editor" && (
              <>
                <a href="/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition">
                  <Eye size={13} /> Voir le site
                </a>
                <button onClick={handleSave} disabled={saving}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition disabled:opacity-60 ${saved ? "bg-green-600" : "bg-primary hover:bg-primary/90"}`}>
                  <Save size={13} />
                  {saving ? "Sauvegarde…" : saved ? "Sauvegardé ✓" : "Sauvegarder"}
                </button>
              </>
            )}
            {/* Mobile déconnexion */}
            <button onClick={() => { sessionStorage.removeItem("admin_auth"); setView("login"); }}
              className="md:hidden flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition px-2 py-2">
              <LogOut size={13} />
            </button>
          </div>
        </header>

        {/* Mobile tabs */}
        <div className="md:hidden flex border-b border-border bg-card">
          {([["dashboard","Dashboard",LayoutDashboard],["editor","Éditeur",Settings],["settings","Paramètres",Lock]] as const).map(([t, l, Icon]) => (
            <button key={t} onClick={() => setTab(t as Tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
              <Icon size={13} />{l}
            </button>
          ))}
        </div>

      <main className="w-full px-4 md:px-8 py-8 space-y-8">

        {/* ══ DASHBOARD ══════════════════════════════════════════ */}
        {tab === "dashboard" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Users size={19} className="text-blue-600" />} label="Total inscrits"
                value={rows.length}
                sub={`${totalConfirmed} confirmé${totalConfirmed > 1 ? "s" : ""} · ${totalPending} en attente`}
                color="bg-blue-50" />
              <StatCard icon={<ChevronUp size={19} className="text-violet-600" />} label={values.p1_name || "Trail 10 km"}
                value={t10}
                sub={`${totalConfirmed ? Math.round(t10 / totalConfirmed * 100) : 0}% des confirmés`}
                color="bg-violet-50" />
              <StatCard icon={<ChevronUp size={19} className="text-orange-600" />} label={values.p2_name || "Trail 23 km"}
                value={t23}
                sub={`${totalConfirmed ? Math.round(t23 / totalConfirmed * 100) : 0}% des confirmés`}
                color="bg-orange-50" />
              <StatCard icon={<CreditCard size={19} className="text-green-600" />} label="Total encaissé"
                value={`${totalMAD.toLocaleString("fr-MA")} MAD`}
                sub={`${totalConfirmed} paiement${totalConfirmed > 1 ? "s" : ""} confirmé${totalConfirmed > 1 ? "s" : ""}`}
                color="bg-green-50" />
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
                <Search size={14} className="text-muted-foreground shrink-0" />
                <input type="text" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                {search && <button onClick={() => setSearch("")} className="text-xs text-muted-foreground hover:text-foreground">Effacer</button>}
                <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{filtered.length} / {rows.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-secondary/50 border-b border-border">
                      {COLS.map(({ key, label, hide }) => (
                        <th key={key} onClick={() => handleSort(key)}
                          className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap select-none transition-colors ${hide ? "hidden lg:table-cell" : ""}`}>
                          <span className="inline-flex items-center gap-1">{label}<SortIcon k={key} /></span>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={COLS.length + 1} className="text-center py-20 text-muted-foreground text-sm">
                          <RefreshCw size={18} className="animate-spin mx-auto mb-2 opacity-40" />Chargement…
                        </td>
                      </tr>
                    )}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={COLS.length + 1} className="text-center py-20 text-muted-foreground text-sm">
                          {rows.length === 0 ? "Aucune inscription pour le moment." : "Aucun résultat."}
                        </td>
                      </tr>
                    )}
                    {!loading && filtered.map((r, i) => (
                      <tr key={r.id ?? i} className={`border-b border-border last:border-0 hover:bg-primary/5 transition-colors ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">#{r.id || i + 1}</td>
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{r.fullName || "—"}</td>
                        <td className="hidden lg:table-cell px-4 py-3 text-muted-foreground text-xs">{r.email || "—"}</td>
                        <td className="hidden lg:table-cell px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{r.phone || "—"}</td>
                        <td className="hidden lg:table-cell px-4 py-3 text-muted-foreground capitalize">{r.city || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${parcoursColor(r.parcours)}`}>{r.parcours || "—"}</span>
                        </td>
                        <td className="hidden lg:table-cell px-4 py-3 text-center">
                          <span className="inline-block rounded bg-secondary px-2 py-0.5 text-xs font-mono text-foreground">{r.tshirt || "—"}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{r.amount ? `${r.amount} MAD` : "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            r.paymentStatus === "Payé" ? "bg-green-100 text-green-700"
                            : r.paymentStatus === "Refusé" ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}>{r.paymentStatus || "En attente"}</span>
                        </td>
                        <td className="hidden lg:table-cell px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                          {r.date ? new Date(r.date).toLocaleString("fr-MA", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {r.paymentStatus === "En attente" ? (
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => updateStatus(r.id, "Payé")}
                                className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700 transition">
                                ✓ Confirmer
                              </button>
                              <button onClick={() => updateStatus(r.id, "Refusé")}
                                className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600 transition">
                                ✕ Refuser
                              </button>
                            </div>
                          ) : r.paymentStatus === "Payé" ? (
                            <button onClick={() => updateStatus(r.id, "En attente")}
                              className="text-xs text-muted-foreground hover:text-foreground underline transition">
                              Annuler
                            </button>
                          ) : (
                            <button onClick={() => updateStatus(r.id, "En attente")}
                              className="text-xs text-muted-foreground hover:text-foreground underline transition">
                              Remettre en attente
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length > 0 && (
                <div className="px-5 py-3 border-t border-border bg-secondary/20 text-xs text-muted-foreground">
                  {filtered.length} inscription{filtered.length > 1 ? "s" : ""}{search ? ` pour "${search}"` : " au total"}
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ ÉDITEUR DU SITE ════════════════════════════════════ */}
        {tab === "editor" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Éditeur du site</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Modifiez les textes et le logo — les changements sont appliqués en temps réel.</p>
            </div>

            {/* Toggle inscriptions */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-secondary/30 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Inscriptions</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Ouvrir ou fermer les inscriptions sur le site public</p>
                </div>
                <button
                  onClick={async () => {
                    const newVal = values.registration_open === "false" ? "true" : "false";
                    handleChange("registration_open", newVal);
                    try {
                      const API2 = (import.meta as any).env?.VITE_API_URL ?? "";
                      await fetch(`${API2}/api/settings`, {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ registration_open: newVal }),
                      });
                      invalidateSiteContent();
                      toast(newVal === "true" ? "Inscriptions ouvertes" : "Inscriptions fermées", newVal === "true" ? "success" : "error");
                    } catch { toast("Erreur lors de la mise à jour", "error"); }
                  }}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    values.registration_open !== "false" ? "bg-green-500" : "bg-red-400"
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    values.registration_open !== "false" ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
              <div className={`px-5 py-3 text-sm font-medium flex items-center gap-2 ${
                values.registration_open !== "false" ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
              }`}>
                <span className={`h-2 w-2 rounded-full ${values.registration_open !== "false" ? "bg-green-500" : "bg-red-500"}`} />
                {values.registration_open !== "false" ? "Les inscriptions sont ouvertes" : "Les inscriptions sont fermées"}
              </div>
            </div>

            {/* Logo */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-secondary/30">
                <p className="text-sm font-semibold text-foreground">Logo & Identité</p>
              </div>
              <div className="p-5 flex flex-col sm:flex-row items-start gap-6">
                <div className="h-24 w-40 rounded-xl border border-border bg-secondary/40 flex items-center justify-center overflow-hidden shrink-0">
                  {values.logo_url
                    ? <img src={values.logo_url} alt="Logo" className="h-full w-full object-contain p-2" />
                    : <Upload size={24} className="text-muted-foreground" />}
                </div>
                <div className="flex-1 space-y-3">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition disabled:opacity-60">
                    <Upload size={14} />
                    {uploading ? "Upload en cours…" : "Changer le logo"}
                  </button>
                  <p className="text-xs text-muted-foreground">PNG, JPG, SVG ou WEBP — max 2 Mo</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Nom du site" k="site_name" values={values} onChange={handleChange} />
                    <Field label="Sous-titre (ex: A.S.V.L.A)" k="site_tagline" values={values} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            <EditorSection title="Section Hero (page d'accueil)">
              <Field label="Badge" k="hero_badge" values={values} onChange={handleChange} />
              <Field label="Titre principal" k="hero_title" values={values} onChange={handleChange} />
              <div className="sm:col-span-2"><Field label="Sous-titre" k="hero_subtitle" values={values} onChange={handleChange} /></div>
              <div className="sm:col-span-2"><Field label="Description" k="hero_description" values={values} onChange={handleChange} /></div>
              <Field label="Bouton principal" k="hero_cta_primary" values={values} onChange={handleChange} />
              <Field label="Bouton secondaire" k="hero_cta_secondary" values={values} onChange={handleChange} />
            </EditorSection>

            <EditorSection title="Section À propos">
              <Field label="Label" k="about_label" values={values} onChange={handleChange} />
              <div className="sm:col-span-2"><Field label="Titre" k="about_title" values={values} onChange={handleChange} /></div>
              <div className="sm:col-span-2"><Field label="Paragraphe 1" k="about_text1" values={values} onChange={handleChange} /></div>
              <div className="sm:col-span-2"><Field label="Paragraphe 2" k="about_text2" values={values} onChange={handleChange} /></div>
              <Field label="Stat 1 — Valeur" k="stat1_value" values={values} onChange={handleChange} />
              <Field label="Stat 1 — Label" k="stat1_label" values={values} onChange={handleChange} />
              <Field label="Stat 2 — Valeur" k="stat2_value" values={values} onChange={handleChange} />
              <Field label="Stat 2 — Label" k="stat2_label" values={values} onChange={handleChange} />
              <Field label="Stat 3 — Valeur" k="stat3_value" values={values} onChange={handleChange} />
              <Field label="Stat 3 — Label" k="stat3_label" values={values} onChange={handleChange} />
              <Field label="Stat 4 — Valeur" k="stat4_value" values={values} onChange={handleChange} />
              <Field label="Stat 4 — Label" k="stat4_label" values={values} onChange={handleChange} />
            </EditorSection>

            <EditorSection title="Section Parcours">
              <Field label="Label" k="parcours_label" values={values} onChange={handleChange} />
              <Field label="Titre" k="parcours_title" values={values} onChange={handleChange} />
              <div className="sm:col-span-2"><Field label="Sous-titre" k="parcours_subtitle" values={values} onChange={handleChange} /></div>
              <Field label="Parcours 1 — Nom" k="p1_name" values={values} onChange={handleChange} />
              <Field label="Parcours 1 — Distance" k="p1_distance" values={values} onChange={handleChange} />
              <Field label="Parcours 1 — Niveau" k="p1_level" values={values} onChange={handleChange} />
              <Field label="Parcours 1 — Dénivelé" k="p1_elevation" values={values} onChange={handleChange} />
              <Field label="Parcours 1 — Temps" k="p1_time" values={values} onChange={handleChange} />
              <Field label="Parcours 1 — Prix (MAD)" k="p1_price" values={values} onChange={handleChange} />
              <Field label="Parcours 2 — Nom" k="p2_name" values={values} onChange={handleChange} />
              <Field label="Parcours 2 — Distance" k="p2_distance" values={values} onChange={handleChange} />
              <Field label="Parcours 2 — Niveau" k="p2_level" values={values} onChange={handleChange} />
              <Field label="Parcours 2 — Dénivelé" k="p2_elevation" values={values} onChange={handleChange} />
              <Field label="Parcours 2 — Temps" k="p2_time" values={values} onChange={handleChange} />
              <Field label="Parcours 2 — Prix (MAD)" k="p2_price" values={values} onChange={handleChange} />
            </EditorSection>

            <EditorSection title="Section Tafraout">
              <Field label="Label" k="tafraout_label" values={values} onChange={handleChange} />
              <Field label="Titre" k="tafraout_title" values={values} onChange={handleChange} />
              <div className="sm:col-span-2"><Field label="Description" k="tafraout_text" values={values} onChange={handleChange} /></div>
            </EditorSection>

            {/* Photos Tafraout */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-secondary/30">
                <p className="text-sm font-semibold text-foreground">Photos — Section Tafraout</p>
                <p className="text-xs text-muted-foreground mt-0.5">Les 3 cartes photos de la section Tafraout</p>
              </div>
              <div className="p-5 space-y-5">
                {([1, 2, 3] as const).map((n) => {
                  const fallbacks = [rocksImg, villageImg, almondsImg];
                  return (
                    <div key={n} className="flex items-start gap-4 rounded-xl border border-border p-4">
                      {/* Photo à gauche */}
                      <div className="shrink-0">
                        <ImageUploadField label={`Carte ${n}`} k={`tafraout_card${n}_img`} values={values} onChange={handleChange} toast={toast} fallback={fallbacks[n - 1]} />
                      </div>
                      {/* Champs à droite */}
                      <div className="flex-1 space-y-3 min-w-0">
                        <Field label="Titre" k={`tafraout_card${n}_title`} values={values} onChange={handleChange} />
                        <Field label="Description" k={`tafraout_card${n}_text`} values={values} onChange={handleChange} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Galerie photos */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-secondary/30 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Galerie photos</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Ajoutez autant de photos que vous voulez</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const count = parseInt(values.gallery_count || "4", 10);
                    handleChange("gallery_count", String(count + 1));
                    handleChange(`gallery_img${count}`, "");
                    handleChange(`gallery_label${count}`, "");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition">
                  + Ajouter une photo
                </button>
              </div>
              <div className="p-5 space-y-3">
                {Array.from({ length: Math.max(4, parseInt(values.gallery_count || "4", 10)) }, (_, i) => {
                  const galleryFallbacks: Record<number, string> = { 0: runnersImg, 1: rocksImg, 2: almondsImg, 3: villageImg };
                  return (
                    <div key={i} className="flex items-start gap-4 rounded-xl border border-border p-4">
                      {/* Photo à gauche */}
                      <div className="shrink-0">
                        <ImageUploadField
                          label={`Photo ${i + 1}`}
                          k={`gallery_img${i}`}
                          values={values}
                          onChange={handleChange}
                          toast={toast}
                          fallback={galleryFallbacks[i]}
                        />
                      </div>
                      {/* Champs à droite */}
                      <div className="flex-1 space-y-3 min-w-0">
                        <Field label="Légende" k={`gallery_label${i}`} values={values} onChange={handleChange} />
                        {i >= 4 && (
                          <button
                            type="button"
                            onClick={() => {
                              const count = parseInt(values.gallery_count || "4", 10);
                              // Décaler les photos suivantes
                              const newValues: Record<string, string> = {};
                              for (let j = i; j < count - 1; j++) {
                                newValues[`gallery_img${j}`]   = values[`gallery_img${j + 1}`]   || "";
                                newValues[`gallery_label${j}`] = values[`gallery_label${j + 1}`] || "";
                              }
                              newValues[`gallery_img${count - 1}`]   = "";
                              newValues[`gallery_label${count - 1}`] = "";
                              newValues.gallery_count = String(count - 1);
                              Object.entries(newValues).forEach(([k, v]) => handleChange(k, v));
                            }}
                            className="text-xs text-red-500 hover:underline">
                            Supprimer ce slot
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Parcours — détails */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-secondary/30">
                <p className="text-sm font-semibold text-foreground">Détails des parcours (modal "Voir détails")</p>
              </div>
              <div className="p-5 space-y-5">
                {([1, 2] as const).map((n) => (
                  <div key={n} className="rounded-xl border border-border p-4 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Parcours {n} — {values[`p${n}_name`] || `Trail ${n}`}
                    </p>
                    <Field label="Description" k={`p${n}_description`} values={values} onChange={handleChange} />
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Lieu de départ" k={`p${n}_start`} values={values} onChange={handleChange} />
                      <Field label="Date" k={`p${n}_date`} values={values} onChange={handleChange} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <EditorSection title="Contact & Réseaux sociaux">
              <Field label="Email" k="contact_email" values={values} onChange={handleChange} />
              <Field label="Téléphone" k="contact_phone" values={values} onChange={handleChange} />
              <Field label="Adresse" k="contact_address" values={values} onChange={handleChange} />
              <Field label="Lien Instagram" k="contact_instagram" values={values} onChange={handleChange} />
              <Field label="Lien Facebook" k="contact_facebook" values={values} onChange={handleChange} />
            </EditorSection>

            <EditorSection title="Footer">
              <div className="sm:col-span-2"><Field label="Description" k="footer_description" values={values} onChange={handleChange} /></div>
              <div className="sm:col-span-2"><Field label="Copyright" k="footer_copyright" values={values} onChange={handleChange} /></div>
            </EditorSection>

            <div className="flex justify-end pb-4">
              <button onClick={handleSave} disabled={saving}
                className={`inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${saved ? "bg-green-600" : "bg-primary hover:bg-primary/90"}`}>
                <Save size={15} />
                {saving ? "Sauvegarde…" : saved ? "Sauvegardé ✓" : "Sauvegarder les modifications"}
              </button>
            </div>
          </div>
        )}

        {/* ══ PARAMÈTRES ═════════════════════════════════════════ */}
        {tab === "settings" && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Paramètres du compte</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Modifiez vos identifiants de connexion à l'espace admin.</p>
            </div>

            {/* OTP verification step */}
            {otpStep ? (
              <form onSubmit={handleVerifyOtpAndSave} className="space-y-5">
                <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800 text-center">
                  Un code à 6 chiffres a été envoyé à votre email actuel.<br />
                  <strong>Il expire dans 10 minutes.</strong>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Code de vérification</label>
                  <input type="text" required autoFocus maxLength={6}
                    value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-2xl font-mono text-center tracking-[0.5em] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition" />
                </div>
                {otpError && <p className="text-sm text-red-500 font-medium text-center">{otpError}</p>}
                <button type="submit" disabled={verifyingOtp || otpCode.length < 6}
                  className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01] disabled:opacity-60">
                  {verifyingOtp ? "Vérification…" : "Confirmer le changement d'email"}
                </button>
                <button type="button" onClick={() => { setOtpStep(false); setOtpCode(""); setOtpError(""); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition">
                  ← Annuler
                </button>
              </form>
            ) : (
              <form onSubmit={handleSaveCreds} className="space-y-5">
                {/* Current password */}
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-border bg-secondary/30">
                    <p className="text-sm font-semibold text-foreground">Compte administrateur</p>
                  </div>
                  <div className="p-5">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Mot de passe actuel <span className="text-red-500">*</span>
                    </label>
                    <input type="password" required value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition" />
                  </div>
                </div>

                {/* Change email */}
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-border bg-secondary/30">
                    <p className="text-sm font-semibold text-foreground">Changer l'email</p>
                  </div>
                  <div className="p-5">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Nouvel email</label>
                    <input type="email" value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="nouveau@email.com"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition" />
                    <p className="mt-1.5 text-xs text-muted-foreground">Un code OTP sera envoyé à votre email actuel pour confirmer. Laissez vide pour ne pas changer.</p>
                  </div>
                </div>

                {/* Change password */}
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-border bg-secondary/30">
                    <p className="text-sm font-semibold text-foreground">Changer le mot de passe</p>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Nouveau mot de passe</label>
                      <input type="password" value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 caractères"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Confirmer le nouveau mot de passe</label>
                      <input type="password" value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 transition bg-background ${
                          confirmPassword && newPassword !== confirmPassword
                            ? "border-red-400 focus:ring-red-200"
                            : "border-input focus:border-primary focus:ring-primary/20"
                        }`} />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas.</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Laissez vide pour ne pas changer.</p>
                  </div>
                </div>

                <button type="submit" disabled={savingCreds}
                  className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:scale-[1.01] disabled:opacity-60">
                  {savingCreds ? "Sauvegarde…" : "Enregistrer les modifications"}
                </button>
              </form>
            )}
          </div>
        )}

      </main>
      </div>
    </div>
  );
}
