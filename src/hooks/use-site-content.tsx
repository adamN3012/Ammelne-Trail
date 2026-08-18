import { useEffect, useState } from "react";

export const DEFAULTS: Record<string, string> = {
  site_name:          "Ammelne Trail",
  site_tagline:       "A.S.V.L.A",
  logo_url:           "",
  registration_open:  "true",
  // Hero
  hero_badge:         "Édition 2026 — Anti-Atlas, Maroc",
  hero_title:         "Ammelne Trail",
  hero_subtitle:      "Le marathon annuel au cœur des montagnes de Tafraout",
  hero_description:   "Vivez une expérience sportive unique entre nature, culture et aventure dans la vallée de lumières Ammelne.",
  hero_cta_primary:   "S'inscrire maintenant",
  hero_cta_secondary: "Découvrir le parcours",
  // About
  about_label:        "À propos de l'événement",
  about_title:        "Un trail qui célèbre la montagne, le sport et la culture amazighe.",
  about_text1:        "Ammelne Trail est le marathon annuel organisé par l'A.S.V.L.A — Association Sportive de la Vallée de Lumières Ammelne. Notre mission : promouvoir le sport, la santé, le tourisme local et faire rayonner la magnifique région de Tafraout.",
  about_text2:        "L'événement accueille chaque année des coureurs amateurs comme professionnels venus du Maroc et du monde entier, pour une immersion totale dans les paysages spectaculaires de l'Anti-Atlas.",
  stat1_value:        "1500+",
  stat1_label:        "Coureurs attendus",
  stat2_value:        "2",
  stat2_label:        "Parcours au choix",
  stat3_value:        "100%",
  stat3_label:        "Nature & montagne",
  stat4_value:        "2e",
  stat4_label:        "Édition annuelle",
  // Parcours
  parcours_label:     "Nos parcours",
  parcours_title:     "Choisissez votre défi.",
  parcours_subtitle:  "Deux parcours adaptés à tous les niveaux — choisissez celui qui vous convient.",
  p1_name:            "Trail 10 km",
  p1_distance:        "10 km",
  p1_level:           "Découverte",
  p1_elevation:       "+350 m",
  p1_time:            "1h — 2h",
  p1_price:           "150",
  p1_description:     "Un parcours idéal pour découvrir les paysages de l'Anti-Atlas. Accessible à tous les coureurs, ce trail vous emmène à travers les sentiers traditionnels de la vallée d'Ameln.",
  p1_start:           "Place centrale de Tafraout",
  p1_date:            "À confirmer",
  p2_name:            "Trail 23 km",
  p2_distance:        "23 km",
  p2_level:           "Intermédiaire",
  p2_elevation:       "+900 m",
  p2_time:            "2.5h — 4h",
  p2_price:           "200",
  p2_description:     "Un défi sportif au cœur des montagnes de l'Anti-Atlas. Ce parcours intermédiaire offre des panoramas exceptionnels sur la vallée d'Ameln et les rochers peints.",
  p2_start:           "Place centrale de Tafraout",
  p2_date:            "À confirmer",
  // Tafraout
  tafraout_label:     "Tafraout & ses alentours",
  tafraout_title:     "Une terre de montagnes, de lumière et de silence.",
  tafraout_text:      "Située dans l'Anti-Atlas marocain, Tafraout est célèbre pour ses montagnes rocheuses ocre, ses paysages naturels intacts, ses villages amazighs traditionnels, ses palmiers et ses amandiers.",
  tafraout_card1_img:   "",
  tafraout_card1_title: "Les rochers peints",
  tafraout_card1_text:  "L'œuvre célèbre du Belge Jean Vérame.",
  tafraout_card2_img:   "",
  tafraout_card2_title: "Vallée d'Ameln",
  tafraout_card2_text:  "Villages traditionnels nichés au pied des falaises.",
  tafraout_card3_img:   "",
  tafraout_card3_title: "Amandiers en fleurs",
  tafraout_card3_text:  "Le festival du printemps à Tafraout.",
  // Gallery
  gallery_img0:   "", gallery_label0: "Photo de l'événement",
  gallery_img1:   "", gallery_label1: "Paysage de Tafraout",
  gallery_img2:   "", gallery_label2: "Affiche officielle",
  gallery_img3:   "", gallery_label3: "Sponsor / Enseigne",
  gallery_img4:   "", gallery_label4: "",
  gallery_img5:   "", gallery_label5: "",
  gallery_count:  "4", // nombre total de slots
  // Contact
  contact_email:      "contact@ammelnetrail.ma",
  contact_phone:      "+212 6 00 00 00 00",
  contact_address:    "Tafraout, Anti-Atlas, Maroc",
  contact_instagram:  "#",
  contact_facebook:   "#",
  // Footer
  footer_description: "Association Sportive de la Vallée de Lumières Ammelne. Le marathon annuel de Tafraout, au cœur de l'Anti-Atlas marocain.",
  footer_copyright:   "© 2026 Ammelne Trail — Association Sportive de la Vallée de Lumières Ammelne. Tous droits réservés.",
};

type SiteContent = Record<string, string>;
let _cache: SiteContent | null = null;
let _promise: Promise<SiteContent> | null = null;

async function fetchSettings(): Promise<SiteContent> {
  if (_cache) return _cache;
  if (_promise) return _promise;
  _promise = (async () => {
    try {
      const API = (import.meta as any).env?.VITE_API_URL ?? "";
      const res = await fetch(`${API}/api/settings`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      _cache = { ...DEFAULTS, ...data };
      return _cache;
    } catch {
      _cache = { ...DEFAULTS };
      return _cache;
    }
  })();
  return _promise;
}

export function invalidateSiteContent() {
  _cache   = null;
  _promise = null;
}

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings().then((data) => {
      setContent(data);
      setLoading(false);
    });
  }, []);

  const c = (key: string) => content[key] ?? DEFAULTS[key] ?? "";
  return { content, c, loading };
}
