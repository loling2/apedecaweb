import { supabase } from '@/lib/supabase';
import type { ApeJobOffer } from '@/lib/jobs';

export type ApeJobApplication = {
  id: string;
  offer_id: string;
  candidate_name: string;
  candidate_email: string;
  cv_path: string;
  created_at: string;
};

export type JobOfferInput = {
  title: string;
  description: string;
  location: string;
  employment_type: string;
  image_url: string;
  published: boolean;
};

export async function fetchAllJobOffers(): Promise<ApeJobOffer[]> {
  const { data, error } = await supabase
    .from('ape_job_offers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ApeJobOffer[];
}

export async function createJobOffer(input: JobOfferInput): Promise<void> {
  const { error } = await supabase.from('ape_job_offers').insert(input);
  if (error) throw error;
}

export async function updateJobOffer(id: string, input: JobOfferInput): Promise<void> {
  const { error } = await supabase.from('ape_job_offers').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteJobOffer(id: string): Promise<void> {
  const { error } = await supabase.from('ape_job_offers').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchAllApplications(): Promise<ApeJobApplication[]> {
  const { data, error } = await supabase
    .from('ape_job_applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ApeJobApplication[];
}

export async function getCvDownloadUrl(cvPath: string): Promise<string> {
  const { data, error } = await supabase.storage.from('ape-cvs').createSignedUrl(cvPath, 60);
  if (error) throw error;
  return data.signedUrl;
}
