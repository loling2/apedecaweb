/*
# Seed Voluntariado page content (tablas ape_cms_)

1. Updates the ape_cms_pages row for slug='voluntariado':
   - banner_image now points to the local volunteer image
   - subtitle updated to an editable intro line
2. Inserts three ape_cms_blocks of type 'text' for the Voluntariado tabs.
3. No security changes.
*/

UPDATE public.ape_cms_pages
SET banner_image = '/images/voluntariado/image.png',
    subtitle = 'Participa y acompaña',
    updated_at = now()
WHERE slug = 'voluntariado';

INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, sort_order, is_visible)
SELECT id, 'text', 'Hazte voluntario',
'El voluntariado es una forma de compartir tu tiempo, tus conocimientos y tu compromiso con las personas con discapacidad y sus familias. En APEDECA encontrarás un espacio para participar, aprender y construir una sociedad más inclusiva.',
0, true
FROM public.ape_cms_pages WHERE slug = 'voluntariado'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, sort_order, is_visible)
SELECT id, 'text', 'Oficina del voluntariado',
'A través del Cabildo de Tenerife y Sinpromi se gestiona esta oficina, en la que APEDECA está dada de alta desde el 29 de julio de 2013. Formamos parte de una amplia red de entidades que impulsan la participación y el apoyo a las personas con discapacidad.',
1, true
FROM public.ape_cms_pages WHERE slug = 'voluntariado'
ON CONFLICT DO NOTHING;

INSERT INTO public.ape_cms_blocks (page_id, block_type, title, body, sort_order, is_visible)
SELECT id, 'text', 'Cómo participar',
'Cuéntanos tus intereses, disponibilidad y experiencia. Juntos encontraremos la mejor forma de colaborar en nuestras actividades y proyectos.',
2, true
FROM public.ape_cms_pages WHERE slug = 'voluntariado'
ON CONFLICT DO NOTHING;
