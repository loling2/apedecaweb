import { supabase } from '@/lib/supabase';

const functionUrl = `${import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.SUPABASE_URL}/functions/v1/wasabi-storage`;
const functionHeaders = {
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY}`,
};

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  banner_image: string | null;
  is_visible: boolean;
  sort_order: number;
};

export type CmsBlock = {
  id: string;
  page_id: string;
  block_type: 'hero' | 'text' | 'image' | 'slider' | 'button' | 'documents' | 'stats' | 'contact' | 'list' | 'areas' | 'accordion' | 'project-links' | 'volunteer-benefits' | 'volunteer-process';
  title: string | null;
  body: string | null;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
};

export type CmsDocument = {
  id: string;
  block_id: string;
  title: string;
  file_path: string;
  sort_order: number;
};

export type CmsNavItem = {
  id: string;
  label: string;
  page_slug: string | null;
  external_url: string | null;
  sort_order: number;
  is_visible: boolean;
};

export type CmsSettings = {
  id: number;
  logo_url: string | null;
  site_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
};

export type BlockInput = Omit<CmsBlock, 'id' | 'created_at' | 'updated_at'> & { id?: string };
export type PageInput = Omit<CmsPage, 'id'> & { id?: string };
export type NavItemInput = Omit<CmsNavItem, 'id'> & { id?: string };

// ===== PAGES =====

export async function fetchPages(): Promise<CmsPage[]> {
  const { data, error } = await supabase.from('ape_cms_pages').select('*').order('sort_order');
  if (error) throw error;
  return data as CmsPage[];
}

export async function fetchPageBySlug(slug: string): Promise<CmsPage | null> {
  const { data, error } = await supabase.from('ape_cms_pages').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data as CmsPage | null;
}

export async function createPage(input: PageInput): Promise<CmsPage> {
  const { data, error } = await supabase.from('ape_cms_pages').insert(input).select().single();
  if (error) throw error;
  return data as CmsPage;
}

export async function updatePage(id: string, input: Partial<PageInput>): Promise<CmsPage> {
  const { data, error } = await supabase.from('ape_cms_pages').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data as CmsPage;
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase.from('ape_cms_pages').delete().eq('id', id);
  if (error) throw error;
}

// ===== BLOCKS =====

export async function fetchBlocks(pageId: string): Promise<CmsBlock[]> {
  const { data, error } = await supabase.from('ape_cms_blocks').select('*').eq('page_id', pageId).order('sort_order');
  if (error) throw error;
  return data as CmsBlock[];
}

export async function createBlock(input: BlockInput): Promise<CmsBlock> {
  const { data, error } = await supabase.from('ape_cms_blocks').insert(input).select().single();
  if (error) throw error;
  return data as CmsBlock;
}

export async function updateBlock(id: string, input: Partial<BlockInput>): Promise<CmsBlock> {
  const { data, error } = await supabase.from('ape_cms_blocks').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data as CmsBlock;
}

export async function deleteBlock(id: string): Promise<void> {
  const { error } = await supabase.from('ape_cms_blocks').delete().eq('id', id);
  if (error) throw error;
}

// ===== DOCUMENTS =====

export async function fetchDocuments(blockId: string): Promise<CmsDocument[]> {
  const { data, error } = await supabase.from('ape_cms_documents').select('*').eq('block_id', blockId).order('sort_order');
  if (error) throw error;
  return data as CmsDocument[];
}

export async function createDocument(input: { block_id: string; title: string; file_path: string; sort_order?: number }): Promise<CmsDocument> {
  const { data, error } = await supabase.from('ape_cms_documents').insert(input).select().single();
  if (error) throw error;
  return data as CmsDocument;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from('ape_cms_documents').delete().eq('id', id);
  if (error) throw error;
}

export function getDocumentUrl(filePath: string): string {
  return `${functionUrl}?action=download&key=${encodeURIComponent(filePath)}`;
}

// ===== PROJECTS =====

export type ApeProject = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  year: number | null;
  status: 'active' | 'archived';
  sort_order: number;
  is_visible: boolean;
};

export async function fetchProjects(status?: 'active' | 'archived'): Promise<ApeProject[]> {
  let query = supabase.from('ape_projects').select('*');
  if (status) query = query.eq('status', status);
  const { data, error } = await query.order('sort_order');
  if (error) throw error;
  return data as ApeProject[];
}

export async function createProject(input: { title: string; description?: string; image_url: string; year?: number | null; sort_order?: number }): Promise<ApeProject> {
  const { data, error } = await supabase.from('ape_projects').insert(input).select().single();
  if (error) throw error;
  return data as ApeProject;
}

export async function updateProject(id: string, input: Partial<{ title: string; description: string | null; image_url: string; year: number | null; status: 'active' | 'archived'; sort_order: number; is_visible: boolean }>): Promise<ApeProject> {
  const { data, error } = await supabase.from('ape_projects').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data as ApeProject;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('ape_projects').delete().eq('id', id);
  if (error) throw error;
}

// ===== NAV ITEMS =====

export async function fetchNavItems(): Promise<CmsNavItem[]> {
  const { data, error } = await supabase.from('ape_cms_nav_items').select('*').order('sort_order');
  if (error) throw error;
  return data as CmsNavItem[];
}

export async function createNavItem(input: NavItemInput): Promise<CmsNavItem> {
  const { data, error } = await supabase.from('ape_cms_nav_items').insert(input).select().single();
  if (error) throw error;
  return data as CmsNavItem;
}

export async function updateNavItem(id: string, input: Partial<NavItemInput>): Promise<CmsNavItem> {
  const { data, error } = await supabase.from('ape_cms_nav_items').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as CmsNavItem;
}

export async function deleteNavItem(id: string): Promise<void> {
  const { error } = await supabase.from('ape_cms_nav_items').delete().eq('id', id);
  if (error) throw error;
}

// ===== SETTINGS =====

export async function fetchSettings(): Promise<CmsSettings | null> {
  const { data, error } = await supabase.from('ape_cms_settings').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data as CmsSettings | null;
}

export async function updateSettings(input: Partial<CmsSettings>): Promise<CmsSettings> {
  const { data, error } = await supabase.from('ape_cms_settings').update({ ...input, updated_at: new Date().toISOString() }).eq('id', 1).select().single();
  if (error) throw error;
  return data as CmsSettings;
}

// ===== FILE UPLOADS (Wasabi via edge function) =====

export async function testWasabiUpload(): Promise<{ ok: boolean; message: string; url?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const params = new URLSearchParams({ action: 'upload', folder: 'test', filename: 'test-connection.txt' });
    const res = await fetch(`${functionUrl}?${params}`, {
      method: 'POST',
      headers: { ...functionHeaders, 'Content-Type': 'text/plain' },
      body: 'apedeca-test-connection',
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, message: `Error ${res.status}: ${err.error || res.statusText || 'desconocido'}` };
    }
    const data = await res.json();
    return { ok: true, message: 'Conexión correcta. Archivo de prueba subido a Wasabi.', url: data.url };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `No se pudo conectar: ${msg}` };
  } finally {
    clearTimeout(timeout);
  }
}

export async function testWasabiHealth(): Promise<{ ok: boolean; message: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${functionUrl}?action=health`, {
      headers: functionHeaders,
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, message: `Error ${res.status}: ${err.error || res.statusText || 'desconocido'}` };
    }
    const data = await res.json();
    return { ok: true, message: `Edge function responde. Bucket: ${data.bucket}. Endpoint: ${data.endpoint}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `No se pudo contactar con el servidor: ${msg}` };
  } finally {
    clearTimeout(timeout);
  }
}

export async function uploadImage(file: File): Promise<string> {
  const params = new URLSearchParams({
    action: 'upload',
    folder: 'images',
    filename: file.name,
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${functionUrl}?${params}`, {
      method: 'POST',
      headers: { ...functionHeaders, 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }
    const data = await res.json();
    return data.url as string;
  } finally {
    clearTimeout(timeout);
  }
}

export async function uploadDocument(file: File): Promise<string> {
  const params = new URLSearchParams({
    action: 'upload',
    folder: 'docs',
    filename: file.name,
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${functionUrl}?${params}`, {
      method: 'POST',
      headers: { ...functionHeaders, 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }
    const data = await res.json();
    return data.path as string;
  } finally {
    clearTimeout(timeout);
  }
}

// ===== TRANSPARENCY =====

export type TransparencySection = {
  id: string;
  label: string;
  icon_name: string;
  tone: string;
  sort_order: number;
  is_visible: boolean;
  meta: string | null;
};

export type TransparencyItem = {
  id: string;
  section_id: string;
  title: string;
  body: string | null;
  download_label: string | null;
  file_path: string | null;
  sort_order: number;
  is_open_by_default: boolean;
};

export type TransparencyDoc = {
  id: string;
  item_id: string;
  title: string;
  file_path: string;
  sort_order: number;
};

export async function fetchTransparencySections(): Promise<TransparencySection[]> {
  const { data, error } = await supabase.from('ape_cms_transparency_sections').select('*').order('sort_order');
  if (error) throw error;
  return data as TransparencySection[];
}

export async function createTransparencySection(input: { label: string; icon_name?: string; tone?: string; sort_order?: number; meta?: string | null }): Promise<TransparencySection> {
  const { data, error } = await supabase.from('ape_cms_transparency_sections').insert(input).select().single();
  if (error) throw error;
  return data as TransparencySection;
}

export async function updateTransparencySection(id: string, input: Partial<TransparencySection>): Promise<void> {
  const { error } = await supabase.from('ape_cms_transparency_sections').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function deleteTransparencySection(id: string): Promise<void> {
  const { error } = await supabase.from('ape_cms_transparency_sections').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchTransparencyItems(sectionId: string): Promise<TransparencyItem[]> {
  const { data, error } = await supabase.from('ape_cms_transparency_items').select('*').eq('section_id', sectionId).order('sort_order');
  if (error) throw error;
  return data as TransparencyItem[];
}

export async function createTransparencyItem(input: { section_id: string; title: string; body?: string | null; download_label?: string | null; file_path?: string | null; sort_order?: number; is_open_by_default?: boolean }): Promise<TransparencyItem> {
  const { data, error } = await supabase.from('ape_cms_transparency_items').insert(input).select().single();
  if (error) throw error;
  return data as TransparencyItem;
}

export async function updateTransparencyItem(id: string, input: Partial<TransparencyItem>): Promise<void> {
  const { error } = await supabase.from('ape_cms_transparency_items').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function deleteTransparencyItem(id: string): Promise<void> {
  const { error } = await supabase.from('ape_cms_transparency_items').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchTransparencyDocs(itemId: string): Promise<TransparencyDoc[]> {
  const { data, error } = await supabase.from('ape_cms_transparency_docs').select('*').eq('item_id', itemId).order('sort_order');
  if (error) throw error;
  return data as TransparencyDoc[];
}

export async function createTransparencyDoc(input: { item_id: string; title: string; file_path: string; sort_order?: number }): Promise<TransparencyDoc> {
  const { data, error } = await supabase.from('ape_cms_transparency_docs').insert(input).select().single();
  if (error) throw error;
  return data as TransparencyDoc;
}

export async function updateTransparencyDoc(id: string, input: Partial<TransparencyDoc>): Promise<void> {
  const { error } = await supabase.from('ape_cms_transparency_docs').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteTransparencyDoc(id: string): Promise<void> {
  const { error } = await supabase.from('ape_cms_transparency_docs').delete().eq('id', id);
  if (error) throw error;
}

export function getTransparencyDocUrl(filePath: string): string {
  return `${functionUrl}?action=download&key=${encodeURIComponent(filePath)}`;
}
