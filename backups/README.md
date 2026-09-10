# Backup de la Base de Datos de APEDECA

## Fecha del backup: 2026-09-10

## Archivos incluidos

| Archivo | Contenido |
|---------|-----------|
| `backup_completo_2026-09-10.sql` | Esquema completo: tablas, columnas, defaults, foreign keys, RLS, políticas y grants. Datos de settings, pages, nav_items, job_offers, projects y transparency_sections. |
| `backup_blocks.sql` | 15 registros de `cms_blocks` (bloques de contenido de cada página). |
| `backup_transparency_items.sql` | 40 registros de `cms_transparency_items` (items dentro de cada sección de transparencia). |
| `backup_transparency_docs.sql` | 10 registros de `cms_transparency_docs` (documentos descargables de cada item). |

## Cómo restaurar

### Opción A: En un Supabase nuevo (recomendado)

1. Ejecuta `backup_completo_2026-09-10.sql` con `apply_migration` o en el SQL Editor de Supabase.
2. Ejecuta `backup_blocks.sql`.
3. Ejecuta `backup_transparency_items.sql`.
4. Ejecuta `backup_transparency_docs.sql`.

### Opción B: En cualquier Postgres

```bash
psql -U postgres -d tu_basededatos -f backup_completo_2026-09-10.sql
psql -U postgres -d tu_basededatos -f backup_blocks.sql
psql -U postgres -d tu_basededatos -f backup_transparency_items.sql
psql -U postgres -d tu_basededatos -f backup_transparency_docs.sql
```

## Qué NO incluye este backup

- **Archivos subidos a Supabase Storage** (imágenes del logo, imágenes de proyectos, documentos PDF). Los archivos físicos viven en Supabase Storage, no en la base de datos. La base de datos solo guarda las URLs/rutas. Si migras a otro proveedor de storage, necesitarás volver a subir los archivos y actualizar las URLs.
- **Usuarios de autenticación** (cuentas creadas con email/password en Supabase Auth). Estas viven en `auth.users` y no se incluyen en este backup SQL.

## Resumen de tablas y registros

| Tabla | Registros |
|-------|-----------|
| cms_settings | 1 |
| cms_pages | 8 |
| cms_nav_items | 6 |
| cms_blocks | 15 |
| cms_documents | 0 |
| ape_site_content | 0 |
| ape_job_offers | 2 |
| ape_job_applications | 0 |
| ape_projects | 2 |
| cms_transparency_sections | 9 |
| cms_transparency_items | 40 |
| cms_transparency_docs | 10 |
| **Total** | **93 registros** |
