import rocksDefault  from "@/assets/tafraout-rocks.jpg";
import villageDefault from "@/assets/gallery-village.jpg";
import almondsDefault from "@/assets/gallery-almonds.jpg";
import { MapPin } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

const FALLBACK_IMGS = [rocksDefault, villageDefault, almondsDefault];
const highlights = ["Vallée d'Ameln","Rochers peints","Anti-Atlas","Villages amazighs","Palmeraies","Amandiers en fleurs"];

export function TafraoutSection() {
  const { c } = useSiteContent();

  const cards = [1, 2, 3].map((n, i) => ({
    img:   c(`tafraout_card${n}_img`) || FALLBACK_IMGS[i],
    title: c(`tafraout_card${n}_title`),
    text:  c(`tafraout_card${n}_text`),
  }));

  return (
    <section id="tafraout" className="py-24 md:py-32 bg-secondary/40">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary inline-flex items-center gap-2">
            <MapPin size={14} /> {c("tafraout_label")}
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold text-balance">
            {c("tafraout_title")}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            {c("tafraout_text")}
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <article key={i} className="group rounded-2xl overflow-hidden bg-card border border-border shadow-soft">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={card.img} alt={card.title} loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-semibold">{card.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{card.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {highlights.map((h) => (
            <span key={h} className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground/80">{h}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
