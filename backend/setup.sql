-- Crée la base de données et les tables
-- Lance ce fichier une seule fois dans phpMyAdmin ou MySQL CLI

CREATE DATABASE IF NOT EXISTS ammelne_trail
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ammelne_trail;

-- ── Inscriptions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inscriptions (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name      VARCHAR(120)   NOT NULL,
  email          VARCHAR(180)   NOT NULL,
  phone          VARCHAR(30)    DEFAULT '',
  city           VARCHAR(80)    DEFAULT '',
  parcours       VARCHAR(60)    NOT NULL,
  tshirt         VARCHAR(5)     DEFAULT 'M',
  amount         DECIMAL(8,2)   NOT NULL,
  payment_status VARCHAR(20)    NOT NULL DEFAULT 'Payé',
  payment_ref    VARCHAR(60)    NOT NULL,
  created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_parcours (parcours),
  INDEX idx_created  (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Contenu du site (CMS) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  `key`       VARCHAR(100) PRIMARY KEY,
  `value`     TEXT         NOT NULL,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Valeurs par défaut
INSERT INTO site_settings (`key`, `value`) VALUES
-- Général
('site_name',           'Ammelne Trail'),
('site_tagline',        'A.S.V.L.A'),
('logo_url',            ''),
-- Hero
('hero_badge',          'Édition 2026 — Anti-Atlas, Maroc'),
('hero_title',          'Ammelne Trail'),
('hero_subtitle',       'Le marathon annuel au cœur des montagnes de Tafraout'),
('hero_description',    'Vivez une expérience sportive unique entre nature, culture et aventure dans la vallée de lumières Ammelne.'),
('hero_cta_primary',    'S\'inscrire maintenant'),
('hero_cta_secondary',  'Découvrir le parcours'),
-- About
('about_label',         'À propos de l\'événement'),
('about_title',         'Un trail qui célèbre la montagne, le sport et la culture amazighe.'),
('about_text1',         'Ammelne Trail est le marathon annuel organisé par l\'A.S.V.L.A — Association Sportive de la Vallée de Lumières Ammelne. Notre mission : promouvoir le sport, la santé, le tourisme local et faire rayonner la magnifique région de Tafraout.'),
('about_text2',         'L\'événement accueille chaque année des coureurs amateurs comme professionnels venus du Maroc et du monde entier, pour une immersion totale dans les paysages spectaculaires de l\'Anti-Atlas.'),
('stat1_value',         '1500+'),
('stat1_label',         'Coureurs attendus'),
('stat2_value',         '2'),
('stat2_label',         'Parcours au choix'),
('stat3_value',         '100%'),
('stat3_label',         'Nature & montagne'),
('stat4_value',         '2e'),
('stat4_label',         'Édition annuelle'),
-- Parcours
('parcours_label',      'Nos parcours'),
('parcours_title',      'Choisissez votre défi.'),
('parcours_subtitle',   'Deux parcours adaptés à tous les niveaux — choisissez celui qui vous convient.'),
('p1_name',             'Trail 10 km'),
('p1_distance',         '10 km'),
('p1_level',            'Découverte'),
('p1_elevation',        '+350 m'),
('p1_time',             '1h — 2h'),
('p1_price',            '150'),
('p2_name',             'Trail 23 km'),
('p2_distance',         '23 km'),
('p2_level',            'Intermédiaire'),
('p2_elevation',        '+900 m'),
('p2_time',             '2.5h — 4h'),
('p2_price',            '200'),
-- Tafraout
('tafraout_label',      'Tafraout & ses alentours'),
('tafraout_title',      'Une terre de montagnes, de lumière et de silence.'),
('tafraout_text',       'Située dans l\'Anti-Atlas marocain, Tafraout est célèbre pour ses montagnes rocheuses ocre, ses paysages naturels intacts, ses villages amazighs traditionnels, ses palmiers et ses amandiers. Un lieu de calme et de beauté, parfait pour le trail, la randonnée et le tourisme nature.'),
-- Contact
('contact_email',       'contact@ammelnetrail.ma'),
('contact_phone',       '+212 6 00 00 00 00'),
('contact_address',     'Tafraout, Anti-Atlas, Maroc'),
('contact_instagram',   '#'),
('contact_facebook',    '#'),
-- Footer
('footer_description',  'Association Sportive de la Vallée de Lumières Ammelne. Le marathon annuel de Tafraout, au cœur de l\'Anti-Atlas marocain.'),
('footer_copyright',    '© 2026 Ammelne Trail — Association Sportive de la Vallée de Lumières Ammelne. Tous droits réservés.')
ON DUPLICATE KEY UPDATE `key` = `key`;
