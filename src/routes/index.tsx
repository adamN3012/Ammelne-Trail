import { createFileRoute } from "@tanstack/react-router";
import { Header }          from "@/components/site/Header";
import { Hero }            from "@/components/site/Hero";
import { About }           from "@/components/site/About";
import { TafraoutSection } from "@/components/site/TafraoutSection";
import { Parcours }        from "@/components/site/Parcours";
import { Gallery }         from "@/components/site/Gallery";
import { RegistrationForm }from "@/components/site/RegistrationForm";
import { Sponsors }        from "@/components/site/Sponsors";
import { Contact }         from "@/components/site/Contact";
import { Footer }          from "@/components/site/Footer";
import { useSiteContent }  from "@/hooks/use-site-content";
import { Clock, Bell }     from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ammelne Trail — Marathon annuel de Tafraout, Maroc" },
      { name: "description", content: "Ammelne Trail : le marathon annuel au cœur des montagnes de Tafraout. Organisé par l'A.S.V.L.A dans l'Anti-Atlas marocain." },
      { property: "og:title", content: "Ammelne Trail — Marathon de Tafraout" },
      { property: "og:description", content: "Vivez une expérience sportive unique entre nature, culture et aventure dans la vallée de lumières Ammelne." },
    ],
  }),
  component: Index,
});

// ── Bannière "Inscriptions bientôt" ──────────────────────────
function ComingSoonBanner() {
  return (
    <section id="inscription" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Clock size={36} className="text-primary" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Inscriptions
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold text-balance">
            Bientôt disponible.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
            Les inscriptions pour la prochaine édition ouvriront très prochainement.
            Restez connectés !
          </p>
          <a href="#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-7 py-3.5 text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
            <Bell size={15} />
            Nous contacter pour plus d'infos
          </a>
        </div>
      </div>
    </section>
  );
}

function Index() {
  const { c, loading } = useSiteContent();
  const isOpen = !loading && c("registration_open") !== "false";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <About />
        <TafraoutSection />
        {/* Parcours — visible toujours mais sans prix/inscription si fermé */}
        {isOpen && <Parcours />}
        <Gallery />
        {/* Formulaire ou bannière selon le statut */}
        {isOpen ? <RegistrationForm /> : <ComingSoonBanner />}
        <Sponsors />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
