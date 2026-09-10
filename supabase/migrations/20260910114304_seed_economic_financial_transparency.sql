/*
# Añadir contenido económico y financiero a Transparencia

1. Contenido
- Renombra el apartado a `Económica y Financiera` para coincidir con el diseño aprobado.
- Añade las líneas de Cuentas 2019, 2020, 2021, 2022, 2023, Auditoría 2023 y Cuentas 2024.
- Cuentas 2024 queda abierta por defecto y muestra cuatro documentos descargables.
- Auditoría 2023 y Cuentas 2023 incluyen sus documentos correspondientes.

2. Gestión
- Todos los textos y documentos se guardan en las tablas del CMS existentes.
- Los PDFs pueden sustituirse o completarse desde el panel de Transparencia.

3. Seguridad
- No se crean nuevas tablas ni se modifican las políticas existentes.
*/

UPDATE cms_transparency_sections
SET label = 'Económica y Financiera', updated_at = now()
WHERE label = 'Económico y Financiera';

DO $$
DECLARE
  v_section_id uuid;
  v_item_id uuid;
BEGIN
  SELECT id INTO v_section_id
  FROM cms_transparency_sections
  WHERE label = 'Económica y Financiera'
  LIMIT 1;

  IF v_section_id IS NULL THEN
    INSERT INTO cms_transparency_sections (label, icon_name, tone, sort_order, meta)
    VALUES ('Económica y Financiera', 'Briefcase', 'blue', 4, NULL)
    RETURNING id INTO v_section_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cms_transparency_items WHERE section_id = v_section_id AND title = 'Cuentas 2019') THEN
    INSERT INTO cms_transparency_items (section_id, title, sort_order, is_open_by_default)
    VALUES (v_section_id, 'Cuentas 2019', 0, false);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cms_transparency_items WHERE section_id = v_section_id AND title = 'Cuentas 2020') THEN
    INSERT INTO cms_transparency_items (section_id, title, sort_order, is_open_by_default)
    VALUES (v_section_id, 'Cuentas 2020', 1, false);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cms_transparency_items WHERE section_id = v_section_id AND title = 'Cuentas 2021') THEN
    INSERT INTO cms_transparency_items (section_id, title, sort_order, is_open_by_default)
    VALUES (v_section_id, 'Cuentas 2021', 2, false);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cms_transparency_items WHERE section_id = v_section_id AND title = 'Cuentas 2022') THEN
    INSERT INTO cms_transparency_items (section_id, title, sort_order, is_open_by_default)
    VALUES (v_section_id, 'Cuentas 2022', 3, false);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cms_transparency_items WHERE section_id = v_section_id AND title = 'Cuentas 2023') THEN
    INSERT INTO cms_transparency_items (section_id, title, sort_order, is_open_by_default)
    VALUES (v_section_id, 'Cuentas 2023', 4, false)
    RETURNING id INTO v_item_id;
    INSERT INTO cms_transparency_docs (item_id, title, file_path, sort_order) VALUES
      (v_item_id, 'Descargar - Balance Económico', '', 0),
      (v_item_id, 'Descargar - Memoria Económica', '', 1),
      (v_item_id, 'Descargar - Pérdidas y Ganancias', '', 2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cms_transparency_items WHERE section_id = v_section_id AND title = 'Auditoría 2023') THEN
    INSERT INTO cms_transparency_items (section_id, title, sort_order, is_open_by_default)
    VALUES (v_section_id, 'Auditoría 2023', 5, false)
    RETURNING id INTO v_item_id;
    INSERT INTO cms_transparency_docs (item_id, title, file_path, sort_order)
    VALUES (v_item_id, 'Descargar - Auditoría', '', 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM cms_transparency_items WHERE section_id = v_section_id AND title = 'Cuentas 2024 (Actualización 15/5/2025)') THEN
    INSERT INTO cms_transparency_items (section_id, title, sort_order, is_open_by_default)
    VALUES (v_section_id, 'Cuentas 2024 (Actualización 15/5/2025)', 6, true)
    RETURNING id INTO v_item_id;
    INSERT INTO cms_transparency_docs (item_id, title, file_path, sort_order) VALUES
      (v_item_id, 'Balance de situación 2024', '', 0),
      (v_item_id, 'Pérdidas y ganancias', '', 1),
      (v_item_id, 'Auditoría 2024', '', 2),
      (v_item_id, 'Memoria económica', '', 3);
  END IF;
END $$;