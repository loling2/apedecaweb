/*
# Create "Condiciones de uso del canal de denuncias" page

1. New data
- Inserts a new CMS page with slug 'condiciones-uso-denuncias' so the admin can
  identify and edit it easily from the CMS panel.
- Inserts one text block with placeholder legal text the user can replace.

2. No new tables or columns.

3. Security
- No policy changes. Uses existing RLS policies for ape_cms_pages and
  ape_cms_blocks (public read, authenticated write).
*/

INSERT INTO public.ape_cms_pages (slug, title, subtitle, banner_image, is_visible, sort_order)
VALUES (
  'condiciones-uso-denuncias',
  'Condiciones de uso del proveedor',
  'Canal de denuncias',
  NULL,
  true,
  12
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, image_url, sort_order, is_visible)
SELECT id, 'text',
  'Condiciones de uso del proveedor del canal de denuncias',
  'El presente canal de denuncias es gestionado por un proveedor externo especializado en el tratamiento de comunicaciones confidenciales.

Al utilizar este canal, el usuario acepta las siguientes condiciones de uso:

1. Uso del canal. El canal está destinado exclusivamente a la comunicación de información sobre presuntas infracciones cometidas dentro de las entidades del grupo (Servicios y Gestión Residencial en Canarias, S.L. - Gerontalia, S.L. - Asociación de Ayuda a Personas con Dependencia en Canarias). No se utilizará para consultas generales, reclamaciones comerciales o solicitudes de información.

2. Confidencialidad. La información recibida a través del canal será tratada de forma confidencial. La identidad del comunicante se protegerá en los términos previstos en la normativa vigente (Ley 2/2023 de protección del informante).

3. Buena fe. El comunicante debe utilizar el canal de buena fe, aportando información veraz y relevante. La comunicación deliberada de información falsa podrá tener consecuencias legales.

4. Tratamiento de datos. Los datos personales recabados a través del canal serán tratados conforme a la política de privacidad del canal de denuncias, disponible para consulta en el formulario.

5. Prohibición de represalias. Está prohibida cualquier represalia o medida adversa contra las personas que comuniquen información de buena fe a través de este canal.

6. Plazo de tratamiento. Las comunicaciones recibidas serán evaluadas y, en su caso, investigadas, siguiendo el procedimiento interno establecido al efecto.

Para cualquier consulta sobre el funcionamiento del canal, puede contactar a través del formulario de contacto habilitado en la web.',
  NULL, 0, true
FROM public.ape_cms_pages WHERE slug = 'condiciones-uso-denuncias'
ON CONFLICT DO NOTHING;
