import { supabase } from '@/lib/supabase';

export type ApeContentType = 'text' | 'textarea' | 'image' | 'url';

export type ApeSiteContent = {
  id: string;
  content_key: string;
  content_value: string;
  content_type: ApeContentType;
  section: string;
  created_at: string;
  updated_at: string;
};

export async function loadApeContent(): Promise<ApeSiteContent[]> {
  const { data, error } = await supabase
    .from('ape_site_content')
    .select('*')
    .order('section')
    .order('content_key');

  if (error) throw error;
  return (data ?? []) as ApeSiteContent[];
}

export async function saveApeContent(
  contentKey: string,
  contentValue: string,
): Promise<void> {
  const { error } = await supabase
    .from('ape_site_content')
    .upsert({ content_key: contentKey, content_value: contentValue }, { onConflict: 'content_key' });

  if (error) throw error;
}
