const sponsors = [
  "Partenaire officiel",
  "Logo sponsor",
  "Enseigne locale",
  "Partenaire média",
  "Logo sponsor",
  "Enseigne locale",
];

export function Sponsors() {
  return (
    <section className="py-20 bg-background border-y border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Sponsors & Partenaires
          </span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold">
            Ils soutiennent l'aventure.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {sponsors.map((s, i) => (
            <div
              key={i}
              className="aspect-[3/2] rounded-xl border border-dashed border-border bg-secondary/40 flex items-center justify-center px-3 text-center text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition"
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
