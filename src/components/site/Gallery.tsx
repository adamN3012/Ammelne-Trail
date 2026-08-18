import runners from "@/assets/gallery-runners.jpg";
import village  from "@/assets/gallery-village.jpg";
import almonds  from "@/assets/gallery-almonds.jpg";
import rocks    from "@/assets/tafraout-rocks.jpg";
import { useSiteContent } from "@/hooks/use-site-content";

const FALLBACKS: Record<number, string> = { 0: runners, 1: rocks, 2: almonds, 3: village };

export function Gallery() {
  const { c } = useSiteContent();

  const count = Math.max(4, parseInt(c("gallery_count") || "4", 10));

  const items = Array.from({ length: count }, (_, i) => {
    const img   = c(`gallery_img${i}`) || FALLBACKS[i] || null;
    const label = c(`gallery_label${i}`);
    return { img, label };
  }).filter((it) => it.img);

  const gridClass = (i: number, total: number) => {
    if (i === 0) return "md:col-span-2 md:row-span-2";
    if (i === total - 1 && total % 2 === 0) return "md:col-span-2";
    return "";
  };

  return (
    <section id="galerie" className="py-24 md:py-32 bg-secondary/40">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Galerie</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold text-balance">
            Souvenirs et instants forts.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
          {items.map((it, i) => (
            <figure key={i} className={`relative group overflow-hidden rounded-2xl shadow-soft ${gridClass(i, items.length)}`}>
              <img src={it.img!} alt={it.label} loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-dark/80 via-transparent to-transparent" />
              {it.label && (
                <figcaption className="absolute bottom-3 left-4 text-sm font-medium text-background">
                  {it.label}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
