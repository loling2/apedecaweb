/*
# Permitir gestionar ofertas de empleo desde el CMS

1. Cambios
- Mantiene la tabla existente `ape_job_offers` y sus ofertas actuales.
- No crea ni modifica columnas y no elimina ningún registro.

2. Acceso público
- Las personas visitantes siguen viendo únicamente las ofertas con `published = true`.

3. Acceso del CMS
- Los usuarios autenticados pueden consultar todas las ofertas, incluidas las inactivas.
- Los usuarios autenticados pueden crear, editar y eliminar ofertas desde el panel de administración.

4. Seguridad
- Se mantienen políticas separadas para lectura, inserción, actualización y eliminación.
- El acceso anónimo no obtiene permisos de escritura ni puede consultar ofertas ocultas.
*/

DROP POLICY IF EXISTS "Authenticated admins can read all APEDECA jobs" ON public.ape_job_offers;
CREATE POLICY "Authenticated admins can read all APEDECA jobs"
ON public.ape_job_offers FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated admins can create APEDECA jobs" ON public.ape_job_offers;
CREATE POLICY "Authenticated admins can create APEDECA jobs"
ON public.ape_job_offers FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can update APEDECA jobs" ON public.ape_job_offers;
CREATE POLICY "Authenticated admins can update APEDECA jobs"
ON public.ape_job_offers FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can delete APEDECA jobs" ON public.ape_job_offers;
CREATE POLICY "Authenticated admins can delete APEDECA jobs"
ON public.ape_job_offers FOR DELETE
TO authenticated
USING (true);
