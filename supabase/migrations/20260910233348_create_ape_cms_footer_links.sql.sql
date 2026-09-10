/*
# Tabla de enlaces de interés del footer

1. Nueva tabla
- `ape_cms_footer_links`: enlaces legales y de interés que aparecen en el pie de página
  - id (uuid, primary key)
  - label (text, texto visible del enlace)
  - page_slug (text, slug de página interna, opcional)
  - external_url (text, URL externa, opcional)
  - sort_order (int, orden)
  - is_visible (boolean, visible u oculto)
  - created_at, updated_at (timestamps)

2. Datos iniciales
- Inserta los enlaces legales existentes: Aviso legal, Política de privacidad,
  Política de cookies, Estatutos, Memoria de actividades

3. Seguridad
- RLS activada
- Lectura pública (anon, authenticated)
- Escritura solo para usuarios autenticados
*/

CREATE TABLE IF NOT EXISTS public.ape_cms_footer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  page_slug text,
  external_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ape_cms_footer_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_ape_cms_footer_links" ON public.ape_cms_footer_links;
CREATE POLICY "public_read_ape_cms_footer_links" ON public.ape_cms_footer_links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_ape_cms_footer_links" ON public.ape_cms_footer_links;
CREATE POLICY "auth_insert_ape_cms_footer_links" ON public.ape_cms_footer_links FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_ape_cms_footer_links" ON public.ape_cms_footer_links;
CREATE POLICY "auth_update_ape_cms_footer_links" ON public.ape_cms_footer_links FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_ape_cms_footer_links" ON public.ape_cms_footer_links;
CREATE POLICY "auth_delete_ape_cms_footer_links" ON public.ape_cms_footer_links FOR DELETE
  TO authenticated USING (true);

INSERT INTO public.ape_cms_footer_links (label, page_slug, sort_order) VALUES
  ('Aviso legal', 'aviso-legal', 0),
  ('Política de privacidad', 'politica-privacidad', 1),
  ('Política de cookies', 'politica-cookies', 2),
  ('Estatutos de la asociación', 'estatutos', 3),
  ('Memoria de actividades', 'memoria-actividades', 4)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_ape_cms_footer_links_sort ON public.ape_cms_footer_links(sort_order);
