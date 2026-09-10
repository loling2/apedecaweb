/*
# Tablas de Transparencia con prefijo ape_cms_

1. Nuevas tablas
- `ape_cms_transparency_sections`: apartados de la pestaña Transparencia
- `ape_cms_transparency_items`: líneas/acordeones dentro de cada sección
- `ape_cms_transparency_docs`: documentos PDF asociados a cada item

2. Seguridad
- RLS activada en todas las tablas
- Lectura pública (anon, authenticated), escritura solo autenticados

3. Datos iniciales
- Inserta todas las secciones, items y documentos de transparencia
*/

CREATE TABLE IF NOT EXISTS public.ape_cms_transparency_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  icon_name text NOT NULL DEFAULT 'FileText',
  tone text NOT NULL DEFAULT 'blue',
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  meta text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ape_cms_transparency_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_ape_transparency_sections" ON public.ape_cms_transparency_sections;
CREATE POLICY "public_read_ape_transparency_sections" ON public.ape_cms_transparency_sections FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_ape_transparency_sections" ON public.ape_cms_transparency_sections;
CREATE POLICY "auth_insert_ape_transparency_sections" ON public.ape_cms_transparency_sections FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_ape_transparency_sections" ON public.ape_cms_transparency_sections;
CREATE POLICY "auth_update_ape_transparency_sections" ON public.ape_cms_transparency_sections FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_ape_transparency_sections" ON public.ape_cms_transparency_sections;
CREATE POLICY "auth_delete_ape_transparency_sections" ON public.ape_cms_transparency_sections FOR DELETE
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.ape_cms_transparency_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.ape_cms_transparency_sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  download_label text,
  file_path text,
  sort_order int NOT NULL DEFAULT 0,
  is_open_by_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ape_cms_transparency_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_ape_transparency_items" ON public.ape_cms_transparency_items;
CREATE POLICY "public_read_ape_transparency_items" ON public.ape_cms_transparency_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_ape_transparency_items" ON public.ape_cms_transparency_items;
CREATE POLICY "auth_insert_ape_transparency_items" ON public.ape_cms_transparency_items FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_ape_transparency_items" ON public.ape_cms_transparency_items;
CREATE POLICY "auth_update_ape_transparency_items" ON public.ape_cms_transparency_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_ape_transparency_items" ON public.ape_cms_transparency_items;
CREATE POLICY "auth_delete_ape_transparency_items" ON public.ape_cms_transparency_items FOR DELETE
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.ape_cms_transparency_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.ape_cms_transparency_items(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_path text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ape_cms_transparency_docs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_ape_transparency_docs" ON public.ape_cms_transparency_docs;
CREATE POLICY "public_read_ape_transparency_docs" ON public.ape_cms_transparency_docs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_ape_transparency_docs" ON public.ape_cms_transparency_docs;
CREATE POLICY "auth_insert_ape_transparency_docs" ON public.ape_cms_transparency_docs FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_ape_transparency_docs" ON public.ape_cms_transparency_docs;
CREATE POLICY "auth_update_ape_transparency_docs" ON public.ape_cms_transparency_docs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_ape_transparency_docs" ON public.ape_cms_transparency_docs;
CREATE POLICY "auth_delete_ape_transparency_docs" ON public.ape_cms_transparency_docs FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_ape_transparency_items_section ON public.ape_cms_transparency_items(section_id);
CREATE INDEX IF NOT EXISTS idx_ape_transparency_docs_item ON public.ape_cms_transparency_docs(item_id);

-- ==================== DATOS INICIALES ====================
INSERT INTO public.ape_cms_transparency_sections (label, icon_name, tone, sort_order, meta) VALUES
  ('Información Institucional', 'FileText', 'blue', 0, 'Actualizado 13/11/2025'),
  ('Organizativa', 'UsersRound', 'lime', 1, 'Actualizado 13/11/2025'),
  ('Ayudas y Subvenciones', 'ClipboardCheck', 'blue', 2, 'Actualizado 21/11/2025'),
  ('Memorias Anuales', 'Download', 'lime', 3, NULL),
  ('Económico y Financiera', 'Briefcase', 'blue', 4, NULL),
  ('Gestión de calidad', 'Check', 'lime', 5, 'Actualizado 17/11/2025'),
  ('Evaluación de transparencia', 'Eye', 'blue', 6, NULL),
  ('Contratos', 'Handshake', 'blue', 7, 'Actualizado 21/11/2025'),
  ('Convenios y Encomiendas de gestión', 'GraduationCap', 'lime', 8, 'Actualizado 21/11/2025')
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Información General (revisado 13/11/2025)', 0, false, 'Descargar información institucional'
FROM public.ape_cms_transparency_sections WHERE label = 'Información Institucional'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Información relativa a las funciones que desarrolla la entidad (revisado 13/11/2025)', 1, false, 'Descargar información institucional'
FROM public.ape_cms_transparency_sections WHERE label = 'Información Institucional'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Normativa aplicable a la entidad (revisado 13/11/2025)', 2, false, 'Descargar información institucional'
FROM public.ape_cms_transparency_sections WHERE label = 'Información Institucional'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Estatutos de la entidad 2024', 3, true, 'Descargar estatutos'
FROM public.ape_cms_transparency_sections WHERE label = 'Información Institucional'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Estructura orgánica (revisado 13/11/2025)', 0, false, 'Descargar información organizativa'
FROM public.ape_cms_transparency_sections WHERE label = 'Organizativa'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Perfil y trayectoria de los profesionales de los diferentes órganos de gobierno, dirección de administración de la entidad (revisado 13/11/2025)', 1, false, 'Descargar información organizativa'
FROM public.ape_cms_transparency_sections WHERE label = 'Organizativa'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, body, sort_order, is_open_by_default, download_label)
SELECT id, 'Retribuciones del órgano de representación (revisado 13/11/2025)',
'La Junta Directiva de la Asociación de Ayuda a Personas con Dependencia en Canarias (APEDECA) compuesta por un presidente, una secretaria, un tesorero y dos vocales, ejerce sus funciones de manera voluntaria y sin percepción económica alguna por razón de su cargo, limitándose a la gestión y representación de la entidad conforme a los fines establecidos.',
2, true, 'Descargar información organizativa'
FROM public.ape_cms_transparency_sections WHERE label = 'Organizativa'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, body, sort_order, is_open_by_default)
SELECT id, 'Contratos con la administración pública',
'La entidad APEDECA no cuenta actualmente con ningún tipo de contrato (mayores o menores) con la administración pública.',
0, true
FROM public.ape_cms_transparency_sections WHERE label = 'Contratos'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Convenio 2023', 0, false, 'Descargar documentos - Convenio 2023'
FROM public.ape_cms_transparency_sections WHERE label = 'Convenios y Encomiendas de gestión'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Convenio 2024', 1, false, 'Descargar documentos - Convenio 2024'
FROM public.ape_cms_transparency_sections WHERE label = 'Convenios y Encomiendas de gestión'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Convenio 2025', 2, true, 'Descargar documentos - Convenio 2025'
FROM public.ape_cms_transparency_sections WHERE label = 'Convenios y Encomiendas de gestión'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Relación de ayudas y subvenciones en el ejercicio 2019', 0, false, 'Descargar documento - Ayudas y subvenciones de la administración pública 2019'
FROM public.ape_cms_transparency_sections WHERE label = 'Ayudas y Subvenciones'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Relación de ayudas y subvenciones en el ejercicio 2020', 1, false, 'Descargar documento - Ayudas y subvenciones de la administración pública 2020'
FROM public.ape_cms_transparency_sections WHERE label = 'Ayudas y Subvenciones'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Relación de ayudas y subvenciones en el ejercicio 2021', 2, false, 'Descargar documento - Ayudas y subvenciones de la administración pública 2021'
FROM public.ape_cms_transparency_sections WHERE label = 'Ayudas y Subvenciones'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Relación de ayudas y subvenciones en el ejercicio 2022', 3, false, 'Descargar documento - Ayudas y subvenciones de la administración pública 2022'
FROM public.ape_cms_transparency_sections WHERE label = 'Ayudas y Subvenciones'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Relación de ayudas y subvenciones en el ejercicio 2023', 4, false, 'Descargar documento - Ayudas y subvenciones de la administración pública 2023'
FROM public.ape_cms_transparency_sections WHERE label = 'Ayudas y Subvenciones'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Relación de ayudas y subvenciones en el ejercicio 2024', 5, false, 'Descargar documento - Ayudas y subvenciones de la administración pública 2024'
FROM public.ape_cms_transparency_sections WHERE label = 'Ayudas y Subvenciones'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Relación de ayudas y subvenciones en el ejercicio 2025', 6, true, 'Descargar documento - Ayudas y subvenciones de la administración pública 2025'
FROM public.ape_cms_transparency_sections WHERE label = 'Ayudas y Subvenciones'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default)
SELECT id, 'Gestión de calidad', 0, false
FROM public.ape_cms_transparency_sections WHERE label = 'Gestión de calidad'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, body, sort_order, is_open_by_default)
SELECT id, 'Buen Gobierno y Transparencia',
'APEDECA incorpora la gestión de calidad como eje principal de su funcionamiento institucional. En este marco, APEDECA adopta compromisos de mejora continua, transparencia e integridad en base a un Sistema de Gestión de la Calidad que rige el funcionamiento general de la entidad y mediante el cual se determinarán los instrumentos, mecanismos, herramientas y reglas que coordinan esta y que se relacionan con los diferentes grupos de interés.

Este Sistema incluye pilares como la Transparencia y Acceso a la Información y la Guía de Buen Gobierno, en donde se recoge la Política Anticorrupción y el Código Ético y de Conducta por el cual se rigen todas las actuaciones de la entidad. Estos documentos, junto a la Política de Calidad, son instrumentos fundamentales para garantizar una administración responsable, ética y coherente con los principios que sustentan su misión social.',
1, true
FROM public.ape_cms_transparency_sections WHERE label = 'Gestión de calidad'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_docs (item_id, title, file_path, sort_order)
SELECT id, 'Protocolo Transparencia y Acceso a la información', '', 0
FROM public.ape_cms_transparency_items WHERE title = 'Buen Gobierno y Transparencia'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_docs (item_id, title, file_path, sort_order)
SELECT id, 'Guía de Buen Gobierno APEDECA', '', 1
FROM public.ape_cms_transparency_items WHERE title = 'Buen Gobierno y Transparencia'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Ley Canaria de Transparencia', 0, false, 'Descargar - Ley Canaria de Transparencia'
FROM public.ape_cms_transparency_sections WHERE label = 'Evaluación de transparencia'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Evaluación 2020', 1, false, 'Descargar - Evaluación de transparencia 2020'
FROM public.ape_cms_transparency_sections WHERE label = 'Evaluación de transparencia'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Evaluación 2021', 2, false, 'Descargar - Evaluación de transparencia 2021'
FROM public.ape_cms_transparency_sections WHERE label = 'Evaluación de transparencia'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, body, sort_order, is_open_by_default, download_label)
SELECT id, 'Evaluación 2022',
'En este tercer año de evaluación del Nivel de Transparencia, el resultado de este análisis correspondiente a 2022 ha sido de Sobresaliente. La entidad ha obtenido una nota de 10 sobre 10 en la evaluación del IT de Canarias superando los resultados del año anterior. Seguimos poniendo en valor nuestro compromiso con la mejora continua.',
3, true, 'Descargar - Evaluación de transparencia 2022'
FROM public.ape_cms_transparency_sections WHERE label = 'Evaluación de transparencia'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Memoria 2024', 0, false, 'Descargar memoria 2024'
FROM public.ape_cms_transparency_sections WHERE label = 'Memorias Anuales'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Memoria 2023', 1, false, 'Descargar memoria 2023'
FROM public.ape_cms_transparency_sections WHERE label = 'Memorias Anuales'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Memoria 2022', 2, false, 'Descargar memoria 2022'
FROM public.ape_cms_transparency_sections WHERE label = 'Memorias Anuales'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Memoria 2021', 3, false, 'Descargar memoria 2021'
FROM public.ape_cms_transparency_sections WHERE label = 'Memorias Anuales'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Memoria 2020', 4, false, 'Descargar memoria 2020'
FROM public.ape_cms_transparency_sections WHERE label = 'Memorias Anuales'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Memoria 2019', 5, false, 'Descargar memoria 2019'
FROM public.ape_cms_transparency_sections WHERE label = 'Memorias Anuales'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Memoria 2018', 6, false, 'Descargar memoria 2018'
FROM public.ape_cms_transparency_sections WHERE label = 'Memorias Anuales'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Memoria 2017', 7, false, 'Descargar memoria 2017'
FROM public.ape_cms_transparency_sections WHERE label = 'Memorias Anuales'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_transparency_items (section_id, title, sort_order, is_open_by_default, download_label)
SELECT id, 'Memoria 2016', 8, false, 'Descargar memoria 2016'
FROM public.ape_cms_transparency_sections WHERE label = 'Memorias Anuales'
ON CONFLICT DO NOTHING;
