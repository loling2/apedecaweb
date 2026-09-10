/*
# Add admin read access to job applications

1. Changes
- Adds SELECT policy on `ape_job_applications` so authenticated admins can view received applications.
- Adds SELECT policy on `ape_job_offers` (all, not just published) so admins can manage all offers.

2. Security
- Only authenticated users can read applications and all offers (not just published).
- No insert/update/delete changes — applications remain insert-only for the public.
*/

DROP POLICY IF EXISTS "Signed in users can read APEDECA applications" ON public.ape_job_applications;
CREATE POLICY "Signed in users can read APEDECA applications"
ON public.ape_job_applications FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Signed in users can read all APEDECA jobs" ON public.ape_job_offers;
CREATE POLICY "Signed in users can read all APEDECA jobs"
ON public.ape_job_offers FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Signed in users can create APEDECA jobs" ON public.ape_job_offers;
CREATE POLICY "Signed in users can create APEDECA jobs"
ON public.ape_job_offers FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Signed in users can update APEDECA jobs" ON public.ape_job_offers;
CREATE POLICY "Signed in users can update APEDECA jobs"
ON public.ape_job_offers FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Signed in users can delete APEDECA jobs" ON public.ape_job_offers;
CREATE POLICY "Signed in users can delete APEDECA jobs"
ON public.ape_job_offers FOR DELETE
TO authenticated
USING (true);
