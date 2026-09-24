/*
# Create Convenios management tables

1. New Tables
- `ape_convenio_categories`: Represents each icon/category in the Convenios page (e.g. Voluntariado, Formación).
  - id (uuid PK)
  - label (text, not null) — the icon label shown on the button
  - icon_name (text, not null) — lucide-react icon identifier (e.g. Accessibility, GraduationCap)
  - tone (text, not null default 'blue') — color tone: 'blue' or 'lime'
  - sort_order (int, default 0)
  - is_visible (boolean, default true) — lets admin hide an icon without deleting it
  - created_at, updated_at (timestamps)

- `ape_convenio_entries`: Represents each collaboration card under a category (title + body + image).
  - id (uuid PK)
  - category_id (uuid FK → ape_convenio_categories ON DELETE CASCADE)
  - title (text, not null)
  - body (text, nullable)
  - image_url (text, nullable)
  - sort_order (int, default 0)
  - is_visible (boolean, default true)
  - created_at, updated_at (timestamps)

2. Seed Data
- Inserts the 6 existing categories (Voluntariado, Formación, Inserción laboral, Diversidad Funcional y Mayores, Inscripciones, Otras colaboraciones) with their current icons and tones.
- Inserts all existing collaboration entries from the hardcoded ConveniosPage as entries under their respective categories.

3. Security
- RLS enabled on both tables.
- Policies for anon + authenticated CRUD (single-tenant, no auth screen for public content).
*/

CREATE TABLE IF NOT EXISTS ape_convenio_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  icon_name text NOT NULL,
  tone text NOT NULL DEFAULT 'blue',
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ape_convenio_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_convenio_categories" ON ape_convenio_categories;
CREATE POLICY "anon_select_convenio_categories" ON ape_convenio_categories
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_convenio_categories" ON ape_convenio_categories;
CREATE POLICY "anon_insert_convenio_categories" ON ape_convenio_categories
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_convenio_categories" ON ape_convenio_categories;
CREATE POLICY "anon_update_convenio_categories" ON ape_convenio_categories
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_convenio_categories" ON ape_convenio_categories;
CREATE POLICY "anon_delete_convenio_categories" ON ape_convenio_categories
  FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS ape_convenio_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES ape_convenio_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ape_convenio_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_convenio_entries" ON ape_convenio_entries;
CREATE POLICY "anon_select_convenio_entries" ON ape_convenio_entries
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_convenio_entries" ON ape_convenio_entries;
CREATE POLICY "anon_insert_convenio_entries" ON ape_convenio_entries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_convenio_entries" ON ape_convenio_entries;
CREATE POLICY "anon_update_convenio_entries" ON ape_convenio_entries
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_convenio_entries" ON ape_convenio_entries;
CREATE POLICY "anon_delete_convenio_entries" ON ape_convenio_entries
  FOR DELETE TO anon, authenticated USING (true);

-- Seed categories
INSERT INTO ape_convenio_categories (label, icon_name, tone, sort_order, is_visible)
VALUES
  ('Voluntariado', 'Accessibility', 'blue', 0, true),
  ('Formación', 'GraduationCap', 'lime', 1, true),
  ('Inserción laboral', 'Handshake', 'blue', 2, true),
  ('Diversidad Funcional y Mayores', 'UsersRound', 'lime', 3, true),
  ('Inscripciones', 'ClipboardCheck', 'blue', 4, true),
  ('Otras colaboraciones', 'FileText', 'lime', 5, true)
ON CONFLICT DO NOTHING;

-- Seed entries
DO $$
DECLARE
  cat_voluntariado uuid;
  cat_formacion uuid;
  cat_insercion uuid;
  cat_diversidad uuid;
  cat_inscripciones uuid;
  cat_otras uuid;
BEGIN
  SELECT id INTO cat_voluntariado FROM ape_convenio_categories WHERE label = 'Voluntariado';
  SELECT id INTO cat_formacion FROM ape_convenio_categories WHERE label = 'Formación';
  SELECT id INTO cat_insercion FROM ape_convenio_categories WHERE label = 'Inserción laboral';
  SELECT id INTO cat_diversidad FROM ape_convenio_categories WHERE label = 'Diversidad Funcional y Mayores';
  SELECT id INTO cat_inscripciones FROM ape_convenio_categories WHERE label = 'Inscripciones';
  SELECT id INTO cat_otras FROM ape_convenio_categories WHERE label = 'Otras colaboraciones';

  -- Voluntariado
  INSERT INTO ape_convenio_entries (category_id, title, body, sort_order) VALUES
    (cat_voluntariado, 'Federación «Plataforma de Entidades de Voluntariado de Canarias»', 'Organización que aúna a todas aquellas entidades que se dedican al voluntariado en la provincia de Santa Cruz de Tenerife, entre ellas APEDECA, asociada desde el 12 de junio de 2017. En julio de 2023 se firmó una colaboración para la modernización y digitalización del voluntariado de nuestra entidad.', 0),
    (cat_voluntariado, 'Santa Cruz Solidaria', 'Desde el año 2022 formamos parte de la red de entidades de voluntariado y comunitarias del municipio de Santa Cruz de Tenerife, con el fin de visibilizar, fomentar y fortalecer la red municipal.', 1);

  -- Formación
  INSERT INTO ape_convenio_entries (category_id, title, body, sort_order) VALUES
    (cat_formacion, 'Radio ECCA', 'Desde el 13 de noviembre de 2015 hemos sellado un convenio de colaboración con esta empresa referente en la formación en Canarias desde hace más de 60 años. Desde entonces hemos desarrollado varias acciones conjuntas de formación para beneficiar al colectivo discapacitado.', 0),
    (cat_formacion, 'Círculo de Estudios Divulgación Dinámica', 'Empresa de formación y producción educativa especializada en Ciencias Sociales a nivel nacional. El 13 de abril de 2016 se firmó un convenio de colaboración para la donación de cursos del ámbito social, que han aprovechado el personal y voluntariado de nuestra entidad.', 1),
    (cat_formacion, 'Adhesión al Proyecto Fórmate', 'APEDECA se ha adherido al Proyecto Fórmate, promovido por Radio ECCA y Fundación Canaria, dirigido a población sin Graduado en Educación Secundaria para orientar y facilitar la obtención de la titulación. Incluye atención y asesoramiento personalizado, tutorización, formación a distancia y flexibilidad horaria.', 2);

  -- Inserción laboral
  INSERT INTO ape_convenio_entries (category_id, title, body, sort_order) VALUES
    (cat_insercion, 'Serca Gestión', 'El 1 de octubre de 2012, nuestra ONG firma un convenio de colaboración con esta entidad que presta servicios en el ámbito social. Desde entonces se han logrado tres contrataciones de personas con discapacidad a través de nuestra organización.', 0),
    (cat_insercion, 'Drago Integral', 'Entidad registrada como Centro Especial de Empleo dedicada a los servicios de limpieza, mantenimiento y jardinería, con convenio firmado con APEDECA el 15 de abril de 2015 para favorecer la contratación de personas en situación de dependencia.', 1),
    (cat_insercion, 'Asociación Creativa', 'APEDECA y Asociación Creativa firman el 26 de enero de 2017 un convenio para el desarrollo de acciones de interés social dentro del proyecto "Silene", de la convocatoria de Programas de Formación en Alternancia con el Empleo.', 2),
    (cat_insercion, 'Asociación ADDIN', 'Se contrae acuerdo con la Asociación de Dinamización e Inclusión Social para colaborar conjuntamente en actividades que fomenten el desarrollo de sus fines sociales y prácticas profesionales no laborales.', 3);

  -- Diversidad Funcional y Mayores
  INSERT INTO ape_convenio_entries (category_id, title, body, sort_order) VALUES
    (cat_diversidad, 'Acuerdo para la puesta en marcha de actividades de promoción de la salud y la participación de mayores y personas dependientes', 'Esta mañana se ha llevado a cabo la firma de un convenio de colaboración entre el Ayuntamiento de La Victoria de Acentejo y la Asociación de Ayuda a Personas con Dependencia en Canarias (APEDECA) para la puesta en marcha de un municipio de acciones encaminadas a favorecer la autonomía y la participación de personas mayores y/o con discapacidad. En la reunión para sellar el acuerdo han estado presentes el alcalde victoriero, Juan Antonio García; la concejal de Bienestar Social, Estefanía Fernández; y el presidente y la trabajadora social de APEDECA, Iván Márquez y Laura Hernández, respectivamente. En concreto, a través de esta asociación se llevarán a cabo en La Victoria las iniciativas "Empodera-Actívate III" e "¡Intégrate en positivo!", que vienen a agrupar una serie de talleres terapéuticos integrales, de salud y bienestar para personas mayores y adultos con diversidad funcional, respectivamente.', 0),
    (cat_diversidad, 'Coordicanarias', 'Con fecha 13 de agosto de 2021, APEDECA firma nuevo acuerdo con la entidad COORDICANARIAS, para el desarrollo de acciones y proyectos conjuntos en beneficio de las personas con discapacidad física.', 1),
    (cat_diversidad, 'Cooperación con la entidad SPORteam Consulting S.L.', 'Con fecha 20 de octubre de 2021, APEDECA firma un nuevo acuerdo de cooperación con la entidad SPORteam Consulting S.L. para el desarrollo y ejecución de acciones enmarcadas en el área deportiva dirigidas a favorecer la inclusión social de personas dependientes.', 2),
    (cat_diversidad, 'SIMPROMI', 'Desde el 27 de septiembre de 2013, APEDECA y Sinpromi firmamos un convenio de colaboración para crear sinergias de trabajo en beneficio de la discapacidad, y desde entonces hemos realizado varias colaboraciones que se continuarán en el futuro.', 3);

  -- Inscripciones
  INSERT INTO ape_convenio_entries (category_id, title, body, sort_order) VALUES
    (cat_inscripciones, 'Entidad colaboradora del Gobierno de Canarias', 'APEDECA está inscrita desde el 27 de mayo de 2013 como entidad colaboradora del Gobierno de Canarias con número de inscripción TFE 08 1052, cumpliendo con todos los requisitos que ese registro exige.', 0),
    (cat_inscripciones, 'Entidad colaboradora del Servicio Canario de Empleo', 'Desde el 1 de diciembre de 2016, nuestra entidad se encuentra inscrita en el Registro de Entidades Colaboradoras del SCE con número GRS2016CA00001, para poder acceder a ayudas y subvenciones de este área.', 1),
    (cat_inscripciones, 'Registro Municipal de Entidades Ciudadanas del Ayuntamiento de Santa Cruz de Tenerife', 'Inscritos en este registro con nº 1-879 desde el 1 de diciembre de 2015, después de la evaluación favorable de cumplir con todos los requisitos necesarios. Esta inscripción debe ser renovada cada año y nos permite optar a ayudas, subvenciones y participar en las mesas de trabajo del municipio.', 2),
    (cat_inscripciones, 'Registro Municipal de Entidades Ciudadanas del Ayuntamiento de San Cristóbal de La Laguna', 'Inscritos en este registro desde el 14 de junio de 2017 con número 584, después de la evaluación favorable de cumplir con todos los requisitos necesarios.', 3);

  -- Otras colaboraciones
  INSERT INTO ape_convenio_entries (category_id, title, body, sort_order) VALUES
    (cat_otras, 'PFAE El Rosario', 'Convenio de colaboración para prácticas profesionales no laborales, entre el Ilustre Ayuntamiento del Rosario y la Asociación de Personas Dependientes en Canarias (APEDECA), en el marco del proyecto "PFAE Bienestar en El Rosario".', 0),
    (cat_otras, 'PFAE-GJ Domicilia Sociosanitario', 'Convenio de colaboración firmado en marzo de 2022 entre la Asociación Domicilia Hernández y la Asociación de Ayuda a Personas en Dependencia en Canarias (APEDECA), para la realización de la prestación de servicios de las y los participantes del Programa de Formación en Alternancia con el Empleo de Garantía Juvenil "PFAE-GJ Domicilia Sociosanitario", con vigencia hasta febrero de 2023. El alumnado trabajador realizó prácticas laborales en los recursos de la entidad vinculados al C.P. Atención sociosanitaria a personas dependientes en instituciones sociales.', 1),
    (cat_otras, 'CONRED del Ayuntamiento de Santa Cruz de Tenerife', 'Proyecto de trabajo cogestionado por las propias asociaciones del municipio y el Ayuntamiento de Santa Cruz de Tenerife. Desde mayo de 2015, APEDECA viene participando en algunas de las acciones que desarrolla en beneficio de la discapacidad.', 2),
    (cat_otras, 'Plataforma Somos Pacientes', 'Somos Pacientes es una comunidad que ofrece un espacio compartido de información, participación, formación, servicios y trabajo colaborativo dirigido a todas las asociaciones de pacientes y personas con discapacidad de España. Nuestra ONG forma parte como colaboradora adscrita desde el 14 de febrero de 2017.', 3),
    (cat_otras, 'La Laguna Solidaria', 'La Laguna Solidaria es una plataforma de entidades sociales comprometidas con el bienestar social de la comunidad. Sesenta asociaciones de todo tipo ponen en común experiencias, formación y compromisos. APEDECA participa activamente en los eventos y actividades que organiza esta plataforma.', 4),
    (cat_otras, 'Instituto de Atención Sociosanitaria de Tenerife (IASS)', 'Desde el IASS se comenzó a trabajar en abril de 2017 en varias mesas de trabajo para avanzar en distintos ámbitos de los servicios sociales. APEDECA es miembro de la mesa SAAD de los servicios de valoración de la dependencia y ha participado en varias reuniones al respecto.', 5),
    (cat_otras, 'Fundación DISA', 'En diciembre de 2018 se firmó un acuerdo de colaboración para financiar el proyecto social "Del huerto a la mesa", para favorecer la alimentación sana y el contacto con la naturaleza de las personas con discapacidad.', 6),
    (cat_otras, 'Asociación EM Social', 'En octubre de 2018 se estableció un convenio con esta asociación de trabajadores sociales para trabajar conjuntamente en la mejora del sistema de dependencia.', 7),
    (cat_otras, 'Grupo CIO', 'Desde el 17 de abril de 2017, nuestra entidad y Grupo CIO – Compañía de las Islas Occidentales, dentro de su área de RSE, firman un acuerdo de colaboración con la intención de ayudar a nuestra entidad en el desarrollo de actividades y proyectos.', 8),
    (cat_otras, 'Asociación DNT', 'El 16 de junio de 2017 se acuerda con esta entidad la realización conjunta de actividades de formación y terapias alternativas.', 9),
    (cat_otras, 'Fundación CB Canarias', 'Se firma en octubre de 2018 un convenio de colaboración con esta Fundación para trabajar en favor de las personas con discapacidad.', 10),
    (cat_otras, 'Fundación CEPSA', 'En abril de 2016 se firma un acuerdo puntual donde esta entidad organiza una actividad en la que participan trabajadores de esta empresa y usuarios con discapacidad.', 11),
    (cat_otras, 'Eurocampus', 'Convenio específico de colaboración entre el centro de formación Eurocampus Formación y Consultoría, S.L. y la Asociación de Ayuda a Personas con Dependencia en Canarias para la realización del módulo de formación en centros de trabajo del alumnado participante en los certificados de profesionalidad.', 12);
END $$;
