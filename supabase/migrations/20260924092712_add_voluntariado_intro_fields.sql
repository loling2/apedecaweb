/* Add CMS controls for the Voluntariado intro block without changing existing content. */
ALTER TABLE ape_convenio_categories
  ADD COLUMN IF NOT EXISTS intro_title text,
  ADD COLUMN IF NOT EXISTS intro_body text,
  ADD COLUMN IF NOT EXISTS intro_image_url text,
  ADD COLUMN IF NOT EXISTS intro_visible boolean NOT NULL DEFAULT true;

UPDATE ape_convenio_categories
SET
  intro_title = COALESCE(intro_title, 'Oficina del voluntariado'),
  intro_body = COALESCE(intro_body, 'A través del Cabildo de Tenerife y Sinpromi se gestiona esta oficina del voluntariado, en la que nuestra organización está dada de alta desde el 29 de julio de 2013, apoyando y beneficiándonos de la amplia red de voluntariado.'),
  intro_image_url = COALESCE(intro_image_url, '/images/voluntariado/image.png')
WHERE label = 'Voluntariado';