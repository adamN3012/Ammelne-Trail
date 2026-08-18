import { useState } from "react";
import { CheckCircle2, Clock, Copy, Building2 } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

type Step = "form" | "payment" | "done";

const PRICES: Record<string, number> = {
  "Trail 10 km": 150,
  "Trail 23 km": 200,
};

// ── RIB de l'association ──────────────────────────────────────
const RIB = {
  banque:      "Banque Populaire — Agence Tafraoute",
  titulaire:   "ASS SPORTIVE DE LA VALLEE DE L (A.S.V.L.A)",
  rib:         "101 765 2121102488720016 77",
  iban:        "MA64 1017 6521 2110 2488 7200 1677",
  swift:       "BCPOMAMC",
  agence:      "Agence Tafraoute — Centre de Tafraout, Maroc",
  tel:         "0528 800 108",
};

export function RegistrationForm() {
  const [step, setStep]       = useState<Step>("form");
  const [copied, setCopied]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [regId, setRegId]     = useState<number | null>(null);
  const { c } = useSiteContent();

  const isOpen = c("registration_open") !== "false";

  const [data, setData] = useState({
    fullName: "", email: "", phone: "",
    parcours: "Trail 10 km", tshirt: "M", city: "Tafraout", accept: false,
  });

  const amount = PRICES[data.parcours] ?? 150;

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.accept) return;
    setStep("payment");
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const API = (import.meta as any).env?.VITE_API_URL ?? "";
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName, email: data.email, phone: data.phone,
          city: data.city, parcours: data.parcours, tshirt: data.tshirt, amount,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erreur inscription");
      setRegId(json.id);
      setStep("done");
    } catch (err: any) {
      // Afficher l'erreur inline plutôt qu'un alert
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const copyRib = () => {
    navigator.clipboard.writeText(RIB.rib);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const input = "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition";
  const lbl   = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <section id="inscription" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Inscription
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold text-balance">
            Réservez votre dossard.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Inscription par virement bancaire — confirmation sous 48h.
          </p>
        </div>

        <div className="max-w-2xl mx-auto rounded-3xl bg-card border border-border shadow-elevated p-6 md:p-10">

          {/* Inscriptions fermées */}
          {!isOpen && (
            <div className="text-center py-10">
              <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground">Inscriptions fermées</h3>
              <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
                Les inscriptions pour cette édition sont actuellement fermées. Revenez bientôt ou contactez-nous pour plus d'informations.
              </p>
              <a href="#contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:scale-[1.01] transition">
                Nous contacter
              </a>
            </div>
          )}

          {/* Formulaire actif */}
          {isOpen && (<>
          <div className="flex items-center justify-center gap-3 mb-8">
            {["Informations", "Virement", "Confirmation"].map((stepLabel, i) => {
              const active = (step === "form" && i === 0) || (step === "payment" && i === 1) || (step === "done" && i === 2);
              const done   = (step === "payment" && i === 0) || (step === "done" && i <= 1);
              return (
                <div key={stepLabel} className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                    done ? "bg-accent text-accent-foreground" : active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {done ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                    {stepLabel}
                  </span>
                  {i < 2 && <div className="h-px w-6 sm:w-10 bg-border" />}
                </div>
              );
            })}
          </div>

          {/* ── Étape 1 : Informations ── */}
          {step === "form" && (
            <form onSubmit={submitForm} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={lbl}>Nom complet</label>
                  <input required className={input} value={data.fullName}
                    onChange={(e) => setData({ ...data, fullName: e.target.value })} placeholder="Votre nom" />
                </div>
                <div>
                  <label className={lbl}>Email</label>
                  <input required type="email" className={input} value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })} placeholder="vous@exemple.com" />
                </div>
                <div>
                  <label className={lbl}>Téléphone</label>
                  <input required type="tel" className={input} value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })} placeholder="+212 6 ..." />
                </div>
                <div>
                  <label className={lbl}>Choix du parcours</label>
                  <select className={input} value={data.parcours}
                    onChange={(e) => setData({ ...data, parcours: e.target.value })}>
                    {Object.keys(PRICES).map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Taille de t-shirt</label>
                  <select className={input} value={data.tshirt}
                    onChange={(e) => setData({ ...data, tshirt: e.target.value })}>
                    {["XS","S","M","L","XL","XXL"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm text-foreground/80 cursor-pointer">
                <input type="checkbox" required checked={data.accept}
                  onChange={(e) => setData({ ...data, accept: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary" />
                J'accepte le règlement de la course et certifie être en mesure de courir.
              </label>

              <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-5 py-4">
                <span className="text-sm text-muted-foreground">Montant à payer</span>
                <span className="font-display text-2xl font-semibold text-foreground">{amount} MAD</span>
              </div>

              <button type="submit"
                className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:scale-[1.01] hover:shadow-elevated">
                Continuer vers le virement
              </button>
            </form>
          )}

          {/* ── Étape 2 : Virement RIB ── */}
          {step === "payment" && (
            <form onSubmit={submitPayment} className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Building2 size={16} className="text-primary" />
                Effectuez votre virement bancaire
              </div>

              {/* Bloc RIB */}
              <div className="rounded-2xl border border-border bg-secondary/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Coordonnées bancaires</span>
                  <button type="button" onClick={copyRib}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                    <Copy size={12} />
                    {copied ? "Copié !" : "Copier le RIB"}
                  </button>
                </div>

                {[
                  ["Banque",     RIB.banque],
                  ["Titulaire",  RIB.titulaire],
                  ["RIB",        RIB.rib],
                  ["IBAN",       RIB.iban],
                  ["SWIFT",      RIB.swift],
                  ["Agence",     RIB.agence],
                  ["Tél.",       RIB.tel],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                    <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">{k}</span>
                    <span className="font-mono text-sm font-medium text-foreground break-all">{v}</span>
                  </div>
                ))}
              </div>

              {/* Montant */}
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Montant exact à virer</p>
                  <p className="font-display text-2xl font-semibold text-primary">{amount} MAD</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Référence à indiquer</p>
                  <p className="font-mono text-sm font-semibold text-foreground">{data.fullName.toUpperCase().slice(0,12)}-TRAIL</p>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                <Clock size={16} className="shrink-0 mt-0.5 text-amber-600" />
                <p>Après votre virement, cliquez sur <strong>"Confirmer mon inscription"</strong>. Votre dossard sera validé par l'équipe sous <strong>48h</strong> après réception du paiement.</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("form")}
                  className="flex-1 rounded-full border border-border py-4 text-sm font-semibold text-foreground hover:bg-secondary transition">
                  Retour
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-[2] rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:scale-[1.01] hover:shadow-elevated disabled:opacity-60">
                  {submitting ? "Enregistrement…" : "Confirmer mon inscription"}
                </button>
              </div>
            </form>
          )}

          {/* ── Étape 3 : Confirmation ── */}
          {step === "done" && (
            <div className="text-center py-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="text-amber-600" size={36} />
              </div>
              <h3 className="mt-6 font-display text-3xl font-semibold">Inscription enregistrée !</h3>
              <p className="mt-3 text-muted-foreground">
                Merci <strong className="text-foreground">{data.fullName}</strong>. Votre inscription est bien reçue.
              </p>

              {/* Récap */}
              <div className="mt-6 rounded-xl bg-secondary/60 px-6 py-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parcours</span>
                  <span className="font-medium">{data.parcours}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant à virer</span>
                  <span className="font-display font-semibold text-primary">{amount} MAD</span>
                </div>
                {regId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">N° dossier</span>
                    <span className="font-mono font-semibold">#{regId}</span>
                  </div>
                )}
              </div>

              {/* Statut en attente */}
              <div className="mt-5 flex items-center justify-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-5 py-2.5 text-sm text-amber-800 font-medium">
                <Clock size={14} className="text-amber-600" />
                En attente de confirmation du paiement
              </div>

              <p className="mt-4 text-xs text-muted-foreground max-w-sm mx-auto">
                Pensez à effectuer votre virement de <strong>{amount} MAD</strong> vers le RIB ci-dessus. Votre dossard sera confirmé sous 48h.
              </p>

              <button
                onClick={() => { setStep("form"); setData({ fullName:"", email:"", phone:"", parcours:"Trail 10 km", tshirt:"M", city:"Tafraout", accept:false }); setRegId(null); }}
                className="mt-8 text-sm font-semibold text-primary hover:underline">
                Inscrire une autre personne
              </button>
            </div>
          )}
          </>)}
        </div>
      </div>
    </section>
  );
}
