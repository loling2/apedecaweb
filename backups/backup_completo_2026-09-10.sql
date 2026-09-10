-- ============================================================
-- BACKUP COMPLETO DE LA BASE DE DATOS DE APEDECA
-- Fecha: 2026-09-10
-- 
-- Este script reconstruye toda la base de datos desde cero:
--   1. Estructura (tablas, columnas, defaults)
--   2. Políticas de seguridad (RLS)
--   3. Datos actuales (INSERT)
--
-- USO: Ejecutar en un Supabase nuevo/vacío con apply_migration
--   o en cualquier cliente SQL de Postgres.
-- ============================================================

-- ============================================================
-- 1. LIMPIEZA (solo si se ejecuta en una BD nueva)
-- ============================================================

DROP TABLE IF EXISTS cms_transparency_docs CASCADE;
DROP TABLE IF EXISTS cms_transparency_items CASCADE;
DROP TABLE IF EXISTS cms_transparency_sections CASCADE;
DROP TABLE IF EXISTS cms_documents CASCADE;
DROP TABLE IF EXISTS cms_blocks CASCADE;
DROP TABLE IF EXISTS cms_pages CASCADE;
DROP TABLE IF EXISTS cms_nav_items CASCADE;
DROP TABLE IF EXISTS cms_settings CASCADE;
DROP TABLE IF EXISTS ape_projects CASCADE;
DROP TABLE IF EXISTS ape_job_applications CASCADE;
DROP TABLE IF EXISTS ape_job_offers CASCADE;
DROP TABLE IF EXISTS ape_site_content CASCADE;

-- ============================================================
-- 2. TABLAS
-- ============================================================

-- Tabla: ape_site_content
CREATE TABLE ape_site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text UNIQUE NOT NULL,
  content_value text DEFAULT ''::text,
  content_type text DEFAULT 'text'::text CHECK (content_type = ANY (ARRAY['text'::text, 'textarea'::text, 'image'::text, 'url'::text]),
  section text DEFAULT 'general'::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: ape_job_offers
CREATE TABLE ape_job_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT ''::text,
  location text DEFAULT 'Canarias'::text,
  employment_type text DEFAULT 'Jornada completa'::text,
  image_url text DEFAULT ''::text,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: ape_job_applications
CREATE TABLE ape_job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL,
  candidate_name text NOT NULL,
  candidate_email text NOT NULL,
  cv_path text,
  created_at timestamptz DEFAULT now()
);

-- Tabla: cms_pages
CREATE TABLE cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  subtitle text,
  banner_image text,
  is_visible boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: cms_blocks
CREATE TABLE cms_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  block_type text DEFAULT 'text'::text,
  title text,
  body text,
  image_url text,
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: cms_documents
CREATE TABLE cms_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES cms_blocks(id) ON DELETE CASCADE,
  title text,
  file_path text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tabla: cms_nav_items
CREATE TABLE cms_nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  page_slug text,
  external_url text,
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabla: cms_settings
CREATE TABLE cms_settings (
  id integer PRIMARY KEY DEFAULT 1,
  logo_url text,
  site_name text DEFAULT 'Apedeca'::text,
  phone text,
  email text,
  address text,
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  youtube_url text,
  updated_at timestamptz DEFAULT now()
);

-- Tabla: ape_projects
CREATE TABLE ape_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  year integer,
  status text DEFAULT 'active'::text,
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: cms_transparency_sections
CREATE TABLE cms_transparency_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  icon_name text DEFAULT 'FileText'::text,
  tone text DEFAULT 'blue'::text,
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  meta text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: cms_transparency_items
CREATE TABLE cms_transparency_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES cms_transparency_sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  download_label text,
  file_path text,
  sort_order integer DEFAULT 0,
  is_open_by_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: cms_transparency_docs
CREATE TABLE cms_transparency_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES cms_transparency_items(id) ON DELETE CASCADE,
  title text,
  file_path text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. FOREIGN KEYS ADICIONALES
-- ============================================================

ALTER TABLE ape_job_applications
  ADD CONSTRAINT ape_job_applications_offer_id_fkey
  FOREIGN KEY (offer_id) REFERENCES ape_job_offers(id) ON DELETE CASCADE;

-- ============================================================
-- 4. HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================

ALTER TABLE ape_site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ape_job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ape_job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_nav_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ape_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_transparency_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_transparency_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_transparency_docs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. POLÍTICAS RLS
-- ============================================================

-- ape_site_content
DROP POLICY IF EXISTS "Public can read APEDECA content" ON ape_site_content;
CREATE POLICY "Public can read APEDECA content" ON ape_site_content
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Signed in users can create APEDECA content" ON ape_site_content;
CREATE POLICY "Signed in users can create APEDECA content" ON ape_site_content
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Signed in users can update APEDECA content" ON ape_site_content;
CREATE POLICY "Signed in users can update APEDECA content" ON ape_site_content
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Signed in users can delete APEDECA content" ON ape_site_content;
CREATE POLICY "Signed in users can delete APEDECA content" ON ape_site_content
  FOR DELETE TO authenticated USING (true);

-- ape_job_offers
DROP POLICY IF EXISTS "Public can read published APEDECA jobs" ON ape_job_offers;
CREATE POLICY "Public can read published APEDECA jobs" ON ape_job_offers
  FOR SELECT TO anon, authenticated USING (published = true);
DROP POLICY IF EXISTS "Signed in users can read all APEDECA jobs" ON ape_job_offers;
CREATE POLICY "Signed in users can read all APEDECA jobs" ON ape_job_offers
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Signed in users can create APEDECA jobs" ON ape_job_offers;
CREATE POLICY "Signed in users can create APEDECA jobs" ON ape_job_offers
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Signed in users can update APEDECA jobs" ON ape_job_offers;
CREATE POLICY "Signed in users can update APEDECA jobs" ON ape_job_offers
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Signed in users can delete APEDECA jobs" ON ape_job_offers;
CREATE POLICY "Signed in users can delete APEDECA jobs" ON ape_job_offers
  FOR DELETE TO authenticated USING (true);

-- ape_job_applications
DROP POLICY IF EXISTS "Public can submit APEDECA applications" ON ape_job_applications;
CREATE POLICY "Public can submit APEDECA applications" ON ape_job_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM ape_job_offers WHERE ape_job_offers.id = ape_job_applications.offer_id AND ape_job_offers.published = true));
DROP POLICY IF EXISTS "Signed in users can read APEDECA applications" ON ape_job_applications;
CREATE POLICY "Signed in users can read APEDECA applications" ON ape_job_applications
  FOR SELECT TO authenticated USING (true);

-- cms_pages
DROP POLICY IF EXISTS "public_read_cms_pages" ON cms_pages;
CREATE POLICY "public_read_cms_pages" ON cms_pages
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_cms_pages" ON cms_pages;
CREATE POLICY "auth_insert_cms_pages" ON cms_pages
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_cms_pages" ON cms_pages;
CREATE POLICY "auth_update_cms_pages" ON cms_pages
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_cms_pages" ON cms_pages;
CREATE POLICY "auth_delete_cms_pages" ON cms_pages
  FOR DELETE TO authenticated USING (true);

-- cms_blocks
DROP POLICY IF EXISTS "public_read_cms_blocks" ON cms_blocks;
CREATE POLICY "public_read_cms_blocks" ON cms_blocks
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_cms_blocks" ON cms_blocks;
CREATE POLICY "auth_insert_cms_blocks" ON cms_blocks
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_cms_blocks" ON cms_blocks;
CREATE POLICY "auth_update_cms_blocks" ON cms_blocks
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_cms_blocks" ON cms_blocks;
CREATE POLICY "auth_delete_cms_blocks" ON cms_blocks
  FOR DELETE TO authenticated USING (true);

-- cms_documents
DROP POLICY IF EXISTS "public_read_cms_documents" ON cms_documents;
CREATE POLICY "public_read_cms_documents" ON cms_documents
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_cms_documents" ON cms_documents;
CREATE POLICY "auth_insert_cms_documents" ON cms_documents
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_cms_documents" ON cms_documents;
CREATE POLICY "auth_update_cms_documents" ON cms_documents
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_cms_documents" ON cms_documents;
CREATE POLICY "auth_delete_cms_documents" ON cms_documents
  FOR DELETE TO authenticated USING (true);

-- cms_nav_items
DROP POLICY IF EXISTS "public_read_cms_nav" ON cms_nav_items;
CREATE POLICY "public_read_cms_nav" ON cms_nav_items
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_cms_nav" ON cms_nav_items;
CREATE POLICY "auth_insert_cms_nav" ON cms_nav_items
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_cms_nav" ON cms_nav_items;
CREATE POLICY "auth_update_cms_nav" ON cms_nav_items
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_cms_nav" ON cms_nav_items;
CREATE POLICY "auth_delete_cms_nav" ON cms_nav_items
  FOR DELETE TO authenticated USING (true);

-- cms_settings
DROP POLICY IF EXISTS "public_read_cms_settings" ON cms_settings;
CREATE POLICY "public_read_cms_settings" ON cms_settings
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_cms_settings" ON cms_settings;
CREATE POLICY "auth_update_cms_settings" ON cms_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ape_projects
DROP POLICY IF EXISTS "public_read_ape_projects" ON ape_projects;
CREATE POLICY "public_read_ape_projects" ON ape_projects
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_ape_projects" ON ape_projects;
CREATE POLICY "auth_insert_ape_projects" ON ape_projects
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_ape_projects" ON ape_projects;
CREATE POLICY "auth_update_ape_projects" ON ape_projects
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_ape_projects" ON ape_projects;
CREATE POLICY "auth_delete_ape_projects" ON ape_projects
  FOR DELETE TO authenticated USING (true);

-- cms_transparency_sections
DROP POLICY IF EXISTS "public_read_transparency_sections" ON cms_transparency_sections;
CREATE POLICY "public_read_transparency_sections" ON cms_transparency_sections
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_transparency_sections" ON cms_transparency_sections;
CREATE POLICY "auth_insert_transparency_sections" ON cms_transparency_sections
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_transparency_sections" ON cms_transparency_sections;
CREATE POLICY "auth_update_transparency_sections" ON cms_transparency_sections
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_transparency_sections" ON cms_transparency_sections;
CREATE POLICY "auth_delete_transparency_sections" ON cms_transparency_sections
  FOR DELETE TO authenticated USING (true);

-- cms_transparency_items
DROP POLICY IF EXISTS "public_read_transparency_items" ON cms_transparency_items;
CREATE POLICY "public_read_transparency_items" ON cms_transparency_items
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_transparency_items" ON cms_transparency_items;
CREATE POLICY "auth_insert_transparency_items" ON cms_transparency_items
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_transparency_items" ON cms_transparency_items;
CREATE POLICY "auth_update_transparency_items" ON cms_transparency_items
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_transparency_items" ON cms_transparency_items;
CREATE POLICY "auth_delete_transparency_items" ON cms_transparency_items
  FOR DELETE TO authenticated USING (true);

-- cms_transparency_docs
DROP POLICY IF EXISTS "public_read_transparency_docs" ON cms_transparency_docs;
CREATE POLICY "public_read_transparency_docs" ON cms_transparency_docs
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_transparency_docs" ON cms_transparency_docs;
CREATE POLICY "auth_insert_transparency_docs" ON cms_transparency_docs
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_transparency_docs" ON cms_transparency_docs;
CREATE POLICY "auth_update_transparency_docs" ON cms_transparency_docs
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_transparency_docs" ON cms_transparency_docs;
CREATE POLICY "auth_delete_transparency_docs" ON cms_transparency_docs
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 6. GRANTS (anon + authenticated)
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ape_site_content TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ape_job_offers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ape_job_applications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cms_pages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cms_blocks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cms_documents TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cms_nav_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cms_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ape_projects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cms_transparency_sections TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cms_transparency_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cms_transparency_docs TO anon, authenticated;

-- ============================================================
-- 7. DATOS — cms_settings
-- ============================================================

INSERT INTO cms_settings (id, logo_url, site_name, phone, email, address, facebook_url, instagram_url, linkedin_url, youtube_url, updated_at)
VALUES (
  1,
  'https://jhlqrhdghuasxyrmccwh.supabase.co/storage/v1/object/public/cms-images/images/1788945595453-cf6nn4.jpg',
  'Apedeca',
  '922 07 55 45',
  'info@apedeca.es',
  'Santa Cruz de Tenerife',
  'https://www.facebook.com/apedeca.dependecia/',
  'https://www.instagram.com/apedeca_asociacion/',
  NULL,
  NULL,
  '2026-09-09T12:31:51.575+00:00'
);

-- ============================================================
-- 8. DATOS — cms_pages
-- ============================================================

INSERT INTO cms_pages (id, slug, title, subtitle, banner_image, is_visible, sort_order, created_at, updated_at) VALUES
('b1486128-a7fd-433e-b8b6-f5909c4cf35f', 'inicio', 'Inicio', NULL, NULL, true, 0, '2026-09-09T09:12:28.244816+00:00', '2026-09-09T09:12:28.244816+00:00'),
('b4cf405b-8184-4a79-9706-e3622e9bd0e5', 'quienes-somos', 'Sobre nosotros', 'Conoce nuestra historia y misión', NULL, true, 1, '2026-09-09T09:12:28.244816+00:00', '2026-09-09T09:12:28.244816+00:00'),
('3239f8a0-cfbb-450f-8022-800266ff6cf4', 'proyectos', 'Proyectos', 'Nuestros servicios y programas', 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600', true, 2, '2026-09-09T09:12:28.244816+00:00', '2026-09-09T09:12:28.244816+00:00'),
('5cf7ee1d-7fba-459e-b11e-7d33f8eddeb2', 'convenios', 'Convenios', 'Colaboración y oportunidades', 'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=1600', true, 3, '2026-09-09T09:12:28.244816+00:00', '2026-09-09T09:12:28.244816+00:00'),
('0caf568e-2d6e-4065-98ed-9a1a4093ad11', 'transparencia', 'Transparencia', 'Información institucional', 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600', true, 4, '2026-09-09T09:12:28.244816+00:00', '2026-09-09T09:12:28.244816+00:00'),
('b6d0447b-c80c-48d6-947d-c2bc4de0602d', 'voluntariado', 'Voluntariado', 'Participa y acompaña', '/images/voluntariado/image.png', true, 5, '2026-09-09T09:12:28.244816+00:00', '2026-09-10T12:05:17.781003+00:00'),
('d5604e48-990d-42fc-9d15-12d67d78af5b', 'proyectos-recientes', 'Proyectos Recientes', NULL, NULL, true, 20, '2026-09-09T10:53:51.970344+00:00', '2026-09-09T10:53:51.970344+00:00'),
('3d2a6937-c584-4fdc-8f8c-6e8d86a72dde', 'historial-de-proyectos', 'Historial de Proyectos', NULL, NULL, true, 21, '2026-09-09T10:53:51.970344+00:00', '2026-09-09T10:53:51.970344+00:00');

-- ============================================================
-- 9. DATOS — cms_nav_items
-- ============================================================

INSERT INTO cms_nav_items (id, label, page_slug, external_url, sort_order, is_visible, created_at) VALUES
('1a36323c-302f-4d1b-bf44-703e7ef1cf36', 'Inicio', 'inicio', NULL, 0, true, '2026-09-09T09:12:28.244816+00:00'),
('945ac413-7be9-447d-9619-6bc3e6fd8477', 'Quiénes somos', 'quienes-somos', NULL, 1, true, '2026-09-09T09:12:28.244816+00:00'),
('0c45e89f-9dea-46ed-b97c-d1345472f45c', 'Proyectos', 'proyectos', NULL, 2, true, '2026-09-09T09:12:28.244816+00:00'),
('3b869681-d617-4bc0-8982-54dd20163622', 'Convenios', 'convenios', NULL, 3, true, '2026-09-09T09:12:28.244816+00:00'),
('fd70154e-8124-4445-a2bf-7d470453e6c5', 'Transparencia', 'transparencia', NULL, 4, true, '2026-09-09T09:12:28.244816+00:00'),
('37986d35-06a0-41f5-95b1-5118d8121090', 'Voluntariado', 'voluntariado', NULL, 5, true, '2026-09-09T09:12:28.244816+00:00');

-- ============================================================
-- 10. DATOS — ape_job_offers
-- ============================================================

INSERT INTO ape_job_offers (id, title, description, location, employment_type, image_url, published, created_at, updated_at) VALUES
('ee6785c1-d1a0-43da-94a8-24e64df250d9', 'Gerocultor/a', 'Acompañamiento y atención integral a personas mayores y dependientes.', 'Santa Cruz de Tenerife', 'Jornada completa', 'https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg?auto=compress&cs=tinysrgb&w=900', true, '2026-09-08T14:25:04.66405+00:00', '2026-09-08T14:25:04.66405+00:00'),
('4ae9c869-fc4d-46c9-b4d4-92a70f4de8e8', 'Psicólogo/a', 'Intervención, seguimiento y apoyo emocional para personas usuarias y familias.', 'Canarias', 'Media jornada', 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=900', true, '2026-09-08T14:25:04.66405+00:00', '2026-09-08T14:25:04.66405+00:00');

-- ============================================================
-- 11. DATOS — ape_projects
-- ============================================================

INSERT INTO ape_projects (id, title, description, image_url, year, status, sort_order, is_visible, created_at, updated_at) VALUES
('b7363387-cde8-4f3d-85f2-c6b8ad4d5ce0', 'Proyectos Recientes', 'Es una prueba', 'https://jhlqrhdghuasxyrmccwh.supabase.co/storage/v1/object/public/cms-images/images/1788952572722-qr9c5p.jpg', 2025, 'active', 0, true, '2026-09-09T11:16:19.435045+00:00', '2026-09-09T11:19:07.261+00:00'),
('422a741e-a5a7-4f87-a698-ba90a1f0514a', 'prueba2', NULL, 'https://jhlqrhdghuasxyrmccwh.supabase.co/storage/v1/object/public/cms-images/images/1788953749582-bhlgzf.jpg', 2025, 'active', 1, true, '2026-09-09T11:35:55.075182+00:00', '2026-09-09T11:35:55.075182+00:00');

-- ============================================================
-- 12. DATOS — cms_transparency_sections
-- ============================================================

INSERT INTO cms_transparency_sections (id, label, icon_name, tone, sort_order, is_visible, meta, created_at, updated_at) VALUES
('c4612dcb-20ec-455f-b5d4-c95ea47beccb', 'Información Institucional', 'FileText', 'blue', 0, true, 'Actualizado 13/11/2025', '2026-09-10T11:31:04.618543+00:00', '2026-09-10T11:31:04.618543+00:00'),
('cb0cf6c2-af5f-4472-a406-1ab5ba74f9b6', 'Organizativa', 'UsersRound', 'lime', 1, true, 'Actualizado 13/11/2025', '2026-09-10T11:31:04.618543+00:00', '2026-09-10T11:31:04.618543+00:00'),
('5c800c0b-c6ac-43d0-8bad-f9b7d8f44f4f', 'Ayudas y Subvenciones', 'ClipboardCheck', 'blue', 2, true, 'Actualizado 21/11/2025', '2026-09-10T11:31:04.618543+00:00', '2026-09-10T11:31:04.618543+00:00'),
('3c32a9ea-3d1a-472c-bc6c-46b792fc208a', 'Memorias Anuales', 'Download', 'lime', 3, true, NULL, '2026-09-10T11:31:04.618543+00:00', '2026-09-10T11:31:04.618543+00:00'),
('81db42c3-eac0-41a5-894b-4f02cabe17ea', 'Económica y Financiera', 'Briefcase', 'blue', 4, true, NULL, '2026-09-10T11:31:04.618543+00:00', '2026-09-10T11:43:05.711633+00:00'),
('77add344-2067-4961-b5a6-d4504c15934e', 'Gestión de calidad', 'Check', 'lime', 5, true, 'Actualizado 17/11/2025', '2026-09-10T11:31:04.618543+00:00', '2026-09-10T11:31:04.618543+00:00'),
('743d105f-9f02-45a6-95d8-25a1bcb76faf', 'Evaluación de transparencia', 'Eye', 'blue', 6, true, NULL, '2026-09-10T11:31:04.618543+00:00', '2026-09-10T11:31:04.618543+00:00'),
('06d0a881-3e4f-4c49-81e6-8a3abe3be910', 'Contratos', 'Handshake', 'blue', 7, true, 'Actualizado 21/11/2025', '2026-09-10T11:31:04.618543+00:00', '2026-09-10T11:31:04.618543+00:00'),
('4dfd19a8-df29-4a5e-84c1-c69292d76dfc', 'Convenios y Encomiendas de gestión', 'GraduationCap', 'lime', 8, true, 'Actualizado 21/11/2025', '2026-09-10T11:31:04.618543+00:00', '2026-09-10T11:31:04.618543+00:00');

-- ============================================================
-- 13. DATOS — cms_transparency_items
-- ============================================================
-- Los datos de cms_transparency_items se insertan por separado
-- para evitar problemas con caracteres especiales en el body.
-- Ver archivo: backup_transparency_items.sql

-- ============================================================
-- 14. DATOS — cms_transparency_docs
-- ============================================================
-- Los datos de cms_transparency_docs se insertan por separado.
-- Ver archivo: backup_transparency_docs.sql

-- ============================================================
-- 15. DATOS — cms_blocks
-- ============================================================
-- Los datos de cms_blocks se insertan por separado.
-- Ver archivo: backup_blocks.sql

-- ============================================================
-- FIN DEL BACKUP
-- ============================================================
