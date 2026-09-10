/*
# Sembrar proyectos, bloques de páginas y contenido faltante

1. Proyectos activos y archivados en ape_projects
2. Bloques para la página "proyectos" (project-links + areas + accordion)
3. Bloques para "quienes-somos" (text + stats + list + accordion)
4. Bloque para "transparencia" (text introductorio)
5. Bloques para "convenios" (text + list)
*/

-- ===== PROYECTOS =====
INSERT INTO public.ape_projects (title, description, image_url, year, status, sort_order, is_visible)
VALUES
  ('Empodera-Actívate III', 'Programa de talleres terapéuticos integrales de salud y bienestar para personas mayores.', 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200', 2025, 'active', 0, true),
  ('¡Intégrate en positivo!', 'Talleres de salud y bienestar para adultos con diversidad funcional.', 'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=1200', 2025, 'active', 1, true),
  ('Del huerto a la mesa', 'Proyecto para favorecer la alimentación sana y el contacto con la naturaleza.', 'https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg?auto=compress&cs=tinysrgb&w=1200', 2024, 'archived', 0, true),
  ('PFAE-GJ Domicilia Sociosanitario', 'Formación en alternancia con el empleo en atención sociosanitaria a personas dependientes.', 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=1200', 2023, 'archived', 1, true),
  ('Barrios por el Empleo: Juntos más fuertes', 'Proyecto de inserción laboral en barrios vulnerables, reconocido en 2020.', 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200', 2020, 'archived', 2, true)
ON CONFLICT DO NOTHING;

-- ===== BLOQUES PÁGINA PROYECTOS =====
INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, sort_order, is_visible)
VALUES
  ('e8550899-a3fd-4c60-856a-2099c8609334', 'project-links', 'Proyectos', NULL, 0, true),
  ('e8550899-a3fd-4c60-856a-2099c8609334', 'areas', 'Áreas de Actuación',
  '[{"label":"ÁREA 1: Atención Psicosocial","title":"Atención Psicosocial","points":["Intervención psicológica individual y grupal","Apoyo emocional a familias","Acompañamiento en procesos de duelo","Talleres de habilidades sociales"]},{"label":"ÁREA 2: Integración y Ocio Inclusivo","title":"Integración y Ocio Inclusivo","points":["Actividades de ocio adaptado","Excursiones y eventos inclusivos","Talleres creativos y culturales","Deporte adaptado"]},{"label":"ÁREA 3: Inserción Laboral y Formación","title":"Inserción Laboral y Formación","points":["Programas de inserción laboral","Formación profesional especializada","Creación de empleo para personas dependientes","Convenios con empresas e instituciones"]}]',
  1, true),
  ('e8550899-a3fd-4c60-856a-2099c8609334', 'accordion', 'Reconocimientos y Acreditaciones',
  '[{"title":"Registros y Inscripciones","points":["Inscrita en el Registro de Asociaciones de Canarias (G1/S1/19139-13/TF)","Entidad colaboradora del Gobierno de Canarias (TFE 08 1052)","Registro de Entidades Colaboradoras del SCE (GRS2016CA00001)"]},{"title":"Certificaciones de Calidad","points":["Sistema de Gestión de Calidad ISO 9001:2015","Evaluación de transparencia: Sobresaliente (10/10) en 2022"]},{"title":"Menciones y Reconocimientos","points":["Declarada de Interés Público Municipal por Santa Cruz de Tenerife","Reconocida como entidad de referencia en el ámbito de la dependencia","Reconocimiento por el compromiso de Barrios por el Empleo: Juntos más fuertes en 2020"]}]',
  2, true)
ON CONFLICT DO NOTHING;

-- ===== BLOQUES PÁGINA QUIÉNES SOMOS =====
INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, image_url, sort_order, is_visible)
VALUES
  ('5a07599e-00a3-43ef-9565-23b2febe0e71', 'text', 'Nuestra Historia',
  'APEDECA fue creada oficialmente el 21 de septiembre de 2012 e inscrita en el Registro de Asociaciones de Canarias con el número G1/S1/19139-13/TF el 10 de abril de 2013.

Durante más de 12 años, hemos evolucionado desde una iniciativa local hasta convertirnos en una entidad de ámbito autonómico de referencia en el archipiélago canario.

Nuestro domicilio social se encuentra en Santa Cruz de Tenerife, aunque nuestra acción se extiende por múltiples islas del archipiélago.',
  'https://images.pexels.com/photos/18429306/pexels-photo-18429306.jpeg?auto=compress&cs=tinysrgb&w=1200', 0, true),
  ('5a07599e-00a3-43ef-9565-23b2febe0e71', 'stats', 'Nuestra trayectoria',
  '+12 años acompañando
7 islas conectadas
100% compromiso social', NULL, 1, true),
  ('5a07599e-00a3-43ef-9565-23b2febe0e71', 'list', 'Misión, Visión y Valores',
  'Misión: Mejorar la calidad de vida de las personas con dependencia y sus familias en Canarias, promoviendo su autonomía, integración social y bienestar integral.

Visión: Ser la entidad de referencia en el archipiélago canario en la atención y defensa de los derechos de las personas con dependencia, reconocida por la calidad e innovación de nuestros servicios.

Valores: Compromiso social, transparencia, cercanía, profesionalidad, inclusión y respeto a la diversidad.', NULL, 2, true),
  ('5a07599e-00a3-43ef-9565-23b2febe0e71', 'accordion', 'Reconocimientos y Acreditaciones',
  '[{"title":"Registros y Inscripciones","points":["Registro de Asociaciones de Canarias: G1/S1/19139-13/TF","Entidad colaboradora del Gobierno de Canarias: TFE 08 1052","Registro del SCE: GRS2016CA00001"]},{"title":"Certificaciones de Calidad","points":["Sistema de Gestión de Calidad ISO 9001:2015","Evaluación de transparencia: Sobresaliente (10/10) en 2022"]},{"title":"Menciones y Reconocimientos","points":["Declarada de Interés Público Municipal por Santa Cruz de Tenerife","Reconocida como entidad de referencia en el ámbito de la dependencia","Reconocimiento por Barrios por el Empleo: Juntos más fuertes (2020)"]}]',
  NULL, 3, true),
  ('5a07599e-00a3-43ef-9565-23b2febe0e71', 'contact', NULL, NULL, NULL, 4, true)
ON CONFLICT DO NOTHING;

-- ===== BLOQUE PÁGINA TRANSPARENCIA =====
INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, sort_order, is_visible)
VALUES
  ('ce6eb72f-0f13-4878-b7f2-d4ff500e1567', 'text', 'Compromiso con la transparencia',
  'En APEDECA entendemos la transparencia como un pilar fundamental de nuestra gestión. Publicamos y actualizamos de forma periódica toda la información relevante sobre nuestra actividad, estructura, financiación y resultados.

Cumplimos con la Ley Canaria de Transparencia y hemos obtenido la máxima calificación (Sobresaliente 10/10) en la evaluación del Índice de Transparencia de Canarias.',
  0, true)
ON CONFLICT DO NOTHING;

-- ===== BLOQUES PÁGINA CONVENIOS =====
INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, sort_order, is_visible)
VALUES
  ('3709aae9-382d-4c11-976d-9192254c1118', 'text', 'Colaboraciones que transforman',
  'A lo largo de nuestra trayectoria, APEDECA ha establecido convenios y colaboraciones con instituciones públicas, empresas y entidades sociales para impulsar proyectos que mejoren la vida de las personas con dependencia en Canarias.

Estas alianzas nos permiten ampliar nuestro alcance, compartir recursos y generar oportunidades reales de integración, formación y empleo para el colectivo al que acompañamos.',
  0, true)
ON CONFLICT DO NOTHING;
