/*
# Add intro fields to convenio categories

1. Modified Tables
- `ape_convenio_categories`: adds 4 nullable columns to support an optional highlighted intro block above the entry list.
  - intro_title (text, nullable) — heading for the intro section
  - intro_body (text, nullable) — body text for the intro section
  - intro_image_url (text, nullable) — optional image shown beside the intro
  - intro_visible (boolean, default false) — whether the intro block is shown on the public page

2. Seed Data
- Updates the "Voluntariado" category with the current hardcoded intro content so it appears exactly as before, now editable from the CMS.

3. Security
- No new tables. Existing RLS policies already cover UPDATE on this table for anon + authenticated.
*/

ALTER TABLE ape_convenio_categories
  ADD COLUMN IF NOT EXISTS intro_title text,
  ADD COLUMN IF NOT EXISTS intro_body text,
  ADD COLUMN IF NOT EXISTS intro_image_url text,
  ADD COLUMN IF NOT EXISTS intro_visible boolean NOT NULL DEFAULT false;

UPDATE ape_convenio_categories
SET intro_title = 'Oficina del voluntariado',
    intro_body = 'A través del Cabildo de Tenerife y Sinpromi se gestiona esta oficina del voluntariado, en la que nuestra organización está dada de alta desde el 29 de julio de 2013, apoyando y beneficiándonos de la amplia red de voluntariado.',
    intro_visible = true
WHERE label = 'Voluntariado';
