/*
# Create contact submissions table

1. New Tables
- `ape_contact_submissions`
  - `id` (uuid, primary key)
  - `name` (text, not null) — sender's name
  - `email` (text, not null) — sender's email, required
  - `message` (text, not null) — the message body
  - `file_path` (text, nullable) — path to uploaded file in Wasabi, if any
  - `file_name` (text, nullable) — original file name
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `ape_contact_submissions`.
- Allow anon + authenticated INSERT only (public contact form).
- No SELECT/UPDATE/DELETE for anon — only the service role (edge function) can read.
*/

CREATE TABLE IF NOT EXISTS public.ape_contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  file_path text,
  file_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ape_contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact_submissions" ON public.ape_contact_submissions;
CREATE POLICY "anon_insert_contact_submissions"
ON public.ape_contact_submissions FOR INSERT
TO anon, authenticated WITH CHECK (true);
