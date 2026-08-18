import logoDefault from "@/assets/logo.png";
import { Instagram, Facebook, Mail } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

export function Footer() {
  const { c } = useSiteContent();
  const logoSrc = c("logo_url") || logoDefault;

  return (
    <footer className="bg-stone-dark text-background">
      <div className="container mx-auto px-4 md:px-8 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt={c("site_name")} className="h-16 w-auto object-contain max-w-[160px] brightness-0 invert" />
            <div>
              <div className="font-display text-xl font-semibold">{c("site_name")}</div>
              <div className="text-xs text-background/60">{c("site_tagline")}</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-background/70 max-w-sm leading-relaxed">
            {c("footer_description")}
          </p>
          <div className="mt-6 flex gap-3">
            <a href={c("contact_instagram")} className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition">
              <Instagram size={16} />
            </a>
            <a href={c("contact_facebook")} className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition">
              <Facebook size={16} />
            </a>
            <a href={`mailto:${c("contact_email")}`} className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition">
              <Mail size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-background mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm text-background/70">
            {[["#accueil","Accueil"],["#about","À propos"],["#tafraout","Tafraout"],["#parcours","Parcours"]].map(([href,label]) => (
              <li key={href}><a href={href} className="hover:text-primary">{label}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-background mb-4">Inscription</h4>
          <ul className="space-y-2 text-sm text-background/70">
            {[["#inscription","S'inscrire"],["#galerie","Galerie"],["#contact","Contact"],["#","Règlement"]].map(([href,label]) => (
              <li key={href}><a href={href} className="hover:text-primary">{label}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 md:px-8 py-6 text-center text-xs text-background/60">
          {c("footer_copyright")}
        </div>
      </div>
    </footer>
  );
}
