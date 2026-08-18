import { Mail, Phone, MapPin, Instagram, Facebook, Send } from "lucide-react";
import { useState } from "react";
import { useSiteContent } from "@/hooks/use-site-content";

export function Contact() {
  const [sent, setSent] = useState(false);
  const { c } = useSiteContent();

  const input = "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition";

  return (
    <section id="contact" className="py-24 md:py-32 bg-secondary/40">
      <div className="container mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Contact</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold text-balance">
            Une question ? Écrivez-nous.
          </h2>
          <p className="mt-4 text-muted-foreground">Notre équipe vous répond dans les plus brefs délais.</p>

          <ul className="mt-10 space-y-5">
            <li className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center"><Mail size={18} /></div>
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <a href={`mailto:${c("contact_email")}`} className="font-medium hover:text-primary">{c("contact_email")}</a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center"><Phone size={18} /></div>
              <div>
                <div className="text-xs text-muted-foreground">Téléphone</div>
                <a href={`tel:${c("contact_phone")}`} className="font-medium hover:text-primary">{c("contact_phone")}</a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center"><MapPin size={18} /></div>
              <div>
                <div className="text-xs text-muted-foreground">Localisation</div>
                <div className="font-medium">{c("contact_address")}</div>
              </div>
            </li>
          </ul>

          <div className="mt-8 flex gap-3">
            <a href={c("contact_instagram")} className="h-11 w-11 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition">
              <Instagram size={18} />
            </a>
            <a href={c("contact_facebook")} className="h-11 w-11 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition">
              <Facebook size={18} />
            </a>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="rounded-3xl bg-card border border-border shadow-soft p-6 md:p-8 space-y-5 self-start">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nom</label>
            <input required className={input} placeholder="Votre nom" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input required type="email" className={input} placeholder="vous@exemple.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Message</label>
            <textarea required rows={5} className={input + " resize-none"} placeholder="Votre message..." />
          </div>
          <button type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:scale-[1.01] hover:shadow-elevated transition">
            {sent ? "Message envoyé ✓" : <><span>Envoyer</span><Send size={14} /></>}
          </button>
        </form>
      </div>
    </section>
  );
}
