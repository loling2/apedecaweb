/*
# Create ape_storage_config table for Wasabi storage credentials

1. New Table
- `ape_storage_config`: key-value store for storage configuration (Wasabi credentials, bucket, endpoint).

2. Security
- RLS enabled. Read only for authenticated users.
- No public read since this contains sensitive credentials.
*/

CREATE TABLE IF NOT EXISTS public.ape_storage_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ape_storage_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_ape_storage_config" ON public.ape_storage_config;
CREATE POLICY "select_ape_storage_config" ON public.ape_storage_config FOR SELECT
  TO authenticated USING (true);

INSERT INTO public.ape_storage_config (key, value) VALUES
  ('WASABI_ACCESS_KEY', '463244LR5DNM7LTWYBP8'),
  ('WASABI_SECRET_KEY', 'z00eiHTuOzYFFzeZk33QgO5d312eDBP49XZWFCzn'),
  ('WASABI_BUCKET_NAME', 'apedecadocumentos'),
  ('WASABI_ENDPOINT', 'https://s3.eu-central-1.wasabisys.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
