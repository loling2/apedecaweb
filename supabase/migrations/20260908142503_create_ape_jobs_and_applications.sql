/*
# Create APEDECA job offers and applications

1. New Tables
- `ape_job_offers` stores active employment opportunities shown on the public careers page.
- `id` is the generated offer identifier.
- `title`, `description`, `location`, `employment_type`, `image_url` and `published` describe each offer.
- `created_at` and `updated_at` track offer changes.
- `ape_job_applications` stores candidate submissions.
- `offer_id` links an application to an offer.
- `candidate_name` and `candidate_email` store contact details supplied by the candidate.
- `cv_path` stores the private storage object path for the uploaded CV.
- `created_at` records when the application was received.

2. Security
- RLS is enabled on both tables.
- Public visitors can read only published job offers.
- Anonymous and authenticated visitors may submit an application with candidate details and a CV path.
- Applications cannot be read, edited, or deleted through the public client.
- CV files are stored in the private `ape-cvs` bucket, with object paths scoped to the application id.
- Only authenticated users can read or remove CV files.

3. Important Notes
- Every project-owned table and storage bucket follows the required `ape_` prefix.
- The browser validates basic form fields, while the database constrains the allowed application shape.
- CV upload type and size limits must also be enforced by the storage bucket configuration and server-side handling before production launch.
- This migration is idempotent and does not remove or rename existing data.
*/

CREATE TABLE IF NOT EXISTS public.ape_job_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT 'Canarias',
  employment_type text NOT NULL DEFAULT 'Jornada completa',
  image_url text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ape_job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.ape_job_offers(id) ON DELETE RESTRICT,
  candidate_name text NOT NULL CHECK (char_length(candidate_name) BETWEEN 2 AND 120),
  candidate_email text NOT NULL CHECK (char_length(candidate_email) BETWEEN 5 AND 254),
  cv_path text NOT NULL CHECK (char_length(cv_path) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ape_job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ape_job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published APEDECA jobs" ON public.ape_job_offers;
CREATE POLICY "Public can read published APEDECA jobs"
ON public.ape_job_offers FOR SELECT
TO anon, authenticated
USING (published = true);

DROP POLICY IF EXISTS "Public can submit APEDECA applications" ON public.ape_job_applications;
CREATE POLICY "Public can submit APEDECA applications"
ON public.ape_job_applications FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ape_job_offers
    WHERE public.ape_job_offers.id = offer_id
    AND public.ape_job_offers.published = true
  )
);

CREATE INDEX IF NOT EXISTS ape_job_offers_published_idx ON public.ape_job_offers (published, created_at DESC);
CREATE INDEX IF NOT EXISTS ape_job_applications_offer_idx ON public.ape_job_applications (offer_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.ape_set_job_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ape_job_offers_updated_at ON public.ape_job_offers;
CREATE TRIGGER ape_job_offers_updated_at
BEFORE UPDATE ON public.ape_job_offers
FOR EACH ROW EXECUTE FUNCTION public.ape_set_job_updated_at();

INSERT INTO public.ape_job_offers (title, description, location, employment_type, image_url, published)
SELECT 'Gerocultor/a', 'Acompañamiento y atención integral a personas mayores y dependientes.', 'Santa Cruz de Tenerife', 'Jornada completa', 'https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg?auto=compress&cs=tinysrgb&w=900', true
WHERE NOT EXISTS (SELECT 1 FROM public.ape_job_offers WHERE title = 'Gerocultor/a');

INSERT INTO public.ape_job_offers (title, description, location, employment_type, image_url, published)
SELECT 'Psicólogo/a', 'Intervención, seguimiento y apoyo emocional para personas usuarias y familias.', 'Canarias', 'Media jornada', 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=900', true
WHERE NOT EXISTS (SELECT 1 FROM public.ape_job_offers WHERE title = 'Psicólogo/a');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('ape-cvs', 'ape-cvs', false, 5242880, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Candidates can upload own APEDECA CV" ON storage.objects;
CREATE POLICY "Candidates can upload own APEDECA CV"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'ape-cvs'
  AND (storage.foldername(name))[1] = 'applications'
);

DROP POLICY IF EXISTS "Signed in users can read APEDECA CVs" ON storage.objects;
CREATE POLICY "Signed in users can read APEDECA CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ape-cvs');

DROP POLICY IF EXISTS "Signed in users can delete APEDECA CVs" ON storage.objects;
CREATE POLICY "Signed in users can delete APEDECA CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ape-cvs');
