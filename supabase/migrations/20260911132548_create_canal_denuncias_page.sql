/*
# Create "Canal de Denuncias" page with content blocks

1. New data
- Inserts a new page in ape_cms_pages with slug 'canal-de-denuncias'.
- Inserts three blocks for that page:
  - A text block with the main heading and description.
  - A link-group block with three links (acceder al formulario, normativa, información).
  - A text block with contact/privacy information.
2. No new tables or columns.
3. Security
- No policy changes. The page and blocks use existing RLS policies
  (public read, authenticated write) already defined for ape_cms_pages and ape_cms_blocks.
*/

INSERT INTO public.ape_cms_pages (slug, title, subtitle, banner_image, is_visible, sort_order)
VALUES (
  'canal-de-denuncias',
  'Canal de Denuncias',
  'Información sobre el canal de denuncias',
  NULL,
  true,
  10
)
ON CONFLICT (slug) DO NOTHING;

-- Texto principal: qué es el canal de denuncias
INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, image_url, sort_order, is_visible)
SELECT id, 'text',
  'Canal de Denuncias',
  'El Canal de Denuncias de APEDECA es un canal seguro y confidencial para que cualquier persona pueda comunicar conductas irregulares, incumplimientos normativos o éticos que afecten a la asociación.

Las comunicaciones pueden realizarse de forma anónima y serán tratadas con la máxima confidencialidad, garantizando en todo momento la protección del denunciante frente a cualquier tipo de represalia.',
  NULL, 0, true
FROM public.ape_cms_pages WHERE slug = 'canal-de-denuncias'
ON CONFLICT DO NOTHING;

-- Grupo de enlaces: tres tarjetas
INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, image_url, sort_order, is_visible)
SELECT id, 'link-group',
  'Acceso al canal',
  'Acceder al formulario|https://forms.gle/ejemplo-denuncias|Formulario de denuncia externa
Normativa y procedimiento|/transparencia|Documentos legales y normativa
Información y contacto|/contacto|Dudas sobre el canal de denuncias',
  NULL, 1, true
FROM public.ape_cms_pages WHERE slug = 'canal-de-denuncias'
ON CONFLICT DO NOTHING;

-- Texto secundario: garantías
INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, image_url, sort_order, is_visible)
SELECT id, 'text',
  'Garantías del canal',
  'Confidencialidad: la identidad del denunciante y la información aportada se tratan con reserva.

Protección frente a represalias: APEDECA prohíbe cualquier acto de represalia contra quienes presenten denuncias de buena fe.

Tramitación: las denuncias recibidas son analizadas por el órgano responsable de la asociación, que adoptará las medidas oportunas en cada caso.',
  NULL, 2, true
FROM public.ape_cms_pages WHERE slug = 'canal-de-denuncias'
ON CONFLICT DO NOTHING;
