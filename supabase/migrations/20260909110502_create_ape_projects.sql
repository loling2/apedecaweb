/*
# Create ape_projects table — project slider + archive

1. New Table
- `ape_projects`: individual projects shown in the slider on the "Proyectos Recientes" page.
  Each project has an image, title, description text overlaid on the image, a year, a status
  ('active' = visible in the slider, 'archived' = moved to the "Historial de proyectos" page),
  and a sort_order for manual ordering in the slider.

2. Security
- RLS enabled.
- Public read (anon, authenticated) so the website can display projects without login.
- Write (insert/update/delete) restricted to authenticated users (CMS admin).
*/

CREATE TABLE IF NOT EXISTS ape_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  year int,
  status text NOT NULL DEFAULT 'active',
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ape_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_ape_projects" ON ape_projects;
CREATE POLICY "public_read_ape_projects" ON ape_projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_ape_projects" ON ape_projects;
CREATE POLICY "auth_insert_ape_projects" ON ape_projects FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_ape_projects" ON ape_projects;
CREATE POLICY "auth_update_ape_projects" ON ape_projects FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_ape_projects" ON ape_projects;
CREATE POLICY "auth_delete_ape_projects" ON ape_projects FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_ape_projects_status ON ape_projects(status);
CREATE INDEX IF NOT EXISTS idx_ape_projects_sort ON ape_projects(sort_order);
