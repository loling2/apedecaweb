import { supabase } from '@/lib/supabase';

export type ApeJobOffer = {
  id: string;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  image_url: string;
  long_description: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export async function loadApeJobOffers(): Promise<ApeJobOffer[]> {
  const { data, error } = await supabase
    .from('ape_job_offers')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ApeJobOffer[];
}

export async function loadJobOfferById(id: string): Promise<ApeJobOffer | null> {
  const { data, error } = await supabase
    .from('ape_job_offers')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle();
  if (error) throw error;
  return data as ApeJobOffer | null;
}

export async function fetchAllJobOffers(): Promise<ApeJobOffer[]> {
  const { data, error } = await supabase
    .from('ape_job_offers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ApeJobOffer[];
}

export async function createJobOffer(input: { title: string; description: string; location?: string; employment_type?: string; image_url?: string; long_description?: string | null; published?: boolean }): Promise<ApeJobOffer> {
  const { data, error } = await supabase
    .from('ape_job_offers')
    .insert({
      title: input.title,
      description: input.description,
      location: input.location || 'Canarias',
      employment_type: input.employment_type || 'Jornada completa',
      image_url: input.image_url || '',
      long_description: input.long_description ?? null,
      published: input.published ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ApeJobOffer;
}

export async function updateJobOffer(id: string, input: Partial<{ title: string; description: string; location: string; employment_type: string; image_url: string; long_description: string | null; published: boolean }>): Promise<void> {
  const { error } = await supabase
    .from('ape_job_offers')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteJobOffer(id: string): Promise<void> {
  const { error } = await supabase
    .from('ape_job_offers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function submitApeJobApplication(
  offerId: string,
  candidateName: string,
  candidateEmail: string,
  cv: File,
): Promise<void> {
  const applicationId = crypto.randomUUID();
  const extension = cv.name.includes('.') ? cv.name.split('.').pop()?.toLowerCase() : 'pdf';
  const cvPath = `applications/${applicationId}/cv.${extension}`;
  const { error: uploadError } = await supabase.storage.from('ape-cvs').upload(cvPath, cv, {
    contentType: cv.type,
    upsert: false,
  });

  if (uploadError) throw uploadError;

  const { error } = await supabase.from('ape_job_applications').insert({
    id: applicationId,
    offer_id: offerId,
    candidate_name: candidateName.trim(),
    candidate_email: candidateEmail.trim().toLowerCase(),
    cv_path: cvPath,
  });

  if (error) {
    await supabase.storage.from('ape-cvs').remove([cvPath]);
    throw error;
  }
}
