/*
# Create APEDECA site content foundation

1. New Tables
- `ape_site_content` stores editable website content as one row per content key.
- `id` is the generated identifier for each content entry.
- `content_key` is the stable key used by the website and must be unique.
- `content_value` stores the editable text, image URL, or structured value.
- `content_type` identifies how the editor should present the value.
- `section` groups entries inside the administration panel.
- `created_at` and `updated_at` track the content lifecycle.

2. Security
- Row Level Security is enabled on `ape_site_content`.
- Anyone can read published site content so the public website works without signing in.
- Authenticated users can create, update, and delete content from the internal editor.

3. Important Notes
- All project-owned database objects use the mandatory `ape_` prefix.
- This is a shared single-site content model; administrator access can be tightened later with a dedicated allowlist without changing the content keys.
- The migration is idempotent and safe to apply again.
*/

CREATE TABLE IF NOT EXISTS public.ape_site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL UNIQUE,
  content_value text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'textarea', 'image', 'url')),
  section text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ape_site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read APEDECA content" ON public.ape_site_content;
CREATE POLICY "Public can read APEDECA content"
ON public.ape_site_content FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Signed in users can create APEDECA content" ON public.ape_site_content;
CREATE POLICY "Signed in users can create APEDECA content"
ON public.ape_site_content FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Signed in users can update APEDECA content" ON public.ape_site_content;
CREATE POLICY "Signed in users can update APEDECA content"
ON public.ape_site_content FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Signed in users can delete APEDECA content" ON public.ape_site_content;
CREATE POLICY "Signed in users can delete APEDECA content"
ON public.ape_site_content FOR DELETE
TO authenticated
USING (true);

CREATE INDEX IF NOT EXISTS ape_site_content_section_idx ON public.ape_site_content (section);

CREATE OR REPLACE FUNCTION public.ape_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ape_site_content_updated_at ON public.ape_site_content;
CREATE TRIGGER ape_site_content_updated_at
BEFORE UPDATE ON public.ape_site_content
FOR EACH ROW EXECUTE FUNCTION public.ape_set_updated_at();
