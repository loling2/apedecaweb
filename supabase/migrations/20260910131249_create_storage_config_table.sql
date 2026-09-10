CREATE TABLE IF NOT EXISTS storage_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE storage_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_storage_config" ON storage_config FOR SELECT
  TO authenticated USING (true);

INSERT INTO storage_config (key, value) VALUES
  ('WASABI_ACCESS_KEY', '463244LR5DNM7LTWYBP8'),
  ('WASABI_SECRET_KEY', 'z00eiHTuOzYFFzeZk33QgO5d312eDBP49XZWFCzn'),
  ('WASABI_BUCKET_NAME', 'apedecadocumentos'),
  ('WASABI_ENDPOINT', 'https://s3.eu-central-1.wasabisys.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
