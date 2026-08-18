import hero from "@/assets/hero-tafraout.jpg";
import { ArrowRight, Mountain } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

export function Hero() {
  const { c } = useSiteContent();

  return (
    <section id="accueil" className="relative min-h-screen flex items-end overflow-hidden">
      <img
        src={hero}
        alt="Montagnes de Tafraout au coucher du soleil"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1280}
      />
      <div className="absolute inset-0 bg-gradient-hero" />

      <div className="relative container mx-auto px-4 md:px-8 pb-20 md:pb-32 pt-32">
        <div className="max-w-3xl fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-background/15 backdrop-blur-md border border-background/25 px-4 py-1.5 text-xs font-medium text-background mb-6">
            <Mountain size={14} />
            {c("hero_badge")}
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-background text-balance leading-[0.95]">
            {c("hero_title")}
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-background/90 font-display italic text-balance">
            {c("hero_subtitle")}
          </p>
          <p className="mt-4 max-w-xl text-base md:text-lg text-background/75 leading-relaxed">
            {c("hero_description")}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#inscription"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-elevated transition-all hover:scale-105"
            >
              {c("hero_cta_primary")}
              <ArrowRight size={16} />
            </a>
            <a
              href="#parcours"
              className="inline-flex items-center gap-2 rounded-full border border-background/40 bg-background/10 backdrop-blur-md px-7 py-3.5 text-sm font-semibold text-background transition-all hover:bg-background/20"
            >
              {c("hero_cta_secondary")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
