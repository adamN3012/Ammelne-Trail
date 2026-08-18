import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import fs from "fs";
import path from "path";

// ── CSV ───────────────────────────────────────────────────────
const CSV = path.join(process.cwd(), "registrations.csv");
const HEADERS = ["id","date","fullName","email","phone","city","parcours","tshirt","amount","paymentStatus","paymentRef"];

function csvParseLine(line: string): string[] {
  const out: string[] = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (q && line[i+1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (c === ',' && !q) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

function readCsv(): Record<string, string>[] {
  if (!fs.existsSync(CSV)) return [];
  const lines = fs.readFileSync(CSV, "utf8").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = csvParseLine(lines[0]);
  return lines.slice(1).map((line, i) => {
    const vals = csvParseLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, j) => obj[h] = vals[j] ?? "");
    if (!obj.id)            obj.id            = String(i + 1);
    if (!obj.paymentStatus) obj.paymentStatus = "Payé";
    return obj;
  });
}

function appendCsv(row: Record<string, string | number>) {
  const line = HEADERS.map(k => `"${String(row[k] ?? "").replace(/"/g, '""')}"`).join(",");
  if (!fs.existsSync(CSV)) fs.writeFileSync(CSV, HEADERS.join(",") + "\n" + line + "\n", "utf8");
  else                      fs.appendFileSync(CSV, line + "\n", "utf8");
}

// ── Excel export ──────────────────────────────────────────────
async function buildExcel(): Promise<Buffer> {
  const ExcelJS = (await import("exceljs")).default ?? await import("exceljs");
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Inscriptions");

  ws.columns = [
    { header: "ID",                 key: "id",            width: 6  },
    { header: "Nom complet",        key: "fullName",      width: 26 },
    { header: "Email",              key: "email",         width: 32 },
    { header: "Téléphone",          key: "phone",         width: 18 },
    { header: "Ville",              key: "city",          width: 18 },
    { header: "Parcours",           key: "parcours",      width: 20 },
    { header: "T-shirt",            key: "tshirt",        width: 10 },
    { header: "Montant (MAD)",      key: "amount",        width: 14 },
    { header: "Statut",             key: "paymentStatus", width: 12 },
    { header: "Réf. paiement",      key: "paymentRef",    width: 22 },
    { header: "Date d'inscription", key: "date",          width: 22 },
  ];

  const B = { style: "thin" as const, color: { argb: "FFB0C4DE" } };
  const border = (r: any) => r.eachCell({ includeEmpty: true }, (c: any) => {
    c.border = { top: B, left: B, bottom: B, right: B };
  });

  const hdr = ws.getRow(1);
  hdr.font      = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  hdr.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
  hdr.alignment = { vertical: "middle", horizontal: "center" };
  hdr.height    = 24;
  border(hdr);
  hdr.commit();
  ws.views = [{ state: "frozen", ySplit: 1 }];

  readCsv().forEach((r, i) => {
    const row = ws.addRow(r);
    row.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 ? "FFE8F0FE" : "FFFFFFFF" } };
    row.height    = 20;
    row.alignment = { vertical: "middle" };
    if (r.paymentStatus === "Payé") row.getCell("paymentStatus").font = { color: { argb: "FF15803D" }, bold: true };
    border(row);
    row.commit();
  });

  return Buffer.from(await wb.xlsx.writeBuffer());
}

// ── OTP email ─────────────────────────────────────────────────
async function sendOtpEmail(to: string, otp: string) {
  const gmailUser = getEnv("GMAIL_USER");
  const gmailPass = getEnv("GMAIL_APP_PASSWORD");
  if (!gmailUser || !gmailPass) {
    console.warn("⚠️  Email non configuré — OTP:", otp);
    return;
  }
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    host: "smtp.gmail.com", port: 465, secure: true,
    auth: { user: gmailUser, pass: gmailPass },
  });
  await transporter.sendMail({
    from:    `"Ammelne Trail Admin" <${gmailUser}>`,
    to,
    subject: `🔐 Code de vérification : ${otp}`,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#1D4ED8;padding:20px;text-align:center">
          <h2 style="color:#fff;margin:0;font-size:18px">Ammelne Trail — Connexion Admin</h2>
        </div>
        <div style="padding:32px;text-align:center">
          <p style="color:#6b7280;font-size:14px;margin-bottom:16px">Votre code de vérification :</p>
          <div style="background:#f3f4f6;border-radius:12px;padding:20px;display:inline-block">
            <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1D4ED8;font-family:monospace">${otp}</span>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin-top:16px">Ce code expire dans <strong>10 minutes</strong>.<br/>Ne le partagez avec personne.</p>
        </div>
      </div>
    `,
  });
}

// ── Email notifications ───────────────────────────────────────
// Lire le .env manuellement car process.env n'est pas dispo dans ce contexte
function getEnv(key: string): string {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return "";
    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [k, ...rest] = trimmed.split("=");
      if (k.trim() === key) return rest.join("=").trim();
    }
  } catch {}
  return "";
}
async function sendRegistrationEmail(data: {
  id: number; fullName: string; email: string; phone: string;
  parcours: string; tshirt: string; amount: number;
}) {
  const gmailUser = getEnv("GMAIL_USER");
  const gmailPass = getEnv("GMAIL_APP_PASSWORD");
  if (!gmailUser || !gmailPass) {
    console.warn("⚠️  Email non configuré — GMAIL_USER:", gmailUser || "VIDE", "| GMAIL_APP_PASSWORD:", gmailPass ? "OK" : "VIDE");
    return;
  }
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
    });
    await transporter.sendMail({
      from:    `"Ammelne Trail" <${gmailUser}>`,
      to:      gmailUser,
      subject: `🏃 Nouvelle inscription #${data.id} — ${data.fullName}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:#1D4ED8;padding:24px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:20px">Ammelne Trail — Nouvelle inscription</h1>
          </div>
          <div style="padding:24px;background:#fff">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px">N° dossier</td><td style="padding:8px 0;font-weight:600">#${data.id}</td></tr>
              <tr style="background:#f9fafb"><td style="padding:8px 4px;color:#6b7280">Nom complet</td><td style="padding:8px 4px;font-weight:600">${data.fullName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0">${data.email}</td></tr>
              <tr style="background:#f9fafb"><td style="padding:8px 4px;color:#6b7280">Téléphone</td><td style="padding:8px 4px">${data.phone}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Parcours</td><td style="padding:8px 0;font-weight:600">${data.parcours}</td></tr>
              <tr style="background:#f9fafb"><td style="padding:8px 4px;color:#6b7280">T-shirt</td><td style="padding:8px 4px">${data.tshirt}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Montant</td><td style="padding:8px 0;font-weight:600;color:#1D4ED8">${data.amount} MAD</td></tr>
              <tr style="background:#fef9c3"><td style="padding:8px 4px;color:#92400e">Statut</td><td style="padding:8px 4px;font-weight:600;color:#92400e">⏳ En attente de paiement</td></tr>
            </table>
            <div style="margin-top:20px;padding:12px;background:#fef3c7;border-radius:8px;font-size:13px;color:#92400e">
              Connectez-vous à l'espace admin pour confirmer le paiement après réception du virement.
            </div>
          </div>
          <div style="padding:16px;background:#f9fafb;text-align:center;font-size:12px;color:#9ca3af">
            Ammelne Trail — A.S.V.L.A · Tafraout, Maroc
          </div>
        </div>
      `,
    });
    console.log(`📧 Email envoyé à ${gmailUser} pour l'inscription #${data.id}`);
  } catch (err: any) {
    console.error("❌ Erreur envoi email :", err?.message ?? err);
  }
}

// ── JSON helper ───────────────────────────────────────────────
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

// ── TanStack SSR boilerplate ──────────────────────────────────
type Entry = { fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response> | Response };
let _entry: Promise<Entry> | undefined;
const getEntry = () => (_entry ??= import("@tanstack/react-start/server-entry").then(
  (m) => (m as any).default ?? m
));

const errPage = () => new Response(renderErrorPage(), {
  status: 500, headers: { "content-type": "text/html; charset=utf-8" },
});

async function ssrFallback(req: Request, env: unknown, ctx: unknown): Promise<Response> {
  try {
    const res = await (await getEntry()).fetch(req, env, ctx);
    if (res.status < 500) return res;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return res;
    const body = await res.clone().text();
    let p: any;
    try { p = JSON.parse(body); } catch { return res; }
    if (p?.unhandled && p?.message === "HTTPError") {
      console.error(consumeLastCapturedError() ?? new Error(`SSR error: ${body}`));
      return errPage();
    }
    return res;
  } catch (e) { console.error(e); return errPage(); }
}

// ── Main handler ──────────────────────────────────────────────
export default {
  async fetch(req: Request, env: unknown, ctx: unknown) {
    const { pathname } = new URL(req.url);

    // GET /api/test-email — teste l'envoi d'email (debug)
    if (pathname === "/api/test-email" && req.method === "GET") {
      const gmailUser = getEnv("GMAIL_USER");
      const gmailPass = getEnv("GMAIL_APP_PASSWORD");
      if (!gmailUser || !gmailPass) {
        return json({ error: "Credentials manquants", GMAIL_USER: gmailUser || "VIDE", GMAIL_APP_PASSWORD: gmailPass ? "OK" : "VIDE" }, 500);
      }
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          host: "smtp.gmail.com", port: 465, secure: true,
          auth: { user: gmailUser, pass: gmailPass },
        });
        await transporter.verify();
        await transporter.sendMail({
          from: `"Ammelne Trail" <${gmailUser}>`,
          to: gmailUser,
          subject: "✅ Test email — Ammelne Trail",
          text: "Si tu reçois cet email, la configuration fonctionne correctement.",
        });
        return json({ success: true, message: `Email envoyé à ${gmailUser}` });
      } catch (err: any) {
        return json({ error: err?.message ?? String(err), code: err?.code }, 500);
      }
    }

    // POST /api/admin/verify-credentials — vérifie email + mot de passe (login direct)
    if (pathname === "/api/admin/verify-credentials" && req.method === "POST") {
      try {
        const { email, password } = await req.json() as any;
        const SETTINGS_PATH = path.join(process.cwd(), "site_settings.json");
        const settings = fs.existsSync(SETTINGS_PATH)
          ? JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8")) : {};

        const adminEmail    = settings.admin_email    || "asvla2900@gmail.com";
        const adminPassword = settings.admin_password || "trail2024";

        if (!email || !password) return json({ error: "Champs manquants" }, 400);
        if (email.trim().toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword)
          return json({ error: "Email ou mot de passe incorrect" }, 401);

        return json({ success: true });
      } catch (e: any) {
        return json({ error: "Erreur serveur" }, 500);
      }
    }

    // POST /api/admin/request-otp — envoie un code OTP par email
    if (pathname === "/api/admin/request-otp" && req.method === "POST") {
      try {
        const { email, password } = await req.json() as any;
        const SETTINGS_PATH = path.join(process.cwd(), "site_settings.json");
        const settings = fs.existsSync(SETTINGS_PATH)
          ? JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8")) : {};

        const adminEmail    = settings.admin_email    || "asvla2900@gmail.com";
        const adminPassword = settings.admin_password || "trail2024";

        if (!email || !password) return json({ error: "Champs manquants" }, 400);
        if (email.trim().toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword)
          return json({ error: "Email ou mot de passe incorrect" }, 401);

        // Générer un code OTP à 6 chiffres
        const otp     = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Stocker le OTP dans les settings
        settings._otp         = otp;
        settings._otp_expires = expires.toString();
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf8");

        // Envoyer le code par email
        await sendOtpEmail(adminEmail, otp);
        console.log(`🔐 OTP envoyé à ${adminEmail} : ${otp}`);

        return json({ success: true, message: "Code envoyé par email" });
      } catch (e: any) {
        console.error(e);
        return json({ error: "Erreur serveur" }, 500);
      }
    }

    // POST /api/admin/verify-otp — vérifie le code OTP
    if (pathname === "/api/admin/verify-otp" && req.method === "POST") {
      try {
        const { otp } = await req.json() as any;
        const SETTINGS_PATH = path.join(process.cwd(), "site_settings.json");
        const settings = fs.existsSync(SETTINGS_PATH)
          ? JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8")) : {};

        if (!otp) return json({ error: "Code manquant" }, 400);
        if (!settings._otp) return json({ error: "Aucun code en attente" }, 400);
        if (Date.now() > parseInt(settings._otp_expires || "0"))
          return json({ error: "Code expiré — demandez un nouveau code" }, 401);
        if (otp.trim() !== settings._otp)
          return json({ error: "Code incorrect" }, 401);

        // Invalider le OTP après usage
        delete settings._otp;
        delete settings._otp_expires;
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf8");

        return json({ success: true });
      } catch (e: any) {
        return json({ error: "Erreur serveur" }, 500);
      }
    }

    // POST /api/register
    if (pathname === "/api/register" && req.method === "POST") {
      try {
        // Vérifier si les inscriptions sont ouvertes
        const SETTINGS_PATH = path.join(process.cwd(), "site_settings.json");
        const settings = fs.existsSync(SETTINGS_PATH)
          ? JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8")) : {};
        if (settings.registration_open === "false") {
          return json({ error: "Les inscriptions sont actuellement fermées." }, 403);
        }
        const { fullName, email, phone, city, parcours, tshirt, amount } = await req.json() as any;
        if (!fullName || !email || !parcours || !amount) return json({ error: "Champs manquants" }, 400);

        const id  = readCsv().length + 1;
        const ref = `TRAIL-${Date.now()}`;

        appendCsv({ id, date: new Date().toISOString(), fullName, email,
          phone: phone || "", city: city || "", parcours,
          tshirt: tshirt || "", amount: Number(amount),
          paymentStatus: "En attente", paymentRef: ref });

        console.log(`📋 Inscription #${id} — ${fullName} (${parcours}) — En attente de paiement`);

        // Envoyer email de notification à l'admin
        sendRegistrationEmail({ id, fullName, email, phone: phone || "", parcours, tshirt: tshirt || "", amount: Number(amount) });

        return json({ success: true, id, paymentRef: ref });
      } catch { return json({ error: "Payload invalide" }, 400); }
    }

    // PATCH /api/registrations/:id/status — confirme ou refuse un paiement (admin)
    if (pathname.startsWith("/api/registrations/") && pathname.endsWith("/status") && req.method === "PATCH") {
      try {
        const idStr = pathname.split("/")[3];
        const id    = parseInt(idStr, 10);
        const { status } = await req.json() as any;
        if (!id || !["Payé","Refusé","En attente"].includes(status))
          return json({ error: "Paramètres invalides" }, 400);

        if (!fs.existsSync(CSV)) return json({ error: "Aucune inscription" }, 404);

        const content = fs.readFileSync(CSV, "utf8");
        const lines   = content.split(/\r?\n/);
        const headers = csvParseLine(lines[0]);
        const statusIdx = headers.indexOf("paymentStatus");
        const idIdx     = headers.indexOf("id");

        let found = false;
        const updated = lines.map((line, i) => {
          if (i === 0 || !line.trim()) return line;
          const vals = csvParseLine(line);
          if (parseInt(vals[idIdx] ?? "", 10) === id) {
            found = true;
            vals[statusIdx] = status;
            return vals.map(v => `"${v.replace(/"/g, '""')}"`).join(",");
          }
          return line;
        });

        if (!found) return json({ error: "Inscription introuvable" }, 404);
        fs.writeFileSync(CSV, updated.join("\n"), "utf8");
        console.log(`✅ Inscription #${id} — statut mis à jour : ${status}`);
        return json({ success: true, id, status });
      } catch (e) { console.error(e); return json({ error: "Erreur mise à jour" }, 500); }
    }

    // POST /api/upload — logo en base64 stocké dans les settings
    if (pathname === "/api/upload" && req.method === "POST") {
      try {
        const formData = await req.formData();
        const file = formData.get("logo") as File | null;
        if (!file) return json({ error: "Fichier manquant" }, 400);

        const allowed = ["image/png","image/jpeg","image/webp","image/svg+xml"];
        if (!allowed.includes(file.type)) return json({ error: "Format non autorisé (PNG, JPG, WEBP, SVG)" }, 400);
        if (file.size > 2 * 1024 * 1024) return json({ error: "Fichier trop lourd (max 2 Mo)" }, 400);

        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const dataUrl = `data:${file.type};base64,${base64}`;

        const SETTINGS_PATH = path.join(process.cwd(), "site_settings.json");
        const existing = fs.existsSync(SETTINGS_PATH)
          ? JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8")) : {};
        existing.logo_url = dataUrl;
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(existing, null, 2), "utf8");

        return json({ success: true, url: dataUrl });
      } catch (e) { console.error(e); return json({ error: "Erreur upload" }, 500); }
    }

    // GET /api/settings — retourne les settings depuis le CSV settings
    if (pathname === "/api/settings" && req.method === "GET") {
      try {
        const SETTINGS_PATH = path.join(process.cwd(), "site_settings.json");
        if (!fs.existsSync(SETTINGS_PATH)) return json({});
        const data = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
        return json(data);
      } catch { return json({}); }
    }

    // POST /api/settings — sauvegarde les settings
    if (pathname === "/api/settings" && req.method === "POST") {
      try {
        const SETTINGS_PATH = path.join(process.cwd(), "site_settings.json");
        const existing = fs.existsSync(SETTINGS_PATH)
          ? JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8")) : {};
        const updates = await req.json() as Record<string, string>;
        const merged  = { ...existing, ...updates };
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2), "utf8");
        return json({ success: true, updated: Object.keys(updates).length });
      } catch { return json({ error: "Erreur sauvegarde" }, 500); }
    }

    // GET /api/registrations
    if (pathname === "/api/registrations" && req.method === "GET") {
      try { return json(readCsv()); }
      catch { return json({ error: "Erreur lecture" }, 500); }
    }

    // GET /api/export
    if (pathname === "/api/export" && req.method === "GET") {
      try {
        const buf  = await buildExcel();
        const name = `inscriptions-${new Date().toISOString().slice(0,10)}.xlsx`;
        return new Response(buf, { headers: {
          "content-type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "content-disposition": `attachment; filename="${name}"`,
          "content-length":      String(buf.length),
        }});
      } catch (e) { console.error(e); return json({ error: "Erreur export" }, 500); }
    }

    return ssrFallback(req, env, ctx);
  },
};
