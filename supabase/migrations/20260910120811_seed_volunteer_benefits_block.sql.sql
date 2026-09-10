/*
# Seed volunteer benefits block on Voluntariado page

1. Inserts one cms_blocks row of type 'volunteer-benefits' on the
   voluntariado page. The body holds a JSON array of benefit items
   (icon + title + detail) and the title field holds the legal note
   that appears below the benefits row.
2. No security changes — cms_blocks already has RLS + public read / auth write.
*/

INSERT INTO cms_blocks (page_id, block_type, title, body, sort_order, is_visible)
SELECT 'b6d0447b-c80c-48d6-947d-c2bc4de0602d',
       'volunteer-benefits',
       'El voluntariado es una actividad de interés social y no laboral. Esta colaboración no genera vinculo laboral ni profesional entre el voluntario/a y la entidad ni da derecho a indemnización o compensación económica alguna.',
       '[{"icon":"building","title":"Seguro de voluntariado","detail":"Cobertura ante cualquier incidente"},{"icon":"award","title":"Certificado","detail":"De tus horas como voluntario/a"},{"icon":"badge","title":"Formación","detail":"Capacitación continua y gratuita"},{"icon":"shield","title":"Apoyo","detail":"Acompañamiento del equipo técnico"},{"icon":"graduation","title":"Experiencia","detail":"Desarrollo personal y profesional"}]',
       3,
       true
WHERE NOT EXISTS (
  SELECT 1 FROM cms_blocks
  WHERE page_id = 'b6d0447b-c80c-48d6-947d-c2bc4de0602d'
    AND block_type = 'volunteer-benefits'
);