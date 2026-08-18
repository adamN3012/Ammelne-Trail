import { Heart, Users, Trophy, Leaf } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

export function About() {
  const { c } = useSiteContent();

  const stats = [
    { icon: Users,  value: c("stat1_value"), label: c("stat1_label") },
    { icon: Trophy, value: c("stat2_value"), label: c("stat2_label") },
    { icon: Leaf,   value: c("stat3_value"), label: c("stat3_label") },
    { icon: Heart,  value: c("stat4_value"), label: c("stat4_label") },
  ];

  return (
    <section id="about" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {c("about_label")}
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold text-balance">
            {c("about_title")}
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>{c("about_text1")}</p>
            <p>{c("about_text2")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-card border border-border p-6 shadow-soft transition-all hover:shadow-elevated hover:-translate-y-1"
            >
              <s.icon className="text-primary" size={28} />
              <div className="mt-4 font-display text-3xl md:text-4xl font-semibold text-foreground">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
