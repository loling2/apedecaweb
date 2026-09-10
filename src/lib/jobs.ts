import { supabase } from '@/lib/supabase';

export type ApeJobOffer = {
  id: string;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  image_url: string;
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
