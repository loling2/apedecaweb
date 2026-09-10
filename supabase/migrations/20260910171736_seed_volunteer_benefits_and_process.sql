/*
# Seed volunteer benefits + process blocks on Voluntariado page (tablas ape_cms_)

1. Inserts volunteer-benefits block with five accreditation items.
2. Inserts volunteer-process block with three-step timeline.
*/

INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, sort_order, is_visible)
SELECT '2d5e8f7c-219b-4274-9059-35b5739a83d2',
       'volunteer-benefits',
       'Programa desarrollado conforme a la Ley 4/1998 de Voluntariado de Canarias.',
       '[{"icon":"building","title":"Acreditado por el Gobierno de Canarias","detail":"Decreto 13/2020"},{"icon":"award","title":"Integrado en Sistema de Calidad","detail":"ISO 9001:2015"},{"icon":"badge","title":"Certificado oficial","detail":"de participación"},{"icon":"shield","title":"Seguro de voluntariado","detail":"incluido"},{"icon":"graduation","title":"Formación certificada","detail":"y seguimiento profesional"}]',
       3,
       true
WHERE NOT EXISTS (
  SELECT 1 FROM public.ape_cms_blocks
  WHERE page_id = '2d5e8f7c-219b-4274-9059-35b5739a83d2'
    AND block_type = 'volunteer-benefits'
);

INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, sort_order, is_visible)
SELECT '2d5e8f7c-219b-4274-9059-35b5739a83d2',
       'volunteer-process',
       'Proceso de incorporación',
       '{"steps":[{"side":"left","tone":"blue","title":"Contacto y Orientación Inicial","points":["Entrevista personal informativa","Presentación de proyectos y servicios","Evaluación de disponibilidad y motivación","Información sobre compromiso y responsabilidades"]},{"side":"right","tone":"green","title":"Formación Certificada Obligatoria","points":["Formación inicial especializada (presencial/online)","Talleres específicos según área de interés","Conocimiento de protocolos y procedimientos","Certificación de competencias básicas"]},{"side":"left","tone":"blue","title":"Integración y Seguimiento Profesional","points":["Asignación según perfil, intereses y necesidades","Acompañamiento por voluntario/a experimentado","Seguimiento continuo por equipo profesional","Evaluación periódica y formación continua"]}],"closing":"Buscamos personas comprometidas que puedan dedicar tiempo de manera regular, con flexibilidad horaria adaptada a las necesidades del servicio y disponibilidad personal."}',
       4,
       true
WHERE NOT EXISTS (
  SELECT 1 FROM public.ape_cms_blocks
  WHERE page_id = '2d5e8f7c-219b-4274-9059-35b5739a83d2'
    AND block_type = 'volunteer-process'
);
