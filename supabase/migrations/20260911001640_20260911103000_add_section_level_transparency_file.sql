/*
# Añadir archivo general a cada apartado de transparencia

1. Cambios
- Añade `download_label` a `ape_cms_transparency_sections` para guardar el texto del botón general.
- Añade `file_path` a `ape_cms_transparency_sections` para guardar la ruta del archivo general subido.

2. Comportamiento
- Cada apartado puede tener un archivo general descargable sin crear una línea adicional.
- Los archivos y líneas existentes no se modifican.
- Los valores nuevos son opcionales para mantener intactos los apartados actuales.

3. Seguridad
- Se conservan las políticas RLS existentes de la tabla.
- La lectura pública continúa permitiendo que la web muestre los botones de descarga.
- La escritura continúa limitada al rol autenticado según las políticas existentes.

4. Notas
- Esta migración no elimina columnas ni datos.
- El archivo físico se sube mediante el almacenamiento existente; la tabla solo guarda su ruta.
*/

ALTER TABLE public.ape_cms_transparency_sections
  ADD COLUMN IF NOT EXISTS download_label text,
  ADD COLUMN IF NOT EXISTS file_path text;
