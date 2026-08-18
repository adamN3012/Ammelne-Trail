import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logoDefault from "@/assets/logo.png";
import { useSiteContent } from "@/hooks/use-site-content";

const links = [
  { href: "#accueil",    label: "Accueil"     },
  { href: "#about",      label: "À propos"    },
  { href: "#tafraout",   label: "Tafraout"    },
  { href: "#parcours",   label: "Parcours"    },
  { href: "#inscription",label: "Inscription" },
  { href: "#galerie",    label: "Galerie"     },
  { href: "#contact",    label: "Contact"     },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const { c } = useSiteContent();

  const logoSrc = c("logo_url") || logoDefault;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/85 backdrop-blur-md border-b border-border shadow-soft" : "bg-transparent"
    }`}>
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
        <a href="#accueil" className="flex items-center gap-2">
          <img src={logoSrc} alt={c("site_name")} className="h-12 w-auto object-contain max-w-[120px]" />
          <span className={`font-display text-lg font-semibold tracking-tight ${scrolled ? "text-foreground" : "text-background"}`}>
            {c("site_name")}
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <a key={l.href} href={l.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${scrolled ? "text-foreground/80" : "text-background/90"}`}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#inscription"
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:scale-105 hover:shadow-elevated">
            S'inscrire
          </a>
          <button onClick={() => setOpen(!open)}
            className={`lg:hidden p-2 rounded-md ${scrolled ? "text-foreground" : "text-background"}`}
            aria-label="Menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-background border-t border-border">
          <nav className="container mx-auto flex flex-col px-4 py-4 gap-1">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-md text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
