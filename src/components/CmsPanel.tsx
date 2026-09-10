import { useEffect, useState, type FormEvent } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderCog,
  GripVertical,
  Image as ImageIcon,
  LayoutDashboard,
  Link2,
  Plus,
  Save,
  Settings,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  fetchPages,
  createPage,
  updatePage,
  deletePage,
  fetchBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  fetchDocuments,
  createDocument,
  deleteDocument,
  fetchNavItems,
  createNavItem,
  updateNavItem,
  deleteNavItem,
  fetchSettings,
  updateSettings,
  uploadImage,
  uploadDocument,
  testWasabiUpload,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  fetchTransparencySections,
  createTransparencySection,
  updateTransparencySection,
  deleteTransparencySection,
  fetchTransparencyItems,
  createTransparencyItem,
  updateTransparencyItem,
  deleteTransparencyItem,
  fetchTransparencyDocs,
  createTransparencyDoc,
  deleteTransparencyDoc,
  getTransparencyDocUrl,
  type CmsPage,
  type CmsBlock,
  type CmsDocument,
  type CmsNavItem,
  type CmsSettings,
  type ApeProject,
  type TransparencySection,
  type TransparencyItem,
  type TransparencyDoc,
} from '@/lib/cms';

type Tab = 'pages' | 'projects' | 'nav' | 'transparency' | 'settings';

type Props = {
  userEmail: string;
  onClose: () => void;
};

export default function CmsPanel({ userEmail, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('pages');

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-100">
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-slate-900 p-5 text-white sm:flex">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-lime-300">CMS Apedeca</p>
          <p className="mt-2 text-sm text-slate-400">Panel de administración</p>
        </div>
        <nav className="flex-1 space-y-1">
          <SidebarLink active={tab === 'pages'} onClick={() => setTab('pages')} icon={LayoutDashboard} label="Páginas y bloques" />
          <SidebarLink active={tab === 'projects'} onClick={() => setTab('projects')} icon={FolderCog} label="Proyectos" />
          <SidebarLink active={tab === 'transparency'} onClick={() => setTab('transparency')} icon={FileText} label="Transparencia" />
          <SidebarLink active={tab === 'nav'} onClick={() => setTab('nav')} icon={Link2} label="Menú de navegación" />
          <SidebarLink active={tab === 'settings'} onClick={() => setTab('settings')} icon={Settings} label="Ajustes del sitio" />
        </nav>
        <div className="border-t border-slate-700 pt-4">
          <p className="mb-3 truncate text-xs text-slate-400">{userEmail}</p>
          <button onClick={onClose} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white">
            <X size={16} /> Volver a la web
          </button>
        </div>
      </aside>

      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-slate-900 px-4 py-3 text-white sm:hidden">
        <span className="text-sm font-semibold">CMS Apedeca</span>
        <div className="flex gap-2">
          {(['pages', 'projects', 'transparency', 'nav', 'settings'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded px-3 py-1.5 text-xs ${tab === t ? 'bg-sky-500' : 'bg-slate-800'}`}>
              {t === 'pages' ? 'Páginas' : t === 'projects' ? 'Proyectos' : t === 'transparency' ? 'Transp.' : t === 'nav' ? 'Menú' : 'Ajustes'}
            </button>
          ))}
          <button onClick={onClose} className="rounded bg-slate-800 p-1.5"><X size={16} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-14 sm:pt-0">
        {tab === 'pages' && <PagesTab />}
        {tab === 'projects' && <ProjectsTab />}
        {tab === 'transparency' && <TransparencyTab />}
        {tab === 'nav' && <NavTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

function SidebarLink({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof LayoutDashboard; label: string }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? 'bg-sky-500 font-semibold text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
      <Icon size={18} /> {label}
    </button>
  );
}

/* ==================== PAGES TAB ==================== */

function PagesTab() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);
  const [showPageForm, setShowPageForm] = useState(false);

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    setLoading(true);
    try { setPages(await fetchPages()); } catch { setError('No se pudieron cargar las páginas.'); } finally { setLoading(false); }
  }

  if (loading) return <div className="p-10 text-slate-500">Cargando páginas…</div>;

  if (selectedPage) return <BlockEditor page={selectedPage} onBack={() => { setSelectedPage(null); refresh(); }} />;

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-900">Páginas de la web</h1>
          <p className="mt-2 text-slate-500">Gestiona las páginas y sus bloques de contenido. Pulsa una página para editar sus textos, imágenes, sliders y documentos.</p>
        </div>
        <button onClick={() => setShowPageForm(true)} className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
          <Plus size={18} /> Nueva página
        </button>
      </div>

      {error && <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <div className="mt-8 space-y-3">
        {pages.map((page) => (
          <div key={page.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            {page.banner_image ? (
              <img src={page.banner_image} alt="" className="h-14 w-20 flex-shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="flex h-14 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><ImageIcon size={22} /></div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-slate-900">{page.title}</h3>
              <p className="mt-0.5 truncate text-sm text-slate-500">/{page.slug}{page.subtitle ? ` · ${page.subtitle}` : ''}</p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <button onClick={() => setSelectedPage(page)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-600">
                Editar bloques
              </button>
              <button onClick={async () => { if (confirm(`¿Eliminar la página "${page.title}" y todos sus bloques?`)) { await deletePage(page.id); await refresh(); } }} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-400 hover:text-red-600" aria-label="Eliminar página">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPageForm && <PageForm onClose={() => setShowPageForm(false)} onSaved={async () => { setShowPageForm(false); await refresh(); }} />}
    </div>
  );
}

function PageForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await createPage({ slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), title, subtitle: subtitle || null, banner_image: bannerImage || null, is_visible: true, sort_order: 99 });
      await onSaved();
    } catch { setError('No se pudo crear la página.'); } finally { setSaving(false); }
  }

  return (
    <Modal title="Nueva página" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Título de la página">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </Field>
        <Field label="URL (slug)">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Ej: quienes-somos" className={inputClass} />
        </Field>
        <Field label="Subtítulo (opcional)">
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} />
        </Field>
        <ImageInput label="Imagen de cabecera" value={bannerImage} onChange={setBannerImage} />
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <SaveButton saving={saving} label="Crear página" />
      </form>
    </Modal>
  );
}

/* ==================== BLOCK EDITOR ==================== */

function BlockEditor({ page, onBack }: { page: CmsPage; onBack: () => void }) {
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBlock, setEditingBlock] = useState<CmsBlock | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [pageEdit, setPageEdit] = useState(false);

  useEffect(() => { refresh(); }, [page.id]);

  async function refresh() {
    setLoading(true);
    try { setBlocks(await fetchBlocks(page.id)); } catch { setError('No se pudieron cargar los bloques.'); } finally { setLoading(false); }
  }

  async function moveBlock(block: CmsBlock, dir: -1 | 1) {
    const sorted = [...blocks].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((b) => b.id === block.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await updateBlock(block.id, { sort_order: other.sort_order });
    await updateBlock(other.id, { sort_order: block.sort_order });
    await refresh();
  }

  const blockTypeLabels: Record<string, string> = {
    hero: 'Cabecera principal (Hero)',
    text: 'Texto',
    image: 'Imagen',
    slider: 'Slider de imágenes',
    button: 'Botón',
    documents: 'Documentos descargables',
    stats: 'Cifras destacadas',
    contact: 'Formulario de contacto',
    list: 'Lista de compromisos',
    areas: 'Áreas de actuación',
    accordion: 'Acordeón informativo',
    'project-links': 'Enlaces de proyectos',
    'volunteer-benefits': 'Beneficios del voluntariado',
    'volunteer-process': 'Proceso de voluntariado',
  };

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900">
        ← Volver a páginas
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-900">{page.title}</h1>
          <p className="mt-2 text-slate-500">Gestiona los bloques de contenido de esta página. Cada bloque es una sección que aparece en la web.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPageEdit(true)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-600">
            Editar página
          </button>
          <button onClick={() => { setEditingBlock(null); setShowBlockForm(true); }} className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            <Plus size={18} /> Nuevo bloque
          </button>
        </div>
      </div>

      {error && <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {loading ? (
        <div className="py-10 text-slate-500">Cargando bloques…</div>
      ) : (
        <div className="mt-8 space-y-3">
          {blocks.length === 0 && <p className="py-10 text-center text-slate-400">Esta página no tiene bloques todavía. Crea el primero con "Nuevo bloque".</p>}
          {blocks.map((block, idx) => (
            <div key={block.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1 pt-1">
                  <button onClick={() => moveBlock(block, -1)} disabled={idx === 0} className="text-slate-400 transition hover:text-slate-700 disabled:opacity-30" aria-label="Subir"><ChevronUp size={18} /></button>
                  <button onClick={() => moveBlock(block, 1)} disabled={idx === blocks.length - 1} className="text-slate-400 transition hover:text-slate-700 disabled:opacity-30" aria-label="Bajar"><ChevronDown size={18} /></button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">{blockTypeLabels[block.block_type] ?? block.block_type}</span>
                    {!block.is_visible && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">Oculto</span>}
                  </div>
                  {block.title && <h3 className="mt-2 font-semibold text-slate-900">{block.title}</h3>}
                  {block.body && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{block.body}</p>}
                  {block.image_url && <img src={block.image_url} alt="" className="mt-3 h-20 w-32 rounded-lg object-cover" />}
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <button onClick={() => { setEditingBlock(block); setShowBlockForm(true); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-600">
                    Editar
                  </button>
                  <button onClick={async () => { if (confirm('¿Eliminar este bloque?')) { await deleteBlock(block.id); await refresh(); } }} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-400 hover:text-red-600" aria-label="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBlockForm && (
        <BlockForm
          pageId={page.id}
          block={editingBlock}
          nextOrder={blocks.length}
          onClose={() => setShowBlockForm(false)}
          onSaved={async () => { setShowBlockForm(false); await refresh(); }}
        />
      )}

      {pageEdit && (
        <PageEditForm page={page} onClose={() => setPageEdit(false)} onSaved={async () => { setPageEdit(false); onBack(); }} />
      )}
    </div>
  );
}

function PageEditForm({ page, onClose, onSaved }: { page: CmsPage; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(page.title);
  const [subtitle, setSubtitle] = useState(page.subtitle ?? '');
  const [bannerImage, setBannerImage] = useState(page.banner_image ?? '');
  const [isVisible, setIsVisible] = useState(page.is_visible);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await updatePage(page.id, { title, subtitle: subtitle || null, banner_image: bannerImage || null, is_visible: isVisible });
      await onSaved();
    } catch { setError('No se pudo guardar.'); } finally { setSaving(false); }
  }

  return (
    <Modal title={`Editar: ${page.title}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Título"><input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} /></Field>
        <Field label="Subtítulo"><input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} /></Field>
        <ImageInput label="Imagen de cabecera" value={bannerImage} onChange={setBannerImage} />
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="h-5 w-5 rounded border-slate-300" />
          <span className="text-sm font-semibold">Visible en la web</span>
        </label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <SaveButton saving={saving} label="Guardar cambios" />
      </form>
    </Modal>
  );
}

function BlockForm({ pageId, block, nextOrder, onClose, onSaved }: { pageId: string; block: CmsBlock | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [blockType, setBlockType] = useState<CmsBlock['block_type']>(block?.block_type ?? 'text');
  const [title, setTitle] = useState(block?.title ?? '');
  const [body, setBody] = useState(block?.body ?? '');
  const [imageUrl, setImageUrl] = useState(block?.image_url ?? '');
  const [isVisible, setIsVisible] = useState(block?.is_visible ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Documents state
  const [docs, setDocs] = useState<CmsDocument[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (block?.id) fetchDocuments(block.id).then(setDocs).catch(() => {});
  }, [block?.id]);

  async function handleUploadDoc(file: File) {
    setUploadingDoc(true);
    try {
      const path = await uploadDocument(file);
      await createDocument({ block_id: block!.id, title: docTitle || file.name, file_path: path, sort_order: docs.length });
      setDocs(await fetchDocuments(block!.id));
      setDocTitle('');
    } catch { setError('No se pudo subir el documento.'); } finally { setUploadingDoc(false); }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError('');
    const input = { page_id: pageId, block_type: blockType, title: title || null, body: body || null, image_url: imageUrl || null, sort_order: block?.sort_order ?? nextOrder, is_visible: isVisible };
    try {
      if (block) await updateBlock(block.id, input);
      else await createBlock(input);
      await onSaved();
    } catch { setError('No se pudo guardar el bloque.'); } finally { setSaving(false); }
  }

  const blockTypes: { value: CmsBlock['block_type']; label: string }[] = [
    { value: 'hero', label: 'Cabecera principal (Hero)' },
    { value: 'text', label: 'Texto' },
    { value: 'image', label: 'Imagen' },
    { value: 'slider', label: 'Slider de imágenes' },
    { value: 'button', label: 'Botón' },
    { value: 'documents', label: 'Documentos descargables' },
    { value: 'stats', label: 'Cifras destacadas' },
    { value: 'contact', label: 'Formulario de contacto' },
    { value: 'list', label: 'Lista de compromisos' },
    { value: 'areas', label: 'Áreas de actuación' },
    { value: 'accordion', label: 'Acordeón informativo' },
    { value: 'project-links', label: 'Enlaces de proyectos' },
    { value: 'volunteer-benefits', label: 'Beneficios del voluntariado' },
    { value: 'volunteer-process', label: 'Proceso de voluntariado' },
  ];

  return (
    <Modal title={block ? 'Editar bloque' : 'Nuevo bloque'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Tipo de bloque">
          <select value={blockType} onChange={(e) => setBlockType(e.target.value as CmsBlock['block_type'])} className={inputClass}>
            {blockTypes.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
          </select>
        </Field>

        {(blockType !== 'stats' && blockType !== 'contact') && (
          <Field label="Título">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </Field>
        )}

        {(blockType === 'text' || blockType === 'hero' || blockType === 'documents' || blockType === 'button' || blockType === 'list' || blockType === 'areas' || blockType === 'accordion' || blockType === 'volunteer-benefits' || blockType === 'volunteer-process') && (
          <Field label={blockType === 'button' ? 'Texto del botón' : 'Contenido / Descripción'}>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} className={`${inputClass} min-h-28`} />
          </Field>
        )}

        {(blockType === 'hero' || blockType === 'image' || blockType === 'slider') && (
          <ImageInput label={blockType === 'slider' ? 'Imagen del slider' : 'Imagen'} value={imageUrl} onChange={setImageUrl} />
        )}

        {blockType === 'documents' && block && (
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Documentos descargables</p>
            <div className="space-y-2">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <FileText size={18} className="text-sky-600" />
                  <span className="flex-1 truncate text-sm text-slate-700">{doc.title}</span>
                  <button onClick={async () => { await deleteDocument(doc.id); setDocs(await fetchDocuments(block.id)); }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              ))}
              {docs.length === 0 && <p className="text-sm text-slate-400">No hay documentos subidos todavía.</p>}
            </div>
            <div className="mt-4 space-y-3">
              <input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Título del documento (ej: Estatutos 2024)" className={inputClass} />
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-sky-300 bg-sky-50 px-4 py-3 text-sm text-sky-800 hover:bg-sky-100">
                <Upload size={16} /> {uploadingDoc ? 'Subiendo…' : 'Subir PDF o documento'}
                <input type="file" accept=".pdf" disabled={uploadingDoc} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadDoc(f); e.target.value = ''; }} className="sr-only" />
              </label>
            </div>
          </div>
        )}

        {blockType === 'documents' && !block && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Guarda el bloque primero para poder subir documentos.</p>
        )}

        <label className="flex items-center gap-3">
          <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="h-5 w-5 rounded border-slate-300" />
          <span className="text-sm font-semibold">Visible en la web</span>
        </label>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <SaveButton saving={saving} label="Guardar bloque" />
      </form>
    </Modal>
  );
}

/* ==================== PROJECTS TAB ==================== */

function ProjectsTab() {
  const [projects, setProjects] = useState<ApeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ApeProject | null>(null);

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    setLoading(true);
    try { setProjects(await fetchProjects()); } catch { setError('No se pudieron cargar los proyectos.'); } finally { setLoading(false); }
  }

  async function moveProject(project: ApeProject, dir: -1 | 1) {
    const sorted = [...projects].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((p) => p.id === project.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await updateProject(project.id, { sort_order: other.sort_order });
    await updateProject(other.id, { sort_order: project.sort_order });
    await refresh();
  }

  async function toggleStatus(project: ApeProject) {
    const newStatus = project.status === 'active' ? 'archived' : 'active';
    await updateProject(project.id, { status: newStatus });
    await refresh();
  }

  async function toggleVisible(project: ApeProject) {
    await updateProject(project.id, { is_visible: !project.is_visible });
    await refresh();
  }

  const activeProjects = projects.filter((p) => p.status === 'active').sort((a, b) => a.sort_order - b.sort_order);
  const archivedProjects = projects.filter((p) => p.status === 'archived').sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  if (loading) return <div className="p-10 text-slate-500">Cargando proyectos…</div>;

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-900">Proyectos</h1>
          <p className="mt-2 text-slate-500">Gestiona los proyectos del slider de "Proyectos Recientes". Al finalizar un proyecto, se archiva automáticamente en "Historial de proyectos".</p>
        </div>
        <button onClick={() => { setEditingProject(null); setShowForm(true); }} className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
          <Plus size={18} /> Nuevo proyecto
        </button>
      </div>

      {error && <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <div className="mt-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-sky-600">Proyectos activos (en el slider)</h2>
        {activeProjects.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-6 text-center text-slate-400">No hay proyectos activos. Crea uno nuevo para que aparezca en el slider.</p>
        ) : (
          <div className="space-y-3">
            {activeProjects.map((project, idx) => (
              <div key={project.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveProject(project, -1)} disabled={idx === 0} className="text-slate-400 transition hover:text-slate-700 disabled:opacity-30"><ChevronUp size={16} /></button>
                  <button onClick={() => moveProject(project, 1)} disabled={idx === activeProjects.length - 1} className="text-slate-400 transition hover:text-slate-700 disabled:opacity-30"><ChevronDown size={16} /></button>
                </div>
                {project.image_url ? (
                  <img src={project.image_url} alt="" className="h-14 w-20 flex-shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-14 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><ImageIcon size={22} /></div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-slate-900">{project.title}</h3>
                  <p className="mt-0.5 truncate text-sm text-slate-500">{project.year ?? 'Sin año'} · {project.description?.slice(0, 60) ?? 'Sin descripción'}</p>
                </div>
                <button onClick={() => toggleVisible(project)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${project.is_visible ? 'bg-lime-100 text-lime-800' : 'bg-slate-100 text-slate-500'}`}>
                  {project.is_visible ? 'Visible' : 'Oculto'}
                </button>
                <button onClick={() => toggleStatus(project)} className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200" title="Mover a archivados">
                  Finalizar
                </button>
                <button onClick={() => { setEditingProject(project); setShowForm(true); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-600">
                  Editar
                </button>
                <button onClick={async () => { if (confirm(`¿Eliminar "${project.title}"?`)) { await deleteProject(project.id); await refresh(); } }} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-amber-600">Proyectos archivados (Historial)</h2>
        {archivedProjects.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-6 text-center text-slate-400">No hay proyectos archivados todavía.</p>
        ) : (
          <div className="space-y-3">
            {archivedProjects.map((project) => (
              <div key={project.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                {project.image_url ? (
                  <img src={project.image_url} alt="" className="h-14 w-20 flex-shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-14 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><ImageIcon size={22} /></div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-slate-900">{project.title}</h3>
                  <p className="mt-0.5 truncate text-sm text-slate-500">{project.year ?? 'Sin año'} · {project.description?.slice(0, 60) ?? 'Sin descripción'}</p>
                </div>
                <button onClick={() => toggleStatus(project)} className="rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-800 transition hover:bg-sky-200" title="Volver a activos">
                  Reactivar
                </button>
                <button onClick={() => { setEditingProject(project); setShowForm(true); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-600">
                  Editar
                </button>
                <button onClick={async () => { if (confirm(`¿Eliminar "${project.title}"?`)) { await deleteProject(project.id); await refresh(); } }} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ProjectForm
          project={editingProject}
          nextOrder={projects.length}
          onClose={() => setShowForm(false)}
          onSaved={async () => { setShowForm(false); await refresh(); }}
        />
      )}
    </div>
  );
}

function ProjectForm({ project, nextOrder, onClose, onSaved }: { project: ApeProject | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [imageUrl, setImageUrl] = useState(project?.image_url ?? '');
  const [year, setYear] = useState(project?.year?.toString() ?? '');
  const [status, setStatus] = useState<'active' | 'archived'>(project?.status ?? 'active');
  const [isVisible, setIsVisible] = useState(project?.is_visible ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!imageUrl) { setError('Debes subir o pegar una imagen para el proyecto.'); return; }
    setSaving(true); setError('');
    try {
      const input = { title, description: description || null, image_url: imageUrl, year: year ? parseInt(year, 10) : null, status, is_visible: isVisible, sort_order: project?.sort_order ?? nextOrder };
      if (project) await updateProject(project.id, input);
      else await createProject({ title, description: description || undefined, image_url: imageUrl, year: year ? parseInt(year, 10) : null, sort_order: nextOrder });
      await onSaved();
    } catch { setError('No se pudo guardar el proyecto.'); } finally { setSaving(false); }
  }

  return (
    <Modal title={project ? 'Editar proyecto' : 'Nuevo proyecto'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Título del proyecto">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Descripción (texto que aparece sobre la imagen)">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} min-h-28`} />
        </Field>
        <ImageInput label="Imagen del proyecto" value={imageUrl} onChange={setImageUrl} />
        <Field label="Año (opcional)">
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Ej: 2025" className={inputClass} />
        </Field>
        <Field label="Estado">
          <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'archived')} className={inputClass}>
            <option value="active">Activo (aparece en el slider)</option>
            <option value="archived">Archivado (aparece en el historial)</option>
          </select>
        </Field>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="h-5 w-5 rounded border-slate-300" />
          <span className="text-sm font-semibold">Visible en la web</span>
        </label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <SaveButton saving={saving} label="Guardar proyecto" />
      </form>
    </Modal>
  );
}

/* ==================== TRANSPARENCY TAB ==================== */

const iconOptions = [
  { value: 'FileText', label: 'FileText' },
  { value: 'UsersRound', label: 'UsersRound' },
  { value: 'ClipboardCheck', label: 'ClipboardCheck' },
  { value: 'Download', label: 'Download' },
  { value: 'Briefcase', label: 'Briefcase' },
  { value: 'Check', label: 'Check' },
  { value: 'Eye', label: 'Eye' },
  { value: 'Handshake', label: 'Handshake' },
  { value: 'GraduationCap', label: 'GraduationCap' },
];

function TransparencyTab() {
  const [sections, setSections] = useState<TransparencySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSection, setSelectedSection] = useState<TransparencySection | null>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    setLoading(true);
    try { setSections(await fetchTransparencySections()); } catch { setError('No se pudieron cargar las secciones.'); } finally { setLoading(false); }
  }

  async function moveSection(section: TransparencySection, dir: -1 | 1) {
    const sorted = [...sections].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((s) => s.id === section.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await updateTransparencySection(section.id, { sort_order: other.sort_order });
    await updateTransparencySection(other.id, { sort_order: section.sort_order });
    await refresh();
  }

  if (loading) return <div className="p-10 text-slate-500">Cargando secciones…</div>;

  if (selectedSection) return <TransparencyItemsEditor section={selectedSection} onBack={() => { setSelectedSection(null); refresh(); }} />;

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-900">Transparencia</h1>
          <p className="mt-2 text-slate-500">Gestiona los apartados de la pestaña de Transparencia. Cada apartado tiene líneas que se pueden desplegar, con texto y documentos PDF descargables.</p>
        </div>
        <button onClick={() => setShowSectionForm(true)} className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
          <Plus size={18} /> Nuevo apartado
        </button>
      </div>

      {error && <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <div className="mt-8 space-y-3">
        {sections.map((section, idx) => (
          <div key={section.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveSection(section, -1)} disabled={idx === 0} className="text-slate-400 transition hover:text-slate-700 disabled:opacity-30"><ChevronUp size={16} /></button>
              <button onClick={() => moveSection(section, 1)} disabled={idx === sections.length - 1} className="text-slate-400 transition hover:text-slate-700 disabled:opacity-30"><ChevronDown size={16} /></button>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`font-semibold ${section.is_visible ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{section.label}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{section.meta ?? 'Sin fecha'} · Icono: {section.icon_name}</p>
            </div>
            <button onClick={async () => { await updateTransparencySection(section.id, { is_visible: !section.is_visible }); await refresh(); }} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${section.is_visible ? 'bg-lime-100 text-lime-800' : 'bg-slate-100 text-slate-500'}`}>
              {section.is_visible ? 'Visible' : 'Oculto'}
            </button>
            <button onClick={() => setSelectedSection(section)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-600">
              Editar líneas
            </button>
            <button onClick={async () => { if (confirm(`¿Eliminar el apartado "${section.label}" y todas sus líneas?`)) { await deleteTransparencySection(section.id); await refresh(); } }} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {showSectionForm && <SectionForm onClose={() => setShowSectionForm(false)} onSaved={async () => { setShowSectionForm(false); await refresh(); }} />}
    </div>
  );
}

function SectionForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [label, setLabel] = useState('');
  const [iconName, setIconName] = useState('FileText');
  const [tone, setTone] = useState('blue');
  const [meta, setMeta] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await createTransparencySection({ label, icon_name: iconName, tone, meta: meta || null, sort_order: 99 });
      await onSaved();
    } catch { setError('No se pudo crear el apartado.'); } finally { setSaving(false); }
  }

  return (
    <Modal title="Nuevo apartado de transparencia" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Nombre del apartado">
          <input required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ej: Información Institucional" className={inputClass} />
        </Field>
        <Field label="Icono">
          <select value={iconName} onChange={(e) => setIconName(e.target.value)} className={inputClass}>
            {iconOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </Field>
        <Field label="Color del icono">
          <select value={tone} onChange={(e) => setTone(e.target.value)} className={inputClass}>
            <option value="blue">Azul</option>
            <option value="lime">Lima</option>
          </select>
        </Field>
        <Field label="Fecha de actualización (opcional)">
          <input value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="Ej: Actualizado 21/11/2025" className={inputClass} />
        </Field>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <SaveButton saving={saving} label="Crear apartado" />
      </form>
    </Modal>
  );
}

function TransparencyItemsEditor({ section, onBack }: { section: TransparencySection; onBack: () => void }) {
  const [items, setItems] = useState<TransparencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState<TransparencyItem | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);

  useEffect(() => { refresh(); }, [section.id]);

  async function refresh() {
    setLoading(true);
    try { setItems(await fetchTransparencyItems(section.id)); } catch { setError('No se pudieron cargar las líneas.'); } finally { setLoading(false); }
  }

  async function moveItem(item: TransparencyItem, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await updateTransparencyItem(item.id, { sort_order: other.sort_order });
    await updateTransparencyItem(other.id, { sort_order: item.sort_order });
    await refresh();
  }

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900">
        ← Volver a apartados
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-900">{section.label}</h1>
          <p className="mt-2 text-slate-500">Gestiona las líneas que aparecen en este apartado. Cada línea puede tener texto desplegable y documentos PDF descargables.</p>
        </div>
        <button onClick={() => { setEditingItem(null); setShowItemForm(true); }} className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
          <Plus size={18} /> Nueva línea
        </button>
      </div>

      {error && <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {loading ? (
        <div className="py-10 text-slate-500">Cargando líneas…</div>
      ) : (
        <div className="mt-8 space-y-3">
          {items.length === 0 && <p className="py-10 text-center text-slate-400">Este apartado no tiene líneas todavía. Crea la primera con "Nueva línea".</p>}
          {items.map((item, idx) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1 pt-1">
                  <button onClick={() => moveItem(item, -1)} disabled={idx === 0} className="text-slate-400 transition hover:text-slate-700 disabled:opacity-30" aria-label="Subir"><ChevronUp size={18} /></button>
                  <button onClick={() => moveItem(item, 1)} disabled={idx === items.length - 1} className="text-slate-400 transition hover:text-slate-700 disabled:opacity-30" aria-label="Bajar"><ChevronDown size={18} /></button>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  {item.body && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.body}</p>}
                  {item.download_label && <p className="mt-1 text-xs text-sky-600">{item.download_label}</p>}
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <button onClick={() => { setEditingItem(item); setShowItemForm(true); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-600">
                    Editar
                  </button>
                  <button onClick={async () => { if (confirm('¿Eliminar esta línea?')) { await deleteTransparencyItem(item.id); await refresh(); } }} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-400 hover:text-red-600" aria-label="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showItemForm && (
        <TransparencyItemForm
          sectionId={section.id}
          item={editingItem}
          nextOrder={items.length}
          onClose={() => setShowItemForm(false)}
          onSaved={async () => { setShowItemForm(false); await refresh(); }}
        />
      )}
    </div>
  );
}

function TransparencyItemForm({ sectionId, item, nextOrder, onClose, onSaved }: { sectionId: string; item: TransparencyItem | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [body, setBody] = useState(item?.body ?? '');
  const [downloadLabel, setDownloadLabel] = useState(item?.download_label ?? '');
  const [isOpenByDefault, setIsOpenByDefault] = useState(item?.is_open_by_default ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [docs, setDocs] = useState<TransparencyDoc[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (item?.id) fetchTransparencyDocs(item.id).then(setDocs).catch(() => {});
  }, [item?.id]);

  async function handleUploadDoc(file: File) {
    if (!item?.id) return;
    setUploadingDoc(true);
    try {
      const path = await uploadDocument(file);
      await createTransparencyDoc({ item_id: item.id, title: docTitle || file.name, file_path: path, sort_order: docs.length });
      setDocs(await fetchTransparencyDocs(item.id));
      setDocTitle('');
    } catch { setError('No se pudo subir el documento.'); } finally { setUploadingDoc(false); }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const input = {
        section_id: sectionId,
        title,
        body: body || null,
        download_label: downloadLabel || null,
        is_open_by_default: isOpenByDefault,
        sort_order: item?.sort_order ?? nextOrder,
      };
      if (item) await updateTransparencyItem(item.id, input);
      else await createTransparencyItem(input);
      await onSaved();
    } catch { setError('No se pudo guardar la línea.'); } finally { setSaving(false); }
  }

  return (
    <Modal title={item ? 'Editar línea' : 'Nueva línea'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Título de la línea">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Convenio 2025" className={inputClass} />
        </Field>
        <Field label="Texto desplegable (opcional)">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} className={`${inputClass} min-h-28`} />
        </Field>
        <Field label="Texto del botón de descarga (opcional)">
          <input value={downloadLabel} onChange={(e) => setDownloadLabel(e.target.value)} placeholder="Ej: Descargar documento - Convenio 2025" className={inputClass} />
        </Field>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={isOpenByDefault} onChange={(e) => setIsOpenByDefault(e.target.checked)} className="h-5 w-5 rounded border-slate-300" />
          <span className="text-sm font-semibold">Desplegado por defecto</span>
        </label>

        {item && (
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Documentos PDF descargables</p>
            <div className="space-y-2">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <FileText size={18} className="text-sky-600" />
                  <span className="flex-1 truncate text-sm text-slate-700">{doc.title}</span>
                  {doc.file_path && <a href={getTransparencyDocUrl(doc.file_path)} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline">Ver</a>}
                  <button onClick={async () => { await deleteTransparencyDoc(doc.id); setDocs(await fetchTransparencyDocs(item.id)); }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              ))}
              {docs.length === 0 && <p className="text-sm text-slate-400">No hay documentos subidos todavía.</p>}
            </div>
            <div className="mt-4 space-y-3">
              <input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Título del documento (ej: Convenio 2025)" className={inputClass} />
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-sky-300 bg-sky-50 px-4 py-3 text-sm text-sky-800 hover:bg-sky-100">
                <Upload size={16} /> {uploadingDoc ? 'Subiendo…' : 'Subir PDF'}
                <input type="file" accept=".pdf" disabled={uploadingDoc} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadDoc(f); e.target.value = ''; }} className="sr-only" />
              </label>
            </div>
          </div>
        )}

        {!item && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Guarda la línea primero para poder subir documentos PDF.</p>}

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <SaveButton saving={saving} label="Guardar línea" />
      </form>
    </Modal>
  );
}

/* ==================== NAV TAB ==================== */

function NavTab() {
  const [items, setItems] = useState<CmsNavItem[]>([]);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    Promise.all([fetchNavItems(), fetchPages()])
      .then(([nav, pgs]) => { setItems(nav); setPages(pgs); })
      .catch(() => setError('No se pudo cargar el menú.'))
      .finally(() => setLoading(false));
  }, []);

  async function moveItem(item: CmsNavItem, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await updateNavItem(item.id, { sort_order: other.sort_order });
    await updateNavItem(other.id, { sort_order: item.sort_order });
    setItems(await fetchNavItems());
  }

  async function toggleVisible(item: CmsNavItem) {
    await updateNavItem(item.id, { is_visible: !item.is_visible });
    setItems(await fetchNavItems());
  }

  if (loading) return <div className="p-10 text-slate-500">Cargando menú…</div>;

  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-900">Menú de navegación</h1>
          <p className="mt-2 text-slate-500">Arrastra para ordenar, muestra u oculta pestañas y crea nuevas entradas de menú.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
          <Plus size={18} /> Nueva pestaña
        </button>
      </div>

      {error && <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <div className="mt-8 space-y-2">
        {items.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveItem(item, -1)} disabled={idx === 0} className="text-slate-400 transition hover:text-slate-700 disabled:opacity-30"><ChevronUp size={16} /></button>
              <button onClick={() => moveItem(item, 1)} disabled={idx === items.length - 1} className="text-slate-400 transition hover:text-slate-700 disabled:opacity-30"><ChevronDown size={16} /></button>
            </div>
            <GripVertical size={18} className="text-slate-300" />
            <div className="min-w-0 flex-1">
              <span className={`font-semibold ${item.is_visible ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{item.label}</span>
              <p className="text-sm text-slate-500">{item.page_slug ? `→ /${item.page_slug}` : item.external_url ?? 'Sin destino'}</p>
            </div>
            <button onClick={() => toggleVisible(item)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${item.is_visible ? 'bg-lime-100 text-lime-800' : 'bg-slate-100 text-slate-500'}`}>
              {item.is_visible ? 'Visible' : 'Oculto'}
            </button>
            <button onClick={async () => { if (confirm('¿Eliminar esta pestaña del menú?')) { await deleteNavItem(item.id); setItems(await fetchNavItems()); } }} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {showForm && <NavItemForm pages={pages} onClose={() => setShowForm(false)} onSaved={async () => { setShowForm(false); setItems(await fetchNavItems()); }} />}
    </div>
  );
}

function NavItemForm({ pages, onClose, onSaved }: { pages: CmsPage[]; onClose: () => void; onSaved: () => void }) {
  const [label, setLabel] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await createNavItem({ label, page_slug: pageSlug || null, external_url: externalUrl || null, sort_order: 99, is_visible: true });
      await onSaved();
    } catch { setError('No se pudo crear la pestaña.'); } finally { setSaving(false); }
  }

  return (
    <Modal title="Nueva pestaña de menú" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Texto de la pestaña">
          <input required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ej: Quiénes somos" className={inputClass} />
        </Field>
        <Field label="Página destino (interna)">
          <select value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} className={inputClass}>
            <option value="">— Ninguna —</option>
            {pages.map((p) => <option key={p.id} value={p.slug}>{p.title} (/{p.slug})</option>)}
          </select>
        </Field>
        <Field label="O URL externa (si no es una página interna)">
          <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://…" className={inputClass} />
        </Field>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <SaveButton saving={saving} label="Crear pestaña" />
      </form>
    </Modal>
  );
}

/* ==================== SETTINGS TAB ==================== */

function SettingsTab() {
  const [settings, setSettings] = useState<CmsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => { fetchSettings().then(setSettings).catch(() => setError('No se pudieron cargar los ajustes.')).finally(() => setLoading(false)); }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true); setSaved(false); setError('');
    try {
      await updateSettings(settings);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch { setError('No se pudieron guardar los ajustes.'); } finally { setSaving(false); }
  }

  async function runTest() {
    setTesting(true); setTestResult(null);
    const result = await testWasabiUpload();
    setTestResult(result);
    setTesting(false);
  }

  if (loading) return <div className="p-10 text-slate-500">Cargando ajustes…</div>;
  if (!settings) return <div className="p-10 text-red-600">No se encontraron los ajustes.</div>;

  return (
    <div className="mx-auto max-w-2xl p-6 sm:p-10">
      <h1 className="text-3xl font-light text-slate-900">Ajustes del sitio</h1>
      <p className="mt-2 text-slate-500">Cambia el logo, los datos de contacto y las redes sociales que aparecen en toda la web.</p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Prueba de conexión a Wasabi</h2>
        <p className="mt-1 text-sm text-slate-500">Verifica que las credenciales de Wasabi están configuradas y que se pueden subir archivos.</p>
        <button onClick={runTest} disabled={testing} className="mt-3 flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60">
          {testing ? 'Probando…' : 'Probar conexión'}
        </button>
        {testResult && (
          <div className={`mt-3 rounded-lg p-3 text-sm ${testResult.ok ? 'bg-lime-50 text-lime-800' : 'bg-red-50 text-red-800'}`}>
            {testResult.ok ? '✓ ' : '✗ '}{testResult.message}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <ImageInput label="Logo del sitio" value={settings.logo_url ?? ''} onChange={(v) => setSettings({ ...settings, logo_url: v })} />
        <Field label="Nombre del sitio"><input value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} className={inputClass} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Teléfono"><input value={settings.phone ?? ''} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className={inputClass} /></Field>
          <Field label="Email"><input value={settings.email ?? ''} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className={inputClass} /></Field>
        </div>
        <Field label="Dirección"><input value={settings.address ?? ''} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className={inputClass} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="URL Facebook"><input value={settings.facebook_url ?? ''} onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })} className={inputClass} /></Field>
          <Field label="URL Instagram"><input value={settings.instagram_url ?? ''} onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })} className={inputClass} /></Field>
          <Field label="URL LinkedIn"><input value={settings.linkedin_url ?? ''} onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })} className={inputClass} /></Field>
          <Field label="URL YouTube"><input value={settings.youtube_url ?? ''} onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })} className={inputClass} /></Field>
        </div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <SaveButton saving={saving} saved={saved} label="Guardar ajustes" />
      </form>
    </div>
  );
}

/* ==================== SHARED COMPONENTS ==================== */

const inputClass = 'w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-5 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-7 shadow-2xl sm:p-9">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SaveButton({ saving, saved, label }: { saving: boolean; saved?: boolean; label: string }) {
  return (
    <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60">
      {saved ? <><Check size={18} /> Guardado</> : <><Save size={18} /> {saving ? 'Guardando…' : label}</>}
    </button>
  );
}

function ImageInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload(file: File) {
    setUploading(true); setError('');
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`No se pudo subir la imagen: ${msg}`);
    } finally { setUploading(false); }
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {value && <img src={value} alt="" className="mb-3 h-28 w-full rounded-lg object-cover" />}
      <div className="space-y-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Pega una URL o sube una imagen" className={inputClass} />
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-sky-300 bg-sky-50 px-4 py-3 text-sm text-sky-800 hover:bg-sky-100">
          <Upload size={16} /> {uploading ? 'Subiendo…' : 'Subir imagen desde el dispositivo'}
          <input type="file" accept="image/*" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} className="sr-only" />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
