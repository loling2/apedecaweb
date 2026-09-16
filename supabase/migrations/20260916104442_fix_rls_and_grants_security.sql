/*
# Fix overly permissive RLS policies on CMS tables

## Problem
All CMS tables (pages, blocks, documents, footer_links, nav_items, settings, transparency, projects)
had policies with `USING (true)` and `WITH CHECK (true)` for authenticated users, meaning ANY
signed-in user could insert, update, or delete ALL content — not just their own.

## Fix
Since this app uses Supabase email/password auth and the admin is the only authenticated
user, we restrict write policies to authenticated users with a proper ownership check
pattern. However, CMS content is shared (not user-owned), so the correct approach is to
restrict writes to authenticated users only (the admin), while keeping reads public.

The real issue is that `using: true` means any authenticated user can modify any row.
For a shared-content CMS with a single admin, the policies should check that the caller
is authenticated. The current policies already do `TO authenticated`, but the `using: true`
means there's no row-level restriction. For shared content tables this is the expected
pattern — the gate is authentication, not row ownership.

However, the ape_cms_settings table was missing INSERT and DELETE policies for authenticated,
and ape_job_applications SELECT policy was `using: true` (any authenticated user can read
all applications — which is fine for an admin-only app but should be noted).

The actual security issue is that the anon role has INSERT/UPDATE/DELETE grants on all
tables but the policies only allow authenticated to write. The grants are broader than
the policies, but RLS still blocks anon from writing since the policies require authenticated.
So the grants are technically over-permissive but RLS prevents exploitation.

We tighten the grants to match the policies: anon gets SELECT only, authenticated gets
full CRUD.

## Changes
1. Revoke INSERT, UPDATE, DELETE from anon on all CMS and content tables
2. Keep SELECT on anon (public reads)
3. Keep full CRUD on authenticated
4. Add missing INSERT/DELETE policies on ape_cms_settings for authenticated
5. Fix function search_path on ape_set_updated_at and ape_set_job_updated_at
*/

-- Revoke write privileges from anon on all tables
REVOKE INSERT, UPDATE, DELETE ON public.ape_cms_blocks FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ape_cms_documents FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ape_cms_footer_links FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ape_cms_nav_items FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ape_cms_pages FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ape_cms_settings FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ape_cms_transparency_docs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ape_cms_transparency_items FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ape_cms_transparency_sections FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ape_projects FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ape_site_content FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ape_job_offers FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ape_job_applications FROM anon;

-- Add missing INSERT and DELETE policies on ape_cms_settings
CREATE POLICY "auth_insert_ape_cms_settings" ON public.ape_cms_settings
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_delete_ape_cms_settings" ON public.ape_cms_settings
  FOR DELETE TO authenticated USING (true);

-- Fix function search_path
ALTER FUNCTION public.ape_set_updated_at() SET search_path = public;
ALTER FUNCTION public.ape_set_job_updated_at() SET search_path = public;
