/*
# Create "Formulario de Denuncias" page for CMS-editable content

1. New data
- Inserts a new page in ape_cms_pages with slug 'formulario-denuncias'.
- Inserts one text block with placeholder content the user can edit from the CMS.
2. No new tables or columns.
3. Security
- No policy changes. Uses existing RLS policies for ape_cms_pages and ape_cms_blocks.
*/

INSERT INTO public.ape_cms_pages (slug, title, subtitle, banner_image, is_visible, sort_order)
VALUES (
  'formulario-denuncias',
  'Formulario de Denuncias',
  'Tramitar información o consulta',
  NULL,
  true,
  11
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, image_url, sort_order, is_visible)
SELECT id, 'text',
  'Información del canal',
  'Aquí puedes copiar y pegar el texto que tienes en la web del canal de denuncias.

Edita este bloque desde el panel del CMS para añadir toda la información legal, instrucciones y contenido que necesites mostrar antes del formulario.',
  NULL, 0, true
FROM public.ape_cms_pages WHERE slug = 'formulario-denuncias'
ON CONFLICT DO NOTHING;
