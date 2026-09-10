/*
# Seed editable volunteer process timeline

Adds the three-step volunteer journey and its commitment note to the
Voluntariado page. The front end renders these entries as alternating
cards around a central timeline.
*/

INSERT INTO cms_blocks (page_id, block_type, title, body, sort_order, is_visible)
SELECT 'b6d0447b-c80c-48d6-947d-c2bc4de0602d',
       'volunteer-process',
       'Proceso de incorporación',
       '{"steps":[{"side":"left","tone":"blue","title":"Contacto y Orientación Inicial","points":["Entrevista personal informativa","Presentación de proyectos y servicios","Evaluación de disponibilidad y motivación","Información sobre compromiso y responsabilidades"]},{"side":"right","tone":"green","title":"Formación Certificada Obligatoria","points":["Formación inicial especializada (presencial/online)","Talleres específicos según área de interés","Conocimiento de protocolos y procedimientos","Certificación de competencias básicas"]},{"side":"left","tone":"blue","title":"Integración y Seguimiento Profesional","points":["Asignación según perfil, intereses y necesidades","Acompañamiento por voluntario/a experimentado","Seguimiento continuo por equipo profesional","Evaluación periódica y formación continua"]}],"closing":"Buscamos personas comprometidas que puedan dedicar tiempo de manera regular, con flexibilidad horaria adaptada a las necesidades del servicio y disponibilidad personal."}',
       4,
       true
WHERE NOT EXISTS (
  SELECT 1 FROM cms_blocks
  WHERE page_id = 'b6d0447b-c80c-48d6-947d-c2bc4de0602d'
    AND block_type = 'volunteer-process'
);