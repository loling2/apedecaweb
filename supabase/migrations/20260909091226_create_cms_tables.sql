/*
# CMS completo: páginas, bloques, documentos, navegación y ajustes del sitio

1. Nuevas tablas
- `cms_pages`: cada apartado/página de la web (Inicio, Quiénes somos, etc.)
- `cms_blocks`: bloques de contenido dentro de cada página (títulos, textos, imágenes, sliders, botones)
- `cms_documents`: documentos PDF descargables asociados a cada bloque
- `cms_nav_items`: elementos del menú de navegación (orden, etiqueta, página destino)
- `cms_settings`: ajustes globales del sitio (logo, redes sociales, teléfono, etc.)

2. Storage
- Crea buckets públicos para imágenes (cms-images) y documentos (cms-docs)

3. Seguridad
- RLS activada en todas las tablas
- Lectura pública (anon, authenticated) para todas las tablas
- Escritura solo para usuarios autenticados (authenticated)
*/

-- ==================== PÁGINAS ====================
CREATE TABLE IF NOT EXISTS cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  banner_image text,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_cms_pages" ON cms_pages;
CREATE POLICY "public_read_cms_pages" ON cms_pages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_cms_pages" ON cms_pages;
CREATE POLICY "auth_insert_cms_pages" ON cms_pages FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_cms_pages" ON cms_pages;
CREATE POLICY "auth_update_cms_pages" ON cms_pages FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_cms_pages" ON cms_pages;
CREATE POLICY "auth_delete_cms_pages" ON cms_pages FOR DELETE
  TO authenticated USING (true);

-- ==================== BLOQUES ====================
CREATE TABLE IF NOT EXISTS cms_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  block_type text NOT NULL DEFAULT 'text',
  title text,
  body text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cms_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_cms_blocks" ON cms_blocks;
CREATE POLICY "public_read_cms_blocks" ON cms_blocks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_cms_blocks" ON cms_blocks;
CREATE POLICY "auth_insert_cms_blocks" ON cms_blocks FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_cms_blocks" ON cms_blocks;
CREATE POLICY "auth_update_cms_blocks" ON cms_blocks FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_cms_blocks" ON cms_blocks;
CREATE POLICY "auth_delete_cms_blocks" ON cms_blocks FOR DELETE
  TO authenticated USING (true);

-- ==================== DOCUMENTOS ====================
CREATE TABLE IF NOT EXISTS cms_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES cms_blocks(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_path text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cms_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_cms_documents" ON cms_documents;
CREATE POLICY "public_read_cms_documents" ON cms_documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_cms_documents" ON cms_documents;
CREATE POLICY "auth_insert_cms_documents" ON cms_documents FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_cms_documents" ON cms_documents;
CREATE POLICY "auth_update_cms_documents" ON cms_documents FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_cms_documents" ON cms_documents;
CREATE POLICY "auth_delete_cms_documents" ON cms_documents FOR DELETE
  TO authenticated USING (true);

-- ==================== NAVEGACIÓN ====================
CREATE TABLE IF NOT EXISTS cms_nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  page_slug text,
  external_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cms_nav_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_cms_nav" ON cms_nav_items;
CREATE POLICY "public_read_cms_nav" ON cms_nav_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_cms_nav" ON cms_nav_items;
CREATE POLICY "auth_insert_cms_nav" ON cms_nav_items FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_cms_nav" ON cms_nav_items;
CREATE POLICY "auth_update_cms_nav" ON cms_nav_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_cms_nav" ON cms_nav_items;
CREATE POLICY "auth_delete_cms_nav" ON cms_nav_items FOR DELETE
  TO authenticated USING (true);

-- ==================== AJUSTES DEL SITIO ====================
CREATE TABLE IF NOT EXISTS cms_settings (
  id int PRIMARY KEY DEFAULT 1,
  logo_url text,
  site_name text NOT NULL DEFAULT 'Apedeca',
  phone text,
  email text,
  address text,
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  youtube_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_cms_settings" ON cms_settings;
CREATE POLICY "public_read_cms_settings" ON cms_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_cms_settings" ON cms_settings;
CREATE POLICY "auth_update_cms_settings" ON cms_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Insertar fila inicial de settings si no existe
INSERT INTO cms_settings (id, site_name, phone, email, address)
VALUES (1, 'Apedeca', '922 07 55 45', 'info@apedeca.es', 'Santa Cruz de Tenerife')
ON CONFLICT (id) DO NOTHING;

-- ==================== STORAGE BUCKETS ====================
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-images', 'cms-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-docs', 'cms-docs', true) ON CONFLICT (id) DO NOTHING;

-- Políticas de storage: lectura pública, escritura solo autenticados
DROP POLICY IF EXISTS "public_read_cms_images" ON storage.objects;
CREATE POLICY "public_read_cms_images" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id IN ('cms-images', 'cms-docs'));

DROP POLICY IF EXISTS "auth_insert_cms_images" ON storage.objects;
CREATE POLICY "auth_insert_cms_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id IN ('cms-images', 'cms-docs'));

DROP POLICY IF EXISTS "auth_update_cms_images" ON storage.objects;
CREATE POLICY "auth_update_cms_images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id IN ('cms-images', 'cms-docs'));

DROP POLICY IF EXISTS "auth_delete_cms_images" ON storage.objects;
CREATE POLICY "auth_delete_cms_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id IN ('cms-images', 'cms-docs'));

-- ==================== DATOS INICIALES ====================
-- Páginas
INSERT INTO cms_pages (slug, title, subtitle, banner_image, sort_order) VALUES
  ('inicio', 'Inicio', NULL, NULL, 0),
  ('quienes-somos', 'Quiénes somos', 'Conoce nuestra historia y misión', 'https://images.pexels.com/photos/18429306/pexels-photo-18429306.jpeg?auto=compress&cs=tinysrgb&w=1600', 1),
  ('proyectos', 'Proyectos', 'Nuestros servicios y programas', 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600', 2),
  ('convenios', 'Convenios', 'Colaboración y oportunidades', 'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=1600', 3),
  ('transparencia', 'Transparencia', 'Información institucional', 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600', 4),
  ('voluntariado', 'Voluntariado', 'Participa y acompaña', 'https://images.pexels.com/photos/7551662/pexels-photo-7551662.jpeg?auto=compress&cs=tinysrgb&w=1600', 5)
ON CONFLICT (slug) DO NOTHING;

-- Navegación
INSERT INTO cms_nav_items (label, page_slug, sort_order) VALUES
  ('Inicio', 'inicio', 0),
  ('Quiénes somos', 'quienes-somos', 1),
  ('Proyectos', 'proyectos', 2),
  ('Convenios', 'convenios', 3),
  ('Transparencia', 'transparencia', 4),
  ('Voluntariado', 'voluntariado', 5)
ON CONFLICT DO NOTHING;

-- Bloques iniciales para la página de Inicio
INSERT INTO cms_blocks (page_id, block_type, title, body, image_url, sort_order)
SELECT id, 'hero', 'Apedeca', 'Asociación canaria de personas con dependencia', 'https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg?auto=compress&cs=tinysrgb&w=1600', 0
FROM cms_pages WHERE slug = 'inicio'
ON CONFLICT DO NOTHING;

INSERT INTO cms_blocks (page_id, block_type, title, body, sort_order)
SELECT id, 'text', 'Nuestra Historia', 'APEDECA fue creada oficialmente el 21 de septiembre de 2012 e inscrita en el Registro de Asociaciones de Canarias con el número G1/S1/19139-13/TF el 10 de abril de 2013.

Durante más de 12 años, hemos evolucionado desde una iniciativa local hasta convertirnos en una entidad de ámbito autonómico de referencia en el archipiélago canario.

Nuestro domicilio social se encuentra en Santa Cruz de Tenerife, aunque nuestra acción se extiende por múltiples islas del archipiélago.', 1
FROM cms_pages WHERE slug = 'inicio'
ON CONFLICT DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_cms_blocks_page_id ON cms_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_documents_block_id ON cms_documents(block_id);
CREATE INDEX IF NOT EXISTS idx_cms_nav_sort ON cms_nav_items(sort_order);
