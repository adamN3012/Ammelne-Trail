import { useState } from "react";
import { TrendingUp, Clock, Mountain, Activity, ArrowRight, X, MapPin, Calendar } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

type ParcoursItem = {
  name: string; distance: string; level: string; elevation: string;
  time: string; price: string; featured?: boolean;
  description: string; start: string; date: string;
};

function ParcoursModal({ p, onClose, isOpen }: { p: ParcoursItem; onClose: () => void; isOpen: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-elevated p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition">
          <X size={16} />
        </button>

        <div className={`inline-block rounded-full px-3 py-1 text-xs font-semibold mb-4 ${p.featured ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
          {p.featured ? "Le plus populaire" : "Parcours découverte"}
        </div>

        <h2 className="font-display text-3xl font-semibold text-foreground">{p.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Niveau {p.level}</p>

        <div className="mt-4 font-display text-5xl font-semibold text-primary">{p.distance}</div>
        {isOpen && <div className="mt-1 text-xl font-semibold text-foreground">{p.price} MAD</div>}

        <p className="mt-5 text-muted-foreground leading-relaxed">{p.description}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { icon: TrendingUp, label: "Dénivelé",       val: p.elevation },
            { icon: Clock,      label: "Temps estimé",   val: p.time      },
            { icon: Mountain,   label: "Lieu",           val: "Anti-Atlas, Tafraout" },
            { icon: Activity,   label: "Services",       val: "Ravitaillements & sécurité" },
            { icon: MapPin,     label: "Départ",         val: p.start     },
            { icon: Calendar,   label: "Date",           val: p.date      },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="rounded-xl bg-secondary/50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Icon size={12} /> {label}
              </div>
              <div className="text-sm font-medium text-foreground">{val}</div>
            </div>
          ))}
        </div>

        {isOpen ? (
          <a href="#inscription" onClick={onClose}
            className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition">
            S'inscrire — {p.price} MAD <ArrowRight size={14} />
          </a>
        ) : (
          <div className="mt-8 w-full rounded-full bg-secondary px-5 py-3.5 text-sm font-medium text-muted-foreground text-center">
            Inscriptions fermées
          </div>
        )}
      </div>
    </div>
  );
}

export function Parcours() {
  const { c } = useSiteContent();
  const [selected, setSelected] = useState<ParcoursItem | null>(null);

  const isOpen = c("registration_open") !== "false";

  const parcours: ParcoursItem[] = [
    {
      name:        c("p1_name"),
      distance:    c("p1_distance"),
      level:       c("p1_level"),
      elevation:   c("p1_elevation"),
      time:        c("p1_time"),
      price:       c("p1_price"),
      description: c("p1_description"),
      start:       c("p1_start"),
      date:        c("p1_date"),
    },
    {
      name:        c("p2_name"),
      distance:    c("p2_distance"),
      level:       c("p2_level"),
      elevation:   c("p2_elevation"),
      time:        c("p2_time"),
      price:       c("p2_price"),
      description: c("p2_description"),
      start:       c("p2_start"),
      date:        c("p2_date"),
      featured:    true,
    },
  ];

  return (
    <>
      <section id="parcours" className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {c("parcours_label")}
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold text-balance">
              {c("parcours_title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{c("parcours_subtitle")}</p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {parcours.map((p) => (
              <article key={p.name}
                className={`relative rounded-3xl p-8 border transition-all hover:-translate-y-2 ${
                  p.featured
                    ? "bg-gradient-ocher text-primary-foreground border-transparent shadow-elevated"
                    : "bg-card border-border shadow-soft hover:shadow-elevated"
                }`}>
                {p.featured && (
                  <span className="absolute -top-3 left-8 rounded-full bg-stone-dark px-3 py-1 text-xs font-semibold text-background">
                    Le plus populaire
                  </span>
                )}
                <h3 className={`font-display text-2xl font-semibold ${p.featured ? "text-primary-foreground" : "text-foreground"}`}>
                  {p.name}
                </h3>
                <div className={`mt-1 text-sm ${p.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  Niveau {p.level}
                </div>
                <div className={`mt-6 font-display text-5xl font-semibold ${p.featured ? "text-primary-foreground" : "text-primary"}`}>
                  {p.distance}
                </div>
                {isOpen && <div className="mt-2 text-lg font-semibold">{p.price} MAD</div>}
                <ul className={`mt-6 space-y-3 text-sm ${p.featured ? "text-primary-foreground/90" : "text-foreground/80"}`}>
                  <li className="flex items-center gap-3"><TrendingUp size={16} /> Dénivelé {p.elevation}</li>
                  <li className="flex items-center gap-3"><Clock size={16} /> {p.time}</li>
                  <li className="flex items-center gap-3"><Mountain size={16} /> Anti-Atlas, Tafraout</li>
                  <li className="flex items-center gap-3"><Activity size={16} /> Ravitaillements & sécurité</li>
                </ul>
                <button
                  onClick={() => setSelected(p)}
                  className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                    p.featured
                      ? "bg-background text-primary hover:bg-background/90"
                      : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}>
                  Voir détails <ArrowRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selected && <ParcoursModal p={selected} onClose={() => setSelected(null)} isOpen={isOpen} />}
    </>
  );
}
