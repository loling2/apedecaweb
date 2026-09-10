import type { CmsNavItem, CmsSettings, CmsPage, CmsBlock } from '@/lib/cms';

export const fallbackNavItems: CmsNavItem[] = [
  { id: 'fb-1', label: 'Inicio', page_slug: 'inicio', external_url: null, sort_order: 0, is_visible: true },
  { id: 'fb-2', label: 'Quiénes somos', page_slug: 'quienes-somos', external_url: null, sort_order: 1, is_visible: true },
  { id: 'fb-3', label: 'Proyectos', page_slug: 'proyectos', external_url: null, sort_order: 2, is_visible: true },
  { id: 'fb-4', label: 'Convenios', page_slug: 'convenios', external_url: null, sort_order: 3, is_visible: true },
  { id: 'fb-5', label: 'Transparencia', page_slug: 'transparencia', external_url: null, sort_order: 4, is_visible: true },
  { id: 'fb-6', label: 'Voluntariado', page_slug: 'voluntariado', external_url: null, sort_order: 5, is_visible: true },
];

export const fallbackSettings: CmsSettings = {
  id: 1,
  logo_url: null,
  site_name: 'Apedeca',
  phone: '922 07 55 45',
  email: 'info@apedeca.es',
  address: 'Santa Cruz de Tenerife',
  facebook_url: null,
  instagram_url: null,
  linkedin_url: null,
  youtube_url: null,
};

const inicioPageId = 'fb-page-inicio';

export const fallbackPages: CmsPage[] = [
  { id: inicioPageId, slug: 'inicio', title: 'Inicio', subtitle: null, banner_image: null, is_visible: true, sort_order: 0 },
  { id: 'fb-page-quienes', slug: 'quienes-somos', title: 'Quiénes somos', subtitle: 'Conoce nuestra historia y misión', banner_image: 'https://images.pexels.com/photos/18429306/pexels-photo-18429306.jpeg?auto=compress&cs=tinysrgb&w=1600', is_visible: true, sort_order: 1 },
  { id: 'fb-page-proyectos', slug: 'proyectos', title: 'Proyectos', subtitle: 'Nuestros servicios y programas', banner_image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600', is_visible: true, sort_order: 2 },
];

export const fallbackBlocks: Record<string, CmsBlock[]> = {
  [inicioPageId]: [
    {
      id: 'fb-blk-hero', page_id: inicioPageId, block_type: 'hero',
      title: 'Apedeca', body: 'Asociación canaria de personas con dependencia',
      image_url: 'https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg?auto=compress&cs=tinysrgb&w=1600',
      sort_order: 0, is_visible: true,
    },
    {
      id: 'fb-blk-text', page_id: inicioPageId, block_type: 'text',
      title: 'Nuestra Historia',
      body: 'APEDECA fue creada oficialmente el 21 de septiembre de 2012 e inscrita en el Registro de Asociaciones de Canarias con el número G1/S1/19139-13/TF el 10 de abril de 2013.\n\nDurante más de 12 años, hemos evolucionado desde una iniciativa local hasta convertirnos en una entidad de ámbito autonómico de referencia en el archipiélago canario.\n\nNuestro domicilio social se encuentra en Santa Cruz de Tenerife, aunque nuestra acción se extiende por múltiples islas del archipiélago.',
      image_url: null, sort_order: 1, is_visible: true,
    },
    {
      id: 'fb-blk-areas', page_id: inicioPageId, block_type: 'areas',
      title: 'Áreas de Actuación',
      body: '[{"label":"ÁREA 1: Atención Psicosocial","title":"Atención Psicosocial","points":[]},{"label":"ÁREA 2: Integración y Ocio Inclusivo","title":"Integración y Ocio Inclusivo","points":[]},{"label":"ÁREA 3: Inserción Laboral y Formación","title":"Inserción Laboral y Formación","points":["Programas de inserción laboral","Formación profesional especializada","Creación de empleo para personas dependientes"]}]',
      image_url: null, sort_order: 2, is_visible: true,
    },
  ],
};
