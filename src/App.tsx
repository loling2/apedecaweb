import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  Accessibility,
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  Check,
  ClipboardCheck,
  Contrast,
  GraduationCap,
  Handshake,
  Eye,
  Link2,
  Lightbulb,
  RotateCcw,
  Type,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  FolderCog,
  Facebook,
  Instagram,
  Briefcase,
  Linkedin,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Phone,
  Send,
  Upload,
  X,
  Youtube,
  UsersRound,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

import { loadApeJobOffers, submitApeJobApplication, type ApeJobOffer } from '@/lib/jobs';
import {
  fetchPageBySlug,
  fetchBlocks,
  fetchNavItems,
  fetchSettings,
  fetchDocuments,
  fetchProjects,
  fetchTransparencySections,
  fetchTransparencyItems,
  fetchTransparencyDocs,
  getDocumentUrl,
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
import CmsPanel from '@/components/CmsPanel';
import { hasSupabaseConfig } from '@/lib/supabase';
import { fallbackNavItems, fallbackSettings, fallbackPages, fallbackBlocks } from '@/lib/fallbackContent';

type AuthMode = 'sign-in' | 'sign-up';

function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return path;
}

function navigate(href: string) {
  if (href.startsWith('#')) {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    window.open(href, '_blank', 'noreferrer');
    return;
  }
  window.history.pushState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

function App() {
  const currentPath = usePath();
  const [navItems, setNavItems] = useState<CmsNavItem[]>([]);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [settings, setSettings] = useState<CmsSettings | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [loadingContent, setLoadingContent] = useState(true);
  const [contentError, setContentError] = useState('');

  useEffect(() => {
    void loadContent();
    if (!hasSupabaseConfig) return;
    supabase.auth.getSession().then(({ data }) => setSessionEmail(data.session?.user.email ?? null)).catch(() => {});
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSessionEmail(currentSession?.user.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadContent() {
    if (!hasSupabaseConfig) {
      setNavItems(fallbackNavItems);
      setSettings(fallbackSettings);
      setLoadingContent(false);
      return;
    }
    try {
      const [nav, stt] = await Promise.all([
        fetchNavItems().catch(() => fallbackNavItems),
        fetchSettings().catch(() => fallbackSettings),
      ]);
      setNavItems(nav);
      setSettings(stt);
    } catch {
      setNavItems(fallbackNavItems);
      setSettings(fallbackSettings);
      setContentError('No se pudo conectar con la base de datos. Mostrando contenido de muestra.');
    } finally {
      setLoadingContent(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/');
  }

  // Determine which page to render
  const requestedSlug = currentPath === '/' || currentPath === '' ? 'inicio' : currentPath.replace(/^\//, '');
  const slug = requestedSlug === 'about-us' ? 'quienes-somos' : requestedSlug;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <TopBar
        navItems={navItems}
        settings={settings}
        onNavigate={navigate}
        onEditor={() => sessionEmail ? navigate('/admin') : setAuthOpen(true)}
        sessionEmail={sessionEmail}
        onSignOut={handleSignOut}
      />
      {currentPath === '/admin' ? (
        sessionEmail ? <CmsPanel userEmail={sessionEmail} onClose={() => navigate('/')} /> : <AdminLogin onClose={() => navigate('/')} />
      ) : currentPath === '/trabaja-con-nosotros' ? (
        <JobsPage />
      ) : currentPath === '/proyectos-recientes' ? (
        <RecentProjectsPage />
      ) : currentPath === '/historial-de-proyectos' ? (
        <ArchivedProjectsPage />
      ) : currentPath === '/convenios' ? (
        <ConveniosPage />
      ) : currentPath === '/voluntariado' ? (
        <VoluntariadoPage />
      ) : currentPath === '/transparencia' ? (
        <TransparencyPage />
      ) : (
        <DynamicPage slug={slug} />
      )}
      {currentPath !== '/admin' && <Footer navItems={navItems} settings={settings} onNavigate={navigate} />}
      {currentPath !== '/admin' && <AccessibilityWidget open={accessibilityOpen} setOpen={setAccessibilityOpen} />}
      {authOpen && <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setAuthOpen(false)} />}
      {loadingContent && <div className="fixed bottom-5 left-5 rounded-full bg-slate-900 px-4 py-2 text-xs text-white shadow-lg">Conectando contenido…</div>}
      {contentError && <div className="fixed bottom-5 left-5 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-900 shadow-lg">{contentError}</div>}
    </div>
  );
}

type AccessibilityOption = 'text-large' | 'text-small' | 'grayscale' | 'high-contrast' | 'negative-contrast' | 'light-background' | 'underline-links' | 'readable-font';

const accessibilityOptions: { key: AccessibilityOption; label: string; icon: React.ComponentType<{ size?: string | number }> }[] = [
  { key: 'text-large', label: 'Aumentar texto', icon: ZoomIn },
  { key: 'text-small', label: 'Disminuir texto', icon: ZoomOut },
  { key: 'grayscale', label: 'Escala de grises', icon: BarcodeIcon },
  { key: 'high-contrast', label: 'Alto contraste', icon: Contrast },
  { key: 'negative-contrast', label: 'Contraste negativo', icon: Eye },
  { key: 'light-background', label: 'Fondo claro', icon: Lightbulb },
  { key: 'underline-links', label: 'Subrayar enlaces', icon: Link2 },
  { key: 'readable-font', label: 'Fuente legible', icon: Type },
];

function BarcodeIcon({ size = 24 }: { size?: string | number }) {
  return <span aria-hidden="true" className="inline-flex items-center text-current" style={{ fontSize: size, letterSpacing: '-3px' }}>▥</span>;
}

function AccessibilityWidget({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  const [activeOptions, setActiveOptions] = useState<AccessibilityOption[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem('apedeca-accessibility');
    if (!saved) return;
    try {
      setActiveOptions(JSON.parse(saved) as AccessibilityOption[]);
    } catch {
      window.localStorage.removeItem('apedeca-accessibility');
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('a11y-text-large', 'a11y-text-small', 'a11y-grayscale', 'a11y-high-contrast', 'a11y-negative-contrast', 'a11y-light-background', 'a11y-underline-links', 'a11y-readable-font');
    activeOptions.forEach((option) => root.classList.add(`a11y-${option}`));
    window.localStorage.setItem('apedeca-accessibility', JSON.stringify(activeOptions));
  }, [activeOptions]);

  function toggleOption(option: AccessibilityOption) {
    setActiveOptions((current) => current.includes(option) ? current.filter((item) => item !== option) : [...current, option]);
  }

  function reset() {
    setActiveOptions([]);
  }

  return (
    <div className="fixed right-0 top-1/2 z-50 -translate-y-1/2">
      {open && (
        <div className="absolute bottom-0 right-0 w-[min(320px,calc(100vw-40px))] -translate-y-0 overflow-hidden rounded-l-sm border border-orange-500 bg-white shadow-2xl">
          <div className="border-b border-slate-200 px-5 py-5 text-lg font-semibold text-slate-800">Herramientas de accesibilidad</div>
          <div className="max-h-[min(520px,70vh)] overflow-y-auto px-5 py-3">
            {accessibilityOptions.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => toggleOption(key)} className={`flex w-full items-center gap-4 rounded px-2 py-3 text-left text-sm transition hover:bg-orange-50 ${activeOptions.includes(key) ? 'bg-orange-50 font-semibold text-orange-700' : 'text-slate-700'}`}>
                <Icon size={19} /> <span>{label}</span>
              </button>
            ))}
            <button onClick={reset} className="flex w-full items-center gap-4 rounded px-2 py-3 text-left text-sm text-slate-700 transition hover:bg-orange-50"><RotateCcw size={19} /> <span>Restablecer</span></button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className={`relative rounded-l-md bg-orange-500 p-3 text-white shadow-lg transition hover:bg-orange-600 ${open ? 'mr-[min(320px,calc(100vw-40px))]' : ''}`} aria-label={open ? 'Cerrar herramientas de accesibilidad' : 'Abrir herramientas de accesibilidad'} aria-expanded={open}>
        {open ? <X size={28} /> : <Accessibility size={28} />}
      </button>
    </div>
  );
}

/* ==================== TOP BAR ==================== */

function TopBar({ navItems, settings, onNavigate, onEditor, sessionEmail, onSignOut }: { navItems: CmsNavItem[]; settings: CmsSettings | null; onNavigate: (href: string) => void; onEditor: () => void; sessionEmail: string | null; onSignOut: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleItems = navItems.filter((i) => i.is_visible).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <header className="relative z-20 bg-white">
      <div className="border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
          <div className="hidden items-center gap-4 text-sky-600 sm:flex">
            {settings?.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer"><Facebook size={18} fill="currentColor" /></a>}
            {settings?.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer"><Instagram size={19} /></a>}
            {settings?.linkedin_url && <a href={settings.linkedin_url} target="_blank" rel="noreferrer"><Linkedin size={18} fill="currentColor" /></a>}
            {settings?.youtube_url && <a href={settings.youtube_url} target="_blank" rel="noreferrer"><Youtube size={19} fill="currentColor" /></a>}
          </div>
          <button onClick={() => onNavigate('/')} className="group flex items-center gap-2" aria-label="Apedeca inicio">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt={settings.site_name} className="h-14 w-auto" />
            ) : (
              <span className="relative flex h-14 w-16 items-center justify-center">
                <span className="absolute h-8 w-14 -rotate-12 rounded-[55%] bg-lime-400" />
                <span className="absolute h-8 w-14 rotate-12 rounded-[55%] bg-sky-600" />
                <span className="relative z-10 text-lg font-black italic tracking-tighter text-sky-700">{settings?.site_name ?? 'Apedeca'}</span>
              </span>
            )}
          </button>
          <div className="flex flex-col items-end leading-tight">
            <button onClick={() => onNavigate('/canal-de-denuncias')} className="text-[11px] font-semibold text-sky-600 transition hover:text-sky-800 sm:text-sm">Canal de Denuncias</button>
            <a href="tel:922075545" className="mt-1 flex items-center gap-1 text-[11px] text-sky-500 transition hover:text-sky-700 sm:text-sm"><Phone size={13} /> 922.075.545</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded p-2 text-slate-700 md:hidden" aria-label="Abrir menú">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
      <nav className={`${menuOpen ? 'block' : 'hidden'} border-b border-slate-100 md:block`}>
        <div className="mx-auto flex max-w-7xl flex-col items-stretch justify-center px-5 md:flex-row md:items-center md:gap-6 lg:px-10">
          {visibleItems.map((item) => {
            const href = item.external_url ?? (item.page_slug === 'inicio' ? '/' : `/${item.page_slug}`);
            return <button key={item.id} onClick={() => onNavigate(href)} className="py-3 text-center text-base transition hover:text-sky-600 md:py-5 text-slate-600">{item.label}</button>;
          })}
          <button onClick={() => onNavigate('/trabaja-con-nosotros')} className="my-2 rounded bg-lime-300 px-5 py-3 text-center font-medium text-slate-950 transition hover:bg-lime-200 md:my-0 md:ml-auto">Trabaja con nosotros</button>
          <button onClick={() => onNavigate('#contacto')} className="my-2 rounded bg-sky-500 px-5 py-3 text-center font-medium text-slate-950 transition hover:bg-sky-400 md:my-0">Contáctenos</button>
          <button onClick={onEditor} className="my-2 flex items-center justify-center gap-2 rounded border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-sky-400 hover:text-sky-600 md:my-0"><LockKeyhole size={15} /> {sessionEmail ? 'Editar web' : 'Acceso admin'}</button>
          {sessionEmail && <button onClick={onSignOut} className="py-3 text-xs text-slate-500 hover:text-red-600 md:py-0">Salir</button>}
        </div>
      </nav>
    </header>
  );
}

/* ==================== DYNAMIC PAGE RENDERER ==================== */

function DynamicPage({ slug }: { slug: string }) {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    (async () => {
      if (!hasSupabaseConfig) {
        const found = fallbackPages.find((p) => p.slug === slug);
        if (!found || !found.is_visible) { if (active) setNotFound(true); setLoading(false); return; }
        if (!active) return;
        setPage(found);
        setBlocks((fallbackBlocks[found.id] ?? []).filter((b) => b.is_visible).sort((a, b) => a.sort_order - b.sort_order));
        setLoading(false);
        return;
      }
      try {
        const found = await fetchPageBySlug(slug);
        if (!found || !found.is_visible) { if (active) setNotFound(true); return; }
        const blks = await fetchBlocks(found.id);
        if (!active) return;
        setPage(found);
        setBlocks(blks.filter((b) => b.is_visible).sort((a, b) => a.sort_order - b.sort_order));
      } catch {
        const found = fallbackPages.find((p) => p.slug === slug);
        if (found && found.is_visible && active) {
          setPage(found);
          setBlocks((fallbackBlocks[found.id] ?? []).filter((b) => b.is_visible).sort((a, b) => a.sort_order - b.sort_order));
        } else if (active) {
          setNotFound(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [slug]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-slate-400">Cargando…</div>;
  if (notFound || !page) return <NotFoundPage />;

  return (
    <main className="bg-white">
      {slug !== 'inicio' && (page.banner_image || page.title) && <PageBanner title={page.title} image={page.banner_image} />}
      {blocks.map((block) => <BlockRenderer key={block.id} block={block} />)}
    </main>
  );
}

function BlockRenderer({ block }: { block: CmsBlock }) {
  switch (block.block_type) {
    case 'hero':
      return <HeroBlock block={block} />;
    case 'text':
      return <TextBlock block={block} />;
    case 'image':
      return <ImageBlock block={block} />;
    case 'slider':
      return <SliderBlock block={block} />;
    case 'button':
      return <ButtonBlock block={block} />;
    case 'documents':
      return <DocumentsBlock block={block} />;
    case 'stats':
      return <StatsBlock block={block} />;
    case 'contact':
      return <ContactBlock />;
    case 'list':
      return <ListBlock block={block} />;
    case 'areas':
      return <AreasBlock block={block} />;
    case 'accordion':
      return <AccordionBlock block={block} />;
    case 'project-links':
      return <ProjectLinksBlock onNavigate={navigate} />;
    case 'volunteer-benefits':
      return <VolunteerBenefitsBlock block={block} />;
    case 'volunteer-process':
      return <VolunteerProcessBlock block={block} />;
    default:
      return null;
  }
}

function HeroBlock({ block }: { block: CmsBlock }) {
  return (
    <section id="inicio" className="relative flex min-h-[560px] items-center overflow-hidden bg-slate-800" style={block.image_url ? { backgroundImage: `linear-gradient(90deg, rgba(7,22,35,.8), rgba(7,22,35,.5)), url(${block.image_url})`, backgroundPosition: 'center', backgroundSize: 'cover' } : {}}>
      <div className="mx-auto w-full max-w-5xl px-6 py-24 text-center text-white">
        <div className="mx-auto mb-8 h-1 w-20 bg-lime-300" />
        <p className="mb-3 text-sm font-bold uppercase tracking-[.35em] text-lime-300">Asociación canaria</p>
        {block.title && <h1 className="text-6xl font-light tracking-tight sm:text-8xl">{block.title}</h1>}
        {block.body && <p className="mx-auto mt-5 max-w-3xl text-xl font-light leading-relaxed sm:text-2xl">{block.body}</p>}
        <button onClick={() => document.getElementById('historia')?.scrollIntoView({ behavior: 'smooth' })} className="mt-9 inline-flex items-center gap-3 rounded bg-lime-100 px-8 py-4 font-semibold text-slate-900 transition hover:-translate-y-1 hover:bg-white">Conócenos <ArrowRight size={18} /></button>
      </div>
    </section>
  );
}

function TextBlock({ block }: { block: CmsBlock }) {
  const titleWords = (block.title ?? '').split(' ');
  const titleStart = titleWords.shift();
  const titleAccent = titleWords.join(' ');

  return (
    <section id="historia" className="mx-auto grid max-w-6xl gap-14 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-10 lg:gap-20">
      <div>
        {block.title && (
          <>
            <p className="mb-3 text-sm font-bold uppercase tracking-[.25em] text-sky-600">Conócenos</p>
            <h2 className="text-4xl font-light sm:text-5xl">
              {titleStart} {titleAccent && <span className="text-lime-500">{titleAccent}</span>}
            </h2>
          </>
        )}
        {block.body && <p className="mt-8 whitespace-pre-line text-lg leading-9 text-slate-600">{block.body}</p>}
      </div>
      {block.image_url && (
        <div className="relative lg:mt-10">
          <div className="absolute -bottom-5 -left-5 h-full w-full border-2 border-lime-300" />
          <img src={block.image_url} alt={block.title ?? ''} className="relative h-[370px] w-full object-cover grayscale-[15%]" />
        </div>
      )}
    </section>
  );
}

function ListBlock({ block }: { block: CmsBlock }) {
  const items = (block.body ?? '').split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  const columns = [items.filter((_, index) => index % 2 === 0), items.filter((_, index) => index % 2 === 1)];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      {block.title && (
        <h2 className="mx-auto mb-12 w-fit border-2 border-red-500 px-8 py-4 text-center text-4xl font-light text-slate-900 sm:text-5xl">
          {block.title.split(' ').slice(0, -1).join(' ')} <span className="text-sky-500">{block.title.split(' ').slice(-1)}</span>
        </h2>
      )}
      <div className="grid gap-x-14 gap-y-8 lg:grid-cols-2">
        {columns.map((column, columnIndex) => (
          <ul key={columnIndex} className="space-y-5 text-lg leading-9 text-slate-700">
            {column.map((item, index) => <li key={`${columnIndex}-${index}`} className="flex gap-4"><span className="mt-1 text-2xl leading-none text-slate-900">•</span><span>{item}</span></li>)}
          </ul>
        ))}
      </div>
    </section>
  );
}

type AreaItem = { label: string; title: string; points: string[] };

type AccordionItem = { title: string; points: string[] };

function AreasBlock({ block }: { block: CmsBlock }) {
  const fallbackAreas: AreaItem[] = [
    { label: 'ÁREA 1: Atención Psicosocial', title: 'Atención Psicosocial', points: [] },
    { label: 'ÁREA 2: Integración y Ocio Inclusivo', title: 'Integración y Ocio Inclusivo', points: [] },
    { label: 'ÁREA 3: Inserción Laboral y Formación', title: 'Inserción Laboral y Formación', points: ['Programas de inserción laboral', 'Formación profesional especializada', 'Creación de empleo para personas dependientes'] },
  ];
  const areas = parseJson<AreaItem[]>(block.body, fallbackAreas);
  const [activeIndex, setActiveIndex] = useState(2);
  const activeArea = areas[activeIndex] ?? areas[0];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <h2 className="mb-10 text-center text-4xl font-light text-slate-900 sm:text-5xl">+ {block.title ?? 'Áreas de Actuación'}</h2>
      <div className="flex flex-wrap justify-center gap-3">
        {areas.map((area, index) => (
          <button key={area.label} onClick={() => setActiveIndex(index)} className={`px-5 py-3 text-lg transition ${activeIndex === index ? 'rounded-md bg-sky-500 text-slate-950' : 'text-sky-600 hover:text-sky-800'}`}>
            {area.label}
          </button>
        ))}
      </div>
      {activeArea && (
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <h3 className="max-w-xl text-4xl font-light leading-tight text-slate-900 sm:text-5xl"><span className="text-sky-500">{activeArea.title.split(' ').slice(0, -1).join(' ')}</span> {activeArea.title.split(' ').slice(-1)}</h3>
            <ul className="mt-10 space-y-4 text-xl leading-9 text-slate-700">
              {activeArea.points.map((point) => <li key={point}>- {point}</li>)}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function AccordionBlock({ block }: { block: CmsBlock }) {
  const fallbackItems: AccordionItem[] = [
    { title: 'Registros y Inscripciones', points: [] },
    { title: 'Certificaciones de Calidad', points: [] },
    { title: 'Menciones y Reconocimientos', points: ['Declarada de Interés Público Municipal por la Ciudad de Santa Cruz de Tenerife', 'Reconocida como entidad de referencia en el ámbito de la dependencia', 'Reconocimiento por el compromiso de Barrios por el Empleo: Juntos más fuertes en 2020'] },
  ];
  const items = parseJson<AccordionItem[]>(block.body, fallbackItems);
  const [openIndex, setOpenIndex] = useState(2);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <h2 className="mb-10 text-center text-4xl font-light text-slate-900 sm:text-5xl">Reconocimientos y <span className="text-sky-500">Acreditaciones Oficiales</span></h2>
      <div className="overflow-hidden rounded-md border border-lime-500">
        {items.map((item, index) => (
          <div key={item.title}>
            <button onClick={() => setOpenIndex(openIndex === index ? -1 : index)} className={`flex w-full items-center gap-4 px-6 py-5 text-left text-xl font-semibold ${index === 1 ? 'bg-sky-500 text-white' : 'bg-lime-300 text-sky-600'}`}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-white">{openIndex === index ? '−' : '+'}</span>{item.title}
            </button>
            {openIndex === index && <ul className="space-y-4 bg-lime-50 px-12 py-6 text-lg leading-8 text-slate-800">{item.points.map((point) => <li key={point} className="list-disc">{point}</li>)}</ul>}
          </div>
        ))}
      </div>
    </section>
  );
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed as T;
  } catch {
    return fallback;
  }
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function ProjectLinksBlock({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-16 px-6 py-28 sm:grid-cols-2 lg:gap-32 lg:px-10">
        <button onClick={() => onNavigate('/proyectos-recientes')} className="group flex flex-col items-center text-center transition hover:-translate-y-2">
          <ClipboardCheck size={122} strokeWidth={1.5} className="text-sky-600 transition group-hover:scale-105" />
          <h2 className="mt-7 text-4xl font-light text-sky-600 sm:text-5xl">Proyectos <span className="font-semibold text-sky-500">Recientes</span></h2>
        </button>
        <button onClick={() => onNavigate('/historial-de-proyectos')} className="group flex flex-col items-center text-center transition hover:-translate-y-2">
          <FolderCog size={122} strokeWidth={1.5} className="text-lime-500 transition group-hover:scale-105" />
          <h2 className="mt-7 text-4xl font-light text-sky-600 sm:text-5xl">Historial de <span className="font-semibold text-lime-500">proyectos</span></h2>
        </button>
      </section>
      <ProjectsSliderSection />
    </>
  );
}

function ProjectsSliderSection() {
  const [active, setActive] = useState<ApeProject[]>([]);
  const [archived, setArchived] = useState<ApeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [selectedArchivedYear, setSelectedArchivedYear] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchProjects('active'), fetchProjects('archived')])
      .then(([a, ar]) => {
        setActive(a.filter((p) => p.is_visible));
        setArchived(ar.filter((p) => p.is_visible));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-16 text-center text-slate-400">Cargando proyectos…</div>;

  const archivedYears = [...new Set(archived.map((project) => project.year).filter((year): year is number => year !== null && year >= 2020))].sort((a, b) => b - a);
  const activeArchivedYear = selectedArchivedYear && archivedYears.includes(selectedArchivedYear) ? selectedArchivedYear : archivedYears[0] ?? null;
  const visibleArchived = activeArchivedYear === null ? [] : archived.filter((project) => project.year === activeArchivedYear);

  return (
    <>
      {active.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
          <h2 className="mb-6 text-center text-3xl font-light text-slate-900 sm:text-4xl">Proyectos <span className="text-lime-600">recientes</span></h2>
          <div className="relative overflow-hidden rounded-2xl">
            <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${offset * 100}%)` }}>
              {active.map((project) => (
                <div key={project.id} className="min-w-full">
                  <div className="relative h-[420px] overflow-hidden sm:h-[500px]">
                    <img src={project.image_url} alt={project.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                    {project.logo_url && (
                      <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
                        <img src={project.logo_url} alt="" className="h-16 w-auto object-contain drop-shadow-lg sm:h-20" style={{ filter: 'brightness(0) invert(1)' }} />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
                      {project.year && <span className="mb-3 inline-block rounded-full bg-lime-400 px-4 py-1 text-sm font-bold text-slate-950">{project.year}</span>}
                      <h3 className="text-2xl font-light text-white sm:text-4xl">{project.title}</h3>
                      {project.description && <p className="mt-3 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">{project.description}</p>}
                      {project.start_date && project.end_date && (
                        <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                          <Clock3 size={15} /> {formatDate(project.start_date)} - {formatDate(project.end_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {active.length > 1 && (
              <>
                <button onClick={() => setOffset((offset - 1 + active.length) % active.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-700 shadow-lg transition hover:bg-white" aria-label="Anterior"><ChevronLeft size={24} /></button>
                <button onClick={() => setOffset((offset + 1) % active.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-700 shadow-lg transition hover:bg-white" aria-label="Siguiente"><ChevronRight size={24} /></button>
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {active.map((_, i) => (
                    <button key={i} onClick={() => setOffset(i)} className={`h-2.5 rounded-full transition-all ${i === offset ? 'w-8 bg-lime-400' : 'w-2.5 bg-white/60'}`} aria-label={`Ir a ${i + 1}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {archived.length > 0 && (
        <section className="bg-slate-50 px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-center text-3xl font-light text-slate-900 sm:text-4xl">Proyectos <span className="text-lime-600">finalizados</span></h2>
            {archivedYears.length > 0 && (
              <div className="mb-10 flex flex-wrap justify-center gap-3" role="tablist" aria-label="Filtrar proyectos por año">
                {archivedYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedArchivedYear(year)}
                    className={`rounded-full px-6 py-3 text-base font-semibold transition ${activeArchivedYear === year ? 'bg-sky-600 text-white shadow-md' : 'border border-sky-200 bg-white text-sky-700 hover:border-sky-500 hover:bg-sky-50'}`}
                    role="tab"
                    aria-selected={activeArchivedYear === year}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
            {visibleArchived.length === 0 ? (
              <p className="py-10 text-center text-slate-500">No hay proyectos finalizados para este año.</p>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {visibleArchived.map((project) => (
                <article key={project.id} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-52 overflow-hidden">
                    <img src={project.image_url} alt={project.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                    {project.year && <span className="absolute bottom-3 left-3 rounded-full bg-lime-400 px-3 py-1 text-xs font-bold text-slate-950">{project.year}</span>}
                    <span className="absolute top-3 right-3 rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white">Finalizado</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900">{project.title}</h3>
                    {project.description && <p className="mt-2 leading-7 text-slate-600">{project.description}</p>}
                    {project.start_date && project.end_date && (
                      <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                        <Clock3 size={15} /> {formatDate(project.start_date)} - {formatDate(project.end_date)}
                      </p>
                    )}
                  </div>
                </article>
              ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

function ImageBlock({ block }: { block: CmsBlock }) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      {block.image_url && <img src={block.image_url} alt={block.title ?? ''} className="h-[400px] w-full rounded-xl object-cover shadow-lg" />}
      {block.title && <h3 className="mt-6 text-center text-2xl font-light text-slate-900">{block.title}</h3>}
      {block.body && <p className="mt-3 text-center text-slate-500">{block.body}</p>}
    </section>
  );
}

function SliderBlock({ block }: { block: CmsBlock }) {
  const [offset, setOffset] = useState(0);
  const [docs, setDocs] = useState<CmsDocument[]>([]);

  useEffect(() => {
    fetchDocuments(block.id).then(setDocs).catch(() => {});
  }, [block.id]);

  const items = docs.length > 0 ? docs : [];
  const hasItems = items.length > 0;

  if (!hasItems) return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      {block.title && <h2 className="mb-8 text-center text-4xl font-light text-slate-900">{block.title}</h2>}
      <div className="flex items-center justify-center rounded-xl bg-slate-50 p-12 text-slate-400">
        {block.body ?? 'Próximamente: slider de contenido'}
      </div>
    </section>
  );

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      {block.title && <h2 className="mb-8 text-center text-4xl font-light text-slate-900">{block.title}</h2>}
      <div className="relative overflow-hidden rounded-xl">
        <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${offset * 100}%)` }}>
          {items.map((doc) => (
            <div key={doc.id} className="min-w-full">
              <div className="mx-2 flex flex-col items-center rounded-xl bg-white p-8 shadow-lg">
                <FileText size={48} className="mb-4 text-sky-600" />
                <h3 className="text-xl font-semibold text-slate-900">{doc.title}</h3>
                <a href={getDocumentUrl(doc.file_path)} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 rounded-lg bg-sky-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-400">
                  <Download size={18} /> Descargar
                </a>
              </div>
            </div>
          ))}
        </div>
        {items.length > 1 && (
          <>
            <button onClick={() => setOffset((offset - 1 + items.length) % items.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 shadow transition hover:bg-white" aria-label="Anterior"><ChevronLeft size={22} /></button>
            <button onClick={() => setOffset((offset + 1) % items.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 shadow transition hover:bg-white" aria-label="Siguiente"><ChevronRight size={22} /></button>
          </>
        )}
      </div>
    </section>
  );
}

function ButtonBlock({ block }: { block: CmsBlock }) {
  const isExternal = block.image_url?.startsWith('http');
  return (
    <section className="bg-sky-50 px-6 py-16 text-center lg:px-10">
      <div className="mx-auto max-w-3xl">
        {block.title && <h2 className="mb-4 text-3xl font-light text-slate-900">{block.title}</h2>}
        <a
          href={block.image_url ?? '#contacto'}
          {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
          className="inline-flex items-center gap-3 rounded-lg bg-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-orange-600"
        >
          {block.body ?? 'Ver más'} <ExternalLink size={20} />
        </a>
      </div>
    </section>
  );
}

function DocumentsBlock({ block }: { block: CmsBlock }) {
  const [docs, setDocs] = useState<CmsDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments(block.id).then(setDocs).catch(() => {}).finally(() => setLoading(false));
  }, [block.id]);

  return (
    <section className="bg-slate-50 px-6 py-16 lg:px-10">
      <div className="mx-auto max-w-4xl">
        {block.title && <h2 className="mb-2 text-center text-4xl font-light text-slate-900">{block.title}</h2>}
        {block.body && <p className="mb-8 text-center text-slate-500">{block.body}</p>}
        {loading ? (
          <p className="text-center text-slate-400">Cargando documentos…</p>
        ) : docs.length === 0 ? (
          <p className="text-center text-slate-400">No hay documentos disponibles.</p>
        ) : (
          <div className="space-y-3">
            {docs.map((doc) => (
              <a key={doc.id} href={getDocumentUrl(doc.file_path)} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600"><FileText size={24} /></div>
                <span className="flex-1 font-semibold text-slate-900">{doc.title}</span>
                <Download size={20} className="text-sky-600" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

type VolunteerBenefit = { icon: 'building' | 'award' | 'badge' | 'shield' | 'graduation'; title: string; detail: string };

function VolunteerBenefitsBlock({ block }: { block: CmsBlock }) {
  const fallback: VolunteerBenefit[] = [];
  const benefits = parseJson<VolunteerBenefit[]>(block.body, fallback);
  const icons = { building: Building2, award: Award, badge: BadgeCheck, shield: BadgeCheck, graduation: GraduationCap } as const;
  return (
    <section className="border-b border-slate-100 bg-white px-6 py-14 lg:px-10 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        {benefits.map((benefit) => {
          const Icon = icons[benefit.icon] ?? BadgeCheck;
          return <article key={`${benefit.title}-${benefit.detail}`} className="group text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 transition group-hover:-translate-y-1 group-hover:bg-sky-100"><Icon size={42} strokeWidth={1.6} className="text-sky-500" /></div><p className="mt-5 text-base leading-7 text-slate-700">{benefit.title}</p><p className="mt-1 font-semibold leading-7 text-sky-500">{benefit.detail}</p></article>;
        })}
      </div>
      {block.title && <p className="mx-auto mt-12 max-w-4xl text-center text-sm leading-6 text-slate-500">{block.title}</p>}
    </section>
  );
}

type VolunteerProcessStep = { side: 'left' | 'right'; title: string; points: string[]; tone: 'blue' | 'green' };

function VolunteerProcessBlock({ block }: { block: CmsBlock }) {
  const content = parseJson<{ steps: VolunteerProcessStep[]; closing: string }>(block.body, { steps: [], closing: '' });
  return (
    <section className="border-t border-slate-100 bg-white px-6 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="relative space-y-10 before:absolute before:bottom-8 before:left-1/2 before:top-0 before:hidden before:w-px before:bg-slate-300 md:before:block">
          {content.steps.map((step, index) => {
            const isRight = step.side === 'right';
            return <div key={`${step.title}-${index}`} className="relative grid gap-6 md:grid-cols-2 md:gap-20">
              <div className={isRight ? 'md:col-start-2' : ''}>
                <div className={`rounded-sm border-2 p-5 ${step.tone === 'green' ? 'border-lime-300 bg-lime-50' : 'border-sky-400 bg-sky-50'}`}>
                  <h3 className={`text-xl font-semibold ${step.tone === 'green' ? 'text-lime-600' : 'text-sky-600'}`}>{step.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{step.points.map((point) => <li key={point}>- {point}</li>)}</ul>
                </div>
              </div>
              <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center md:flex"><span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${step.tone === 'green' ? 'bg-lime-400' : 'bg-sky-400'}`}>{index + 1}</span></div>
            </div>;
          })}
        </div>
        {content.closing && <div className="mt-12 text-center"><h3 className="text-lg font-bold uppercase tracking-wide text-slate-800"><span className="text-sky-500">Compromiso</span> requerido</h3><p className="mx-auto mt-3 max-w-4xl text-sm leading-7 text-slate-600">{content.closing}</p></div>}
      </div>
    </section>
  );
}

function StatsBlock({ block }: { block: CmsBlock }) {
  const stats = block.body ? block.body.split('\n').filter(Boolean) : ['+12 años acompañando', '7 islas conectadas', '100% compromiso social'];
  return (
    <section className="bg-lime-200">
      <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-lime-300 px-6 py-7 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat, i) => {
          const [number, ...rest] = stat.split(' ');
          return (
            <div key={i} className="flex items-center justify-center gap-3 py-4 text-center sm:flex-col sm:py-2">
              <strong className="text-3xl font-light text-slate-900">{number}</strong>
              <span className="text-sm text-slate-700">{rest.join(' ')}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ContactBlock() {
  return (
    <section id="contacto" className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2 lg:px-10">
      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[.25em] text-sky-600">Estamos para ayudarte</p>
        <h2 className="text-4xl font-light sm:text-5xl">Contáctenos</h2>
        <p className="mt-7 max-w-md leading-8 text-slate-600">Si tienes alguna pregunta sobre nuestros servicios, proyectos o formas de colaborar, escríbenos. Te responderemos lo antes posible.</p>
        <div className="mt-9 space-y-5 text-slate-700">
          <div className="flex items-center gap-4"><Mail className="text-sky-500" /> info@apedeca.es</div>
          <div className="flex items-center gap-4"><Phone className="text-sky-500" /> 922 07 55 45</div>
          <div className="flex items-center gap-4"><Clock3 className="text-sky-500" /> Lunes a viernes, 9:00 – 14:00</div>
        </div>
      </div>
      <form className="space-y-5 rounded-lg bg-slate-50 p-7 sm:p-9" onSubmit={(event) => event.preventDefault()}>
        <input className="w-full border-0 border-b border-slate-300 bg-transparent px-1 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-500" placeholder="Tu nombre" />
        <input className="w-full border-0 border-b border-slate-300 bg-transparent px-1 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-500" placeholder="Tu correo electrónico" type="email" />
        <textarea className="min-h-32 w-full resize-none border-0 border-b border-slate-300 bg-transparent px-1 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-500" placeholder="¿En qué podemos ayudarte?" />
        <button className="rounded bg-sky-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-400">Enviar mensaje</button>
      </form>
    </section>
  );
}

function PageBanner({ title, image }: { title: string; image: string | null }) {
  return (
    <section className="relative flex h-64 items-center justify-center overflow-hidden bg-sky-700" style={image ? { backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.28), rgba(15,23,42,.18)), url(${image})`, backgroundPosition: 'center', backgroundSize: 'cover' } : undefined}>
      <h1 className="relative text-5xl font-light tracking-wide text-white sm:text-7xl">{title}</h1>
    </section>
  );
}

function NotFoundPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-light text-slate-300">404</h1>
      <p className="mt-4 text-xl text-slate-500">La página que buscas no existe o no está visible.</p>
      <a href="/" className="mt-8 rounded-lg bg-sky-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-400" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); window.scrollTo(0, 0); }}>Volver al inicio</a>
    </main>
  );
}

/* ==================== TRANSPARENCY ==================== */

const transparencyDownloadClass = 'inline-flex rounded-sm bg-sky-500 px-5 py-3 text-lg text-slate-950 transition hover:bg-sky-400';

const transparencyIconMap: Record<string, typeof FileText> = {
  FileText,
  UsersRound,
  ClipboardCheck,
  Download,
  Briefcase,
  Check,
  Eye,
  Handshake,
  GraduationCap,
};

function TransparencyAccordion({ items, reverseColors = false }: { items: { title: string; body?: string | null; downloadLabel?: string | null; docs?: TransparencyDoc[]; isOpenByDefault?: boolean }[]; reverseColors?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number>(() => items.findIndex((item) => item.isOpenByDefault));

  return (
    <div className="overflow-hidden rounded-sm border border-sky-500">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.title}>
            <button type="button" onClick={() => setOpenIndex(open ? -1 : index)} aria-expanded={open} className={`flex w-full items-center gap-3 px-4 py-3 text-left text-base font-semibold text-white transition sm:px-5 ${(reverseColors ? index % 2 !== 0 : index % 2 === 0) ? 'bg-sky-500 hover:bg-sky-600' : 'bg-lime-400 hover:bg-lime-500'}`}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-500/80 text-sm leading-none">{open ? '−' : '+'}</span>
              <span>{item.title}</span>
            </button>
            {open && (
              <div className="border-t border-sky-300 bg-sky-50 px-5 py-5 text-slate-700 sm:px-8">
                {item.body && <p className="whitespace-pre-line leading-8">{item.body}</p>}
                {item.docs && item.docs.length > 0 && (
                  <div className="mt-4 flex flex-col items-start gap-3">
                    {item.docs.map((doc) => (
                      <a key={doc.id} href={doc.file_path ? getTransparencyDocUrl(doc.file_path) : '#'} target="_blank" rel="noopener noreferrer" className={`${transparencyDownloadClass} px-3 py-2 text-base`}>{doc.title}</a>
                    ))}
                  </div>
                )}
                {item.downloadLabel && (
                  <a href="#" className={`${transparencyDownloadClass} mt-4`}>{item.downloadLabel}</a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TransparencyPanel({ title, accent, meta, children }: { title: string; accent: string; meta?: string | null; children: ReactNode }) {
  const titleStart = title.replace(accent, '').trim();
  return (
    <section className="mx-auto max-w-5xl border-t border-slate-100 px-5 py-14 sm:px-8 sm:py-16">
      <h2 className="text-center text-4xl font-light leading-tight text-lime-700 sm:text-5xl">{titleStart} <span className="text-sky-600">{accent}</span></h2>
      {meta && <p className="mt-3 text-center italic text-slate-700">{meta}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function TransparencySectionView({ section, items, docsByItem }: { section: TransparencySection; items: TransparencyItem[]; docsByItem: Record<string, TransparencyDoc[]> }) {
  const accordionItems = items.map((item) => ({
    title: item.title,
    body: item.body,
    downloadLabel: item.download_label,
    docs: docsByItem[item.id] ?? [],
    isOpenByDefault: item.is_open_by_default,
  }));

  const isMemorias = section.label === 'Memorias Anuales';

  if (isMemorias) {
    return (
      <TransparencyPanel title="Memorias anuales" accent="anuales">
        <p className="mx-auto max-w-4xl text-center leading-8 text-slate-700">Apedeca dentro de su plan de transparencia, publica nuestra memoria de actividades de cada año, haciendo repaso a todos los proyectos iniciados o continuados a lo largo del mismo. A continuación puede consultar y/o descargar las memorias de cada año.</p>
        <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const yearMatch = item.title.match(/(\d{4})/);
            const year = yearMatch ? yearMatch[1] : '';
            const doc = (docsByItem[item.id] ?? [])[0];
            return (
              <div key={item.id} className="flex flex-col items-center text-center">
                <div className="relative flex h-20 w-24 items-center justify-center" aria-hidden="true">
                  <span className="absolute h-8 w-16 -rotate-12 rounded-[55%] bg-lime-400" />
                  <span className="absolute h-8 w-16 rotate-12 rounded-[55%] bg-sky-600" />
                  <span className="relative z-10 text-[10px] font-bold italic text-white">Apedeca</span>
                </div>
                <h3 className="mt-3 text-2xl font-medium text-sky-600">Memoria <span className="text-lime-500">{year}</span></h3>
                <a href={doc?.file_path ? getTransparencyDocUrl(doc.file_path) : '#'} target="_blank" rel="noopener noreferrer" className={`${transparencyDownloadClass} mt-4 px-4 py-2 text-sm`}>{item.download_label ?? `Descargar memoria ${year}`}</a>
              </div>
            );
          })}
        </div>
      </TransparencyPanel>
    );
  }

  const isContratos = section.label === 'Contratos';
  if (isContratos && items.length > 0 && !items[0].body && !items[0].download_label) {
    // fallback for empty body
  }

  const isEvaluacion = section.label === 'Evaluación de transparencia';

  return (
    <TransparencyPanel title={section.label} accent={section.label.split(' ').pop() ?? section.label} meta={section.meta}>
      {items.length === 0 ? (
        <div className="rounded-sm border border-dashed border-sky-300 bg-sky-50 px-6 py-10 text-center text-slate-600">Este apartado está preparado para añadir su información y documentos desde el CMS.</div>
      ) : items.length === 1 && items[0].body && !items[0].download_label && (docsByItem[items[0].id] ?? []).length === 0 ? (
        <p className="leading-8 text-slate-700">{items[0].body}</p>
      ) : (
        <TransparencyAccordion reverseColors={section.tone === 'lime'} items={accordionItems} />
      )}
      {isEvaluacion && (
        <div className="mt-8 text-center">
          <p className="text-slate-700">Para más información:</p>
          <div className="mx-auto mt-4 flex w-fit items-center gap-3 text-left text-slate-600">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-amber-400 text-3xl font-semibold text-slate-500">C</span>
            <span className="text-sm font-semibold uppercase leading-tight tracking-wide">Comisionado de<br />Transparencia<br /><span className="text-xs font-normal tracking-normal">Canarias en claro</span></span>
          </div>
        </div>
      )}
    </TransparencyPanel>
  );
}

function TransparencyPage() {
  const [sections, setSections] = useState<TransparencySection[]>([]);
  const [itemsBySection, setItemsBySection] = useState<Record<string, TransparencyItem[]>>({});
  const [docsByItem, setDocsByItem] = useState<Record<string, TransparencyDoc[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const secs = await fetchTransparencySections();
        const visible = secs.filter((s) => s.is_visible).sort((a, b) => a.sort_order - b.sort_order);
        if (!active) return;
        setSections(visible);
        if (visible.length > 0) setSelectedLabel(visible[0].label);
      } catch {
        if (active) setError('No se pudo cargar el contenido de transparencia.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedLabel) return;
    const section = sections.find((s) => s.label === selectedLabel);
    if (!section || loadedSections.has(section.id)) return;
    setLoadedSections((prev) => new Set(prev).add(section.id));

    let active = true;
    (async () => {
      try {
        const items = (await fetchTransparencyItems(section.id)).sort((a, b) => a.sort_order - b.sort_order);
        if (!active) return;
        setItemsBySection((prev) => ({ ...prev, [section.id]: items }));

        const docResults = await Promise.all(items.map((item) => fetchTransparencyDocs(item.id)));
        if (!active) return;
        const docsMap: Record<string, TransparencyDoc[]> = {};
        items.forEach((item, i) => {
          docsMap[item.id] = docResults[i].sort((a, b) => a.sort_order - b.sort_order);
        });
        setDocsByItem((prev) => ({ ...prev, ...docsMap }));
      } catch {
      }
    })();
    return () => { active = false; };
  }, [selectedLabel, sections, loadedSections]);

  function selectSection(label: string) {
    setSelectedLabel(label);
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-slate-400">Cargando transparencia…</div>;
  if (error) return <div className="flex min-h-[60vh] items-center justify-center text-red-500">{error}</div>;

  return (
    <main className="bg-white">
      <PageBanner title="TRANSPARENCIA" image="https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=1600" />
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid grid-cols-2 gap-x-5 gap-y-14 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-10 lg:gap-y-16">
          {sections.map((sec) => {
            const Icon = transparencyIconMap[sec.icon_name] ?? FileText;
            return (
              <button key={sec.id} type="button" onClick={() => selectSection(sec.label)} aria-pressed={selectedLabel === sec.label} className={`group flex min-h-36 flex-col items-center justify-start rounded-sm border-2 px-3 py-4 text-center transition hover:-translate-y-2 ${selectedLabel === sec.label ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-transparent hover:border-sky-200'}`}>
                <Icon size={64} strokeWidth={1.7} className={`transition group-hover:scale-110 ${sec.tone === 'blue' ? 'text-sky-600' : 'text-lime-500'}`} />
                <span className="mt-4 text-base font-semibold leading-6 text-sky-600 sm:text-lg">{sec.label}</span>
              </button>
            );
          })}
        </div>
      </section>
      {selectedLabel && (
        <div id="transparency-selected" className="scroll-mt-8">
          {(() => {
            const section = sections.find((item) => item.label === selectedLabel);
            return section ? <TransparencySectionView section={section} items={itemsBySection[section.id] ?? []} docsByItem={docsByItem} /> : null;
          })()}
        </div>
      )}
    </main>
  );
}

/* ==================== VOLUNTARIADO ==================== */

const voluntariadoIcons = [Accessibility, UsersRound, ClipboardCheck] as const;

function VoluntariadoPage() {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const p = await fetchPageBySlug('voluntariado');
        if (p) {
          setPage(p);
          const blks = await fetchBlocks(p.id);
          setBlocks(blks.filter((b) => b.is_visible).sort((a, b) => a.sort_order - b.sort_order));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-slate-400">Cargando…</div>;

  const tabs = blocks.filter((b) => b.block_type === 'text');
  const contactBlock = blocks.find((b) => b.block_type === 'contact');
  const benefitsBlock = blocks.find((b) => b.block_type === 'volunteer-benefits');
  const processBlock = blocks.find((b) => b.block_type === 'volunteer-process');
  const activeTab = tabs[selectedTab];

  return (
    <main className="bg-white">
      <section className="relative h-[300px] overflow-hidden sm:h-[390px]">
        {page?.banner_image && <img src={page.banner_image} alt={page.title} className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <div>
            <div className="mx-auto mb-6 h-1 w-24 bg-lime-400" />
            <p className="text-sm font-bold uppercase tracking-[.35em] text-lime-300">Asociación Canaria</p>
            <h1 className="mt-3 text-4xl font-light uppercase tracking-[.08em] text-white sm:text-6xl">{page?.title ?? 'Voluntariado'}</h1>
            {page?.subtitle && <p className="mt-4 text-lg font-light text-slate-200">{page.subtitle}</p>}
          </div>
        </div>
      </section>
      {benefitsBlock && <VolunteerBenefitsBlock block={benefitsBlock} />}
      {tabs.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {tabs.map((tab, index) => {
              const Icon = voluntariadoIcons[index % voluntariadoIcons.length];
              return (
                <button key={tab.id} type="button" onClick={() => setSelectedTab(index)} aria-pressed={selectedTab === index} className={`group min-h-44 rounded-sm border-2 px-6 py-7 text-center transition hover:-translate-y-1 ${selectedTab === index ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-slate-100 bg-white hover:border-sky-200'}`}>
                  <Icon size={58} strokeWidth={1.6} className={`mx-auto transition group-hover:scale-110 ${selectedTab === index ? 'text-sky-600' : 'text-lime-500'}`} />
                  <span className="mt-5 block text-lg font-semibold leading-7 text-sky-600">{tab.title}</span>
                </button>
              );
            })}
          </div>
          {activeTab && (
            <div className="mt-16 border-t border-slate-100 pt-14">
              <div className="mx-auto max-w-4xl text-center">
                <p className="text-sm font-bold uppercase tracking-[.25em] text-sky-600">{activeTab.title}</p>
                {activeTab.title && <h2 className="mt-3 text-4xl font-light text-slate-900 sm:text-5xl">{activeTab.title}</h2>}
                {activeTab.body && <p className="mt-7 whitespace-pre-line text-lg leading-9 text-slate-600">{activeTab.body}</p>}
                <a href="#contacto" className="mt-8 inline-flex rounded bg-sky-500 px-7 py-3 font-semibold text-slate-950 transition hover:bg-sky-400">Quiero participar</a>
              </div>
            </div>
          )}
        </section>
      )}
      {processBlock && <VolunteerProcessBlock block={processBlock} />}
      {contactBlock ? <ContactBlock /> : (
        <section id="contacto" className="border-t border-slate-100 bg-slate-50 px-6 py-16 text-center">
          <p className="text-sm font-bold uppercase tracking-[.25em] text-sky-600">APEDECA</p>
          <h2 className="mt-3 text-3xl font-light text-slate-900">Contamos contigo</h2>
          <a href="mailto:info@apedeca.es" className="mt-6 inline-flex rounded bg-sky-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-400">Escribirnos</a>
        </section>
      )}
    </main>
  );
}

/* ==================== CONVENIOS ==================== */

const convenioItems = [
  { label: 'Voluntariado', icon: Accessibility, tone: 'blue', href: '#voluntariado' },
  { label: 'Formación', icon: GraduationCap, tone: 'lime', href: '#contacto' },
  { label: 'Inserción laboral', icon: Handshake, tone: 'blue', href: '#contacto' },
  { label: 'Diversidad Funcional y Mayores', icon: UsersRound, tone: 'lime', href: '#contacto' },
  { label: 'Inscripciones', icon: ClipboardCheck, tone: 'blue', href: '#inscripciones' },
  { label: 'Otras colaboraciones', icon: FileText, tone: 'lime', href: '#contacto' },
] as const;

function ConvenioCategory({ title, items, id, visible = true }: { title: string; items: { title: string; body: string }[]; id?: string; visible?: boolean }) {
  return (
    <section id={id} className={`${visible ? '' : 'hidden'} mt-20 first:mt-14`}>
      <h2 className="mx-auto w-fit border-b-2 border-lime-400 px-10 pb-3 text-center text-4xl font-light text-slate-900 sm:text-5xl">{title}</h2>
      <div className="mt-12 grid gap-x-10 gap-y-14 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.title} className="rounded-sm px-2 py-2">
            <h3 className="text-2xl font-semibold uppercase leading-tight text-slate-900">{item.title}</h3>
            <p className="mt-5 whitespace-pre-line text-lg leading-9 text-slate-600">{item.body}</p>
            <a href="#contacto" className="mt-6 inline-flex rounded bg-sky-500 px-7 py-3 text-lg text-slate-950 transition hover:bg-sky-400">Descubre más</a>
          </article>
        ))}
      </div>
    </section>
  );
}

function ConveniosPage() {
  const [selectedCategory, setSelectedCategory] = useState('Voluntariado');

  return (
    <main className="bg-white">
      <PageBanner title="CONVENIOS" image="https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=1600" />
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-8 lg:gap-y-10">
          {convenioItems.map(({ label, icon: Icon, tone }) => (
            <button key={label} type="button" onClick={() => setSelectedCategory(label)} aria-pressed={selectedCategory === label} className={`group flex min-h-40 flex-col items-center justify-start rounded-sm border-2 px-4 py-5 text-center transition hover:-translate-y-2 ${selectedCategory === label ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-transparent hover:border-sky-200'}`}>
              <Icon size={70} strokeWidth={1.6} className={`transition group-hover:scale-110 ${tone === 'blue' ? 'text-sky-600' : 'text-lime-500'}`} />
              <span className="mt-5 text-lg font-semibold leading-6 text-sky-600 sm:text-xl">{label}</span>
            </button>
          ))}
        </div>
      </section>
      <section id="voluntariado" className={`${selectedCategory === 'Voluntariado' ? '' : 'hidden'} border-t border-slate-100 px-6 py-20 lg:px-10`}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.25em] text-sky-600">Voluntariado</p>
            <h2 className="mt-3 text-4xl font-light text-slate-900 sm:text-5xl">Oficina del voluntariado</h2>
            <p className="mt-6 text-lg leading-9 text-slate-600">A través del Cabildo de Tenerife y Sinpromi se gestiona esta oficina del voluntariado, en la que nuestra organización está dada de alta desde el 29 de julio de 2013, apoyando y beneficiándonos de la amplia red de voluntariado.</p>
            <a href="#contacto" className="mt-7 inline-flex rounded bg-sky-500 px-7 py-3 font-semibold text-slate-950 transition hover:bg-sky-400">Descubre más</a>
          </div>
          <div className="rounded-2xl bg-sky-50 p-8 text-center"><div className="text-7xl font-light text-sky-600">♥</div><p className="mt-4 text-xl font-semibold text-sky-700">Tenerife Isla Solidaria</p><p className="mt-2 text-slate-600">Una red para compartir, ayudar y construir una sociedad más comprometida.</p></div>
        </div>
      </section>
      <section className="border-t border-slate-100 bg-white px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-bold uppercase tracking-[.25em] text-sky-600">Nuestros convenios</p>
          <h2 className="mt-3 text-center text-4xl font-light text-slate-900 sm:text-5xl">Colaboraciones que transforman</h2>
          <ConvenioCategory visible={selectedCategory === 'Voluntariado'} title="Voluntariado" items={[
            { title: 'Federación «Plataforma de Entidades de Voluntariado de Canarias»', body: 'Organización que aúna a todas aquellas entidades que se dedican al voluntariado en la provincia de Santa Cruz de Tenerife, entre ellas APEDECA, asociada desde el 12 de junio de 2017. En julio de 2023 se firmó una colaboración para la modernización y digitalización del voluntariado de nuestra entidad.' },
            { title: 'Santa Cruz Solidaria', body: 'Desde el año 2022 formamos parte de la red de entidades de voluntariado y comunitarias del municipio de Santa Cruz de Tenerife, con el fin de visibilizar, fomentar y fortalecer la red municipal.' },
          ]} />
          <ConvenioCategory visible={selectedCategory === 'Formación'} title="Formación" items={[
            { title: 'Radio ECCA', body: 'Desde el 13 de noviembre de 2015 hemos sellado un convenio de colaboración con esta empresa referente en la formación en Canarias desde hace más de 60 años. Desde entonces hemos desarrollado varias acciones conjuntas de formación para beneficiar al colectivo discapacitado.' },
            { title: 'Círculo de Estudios Divulgación Dinámica', body: 'Empresa de formación y producción educativa especializada en Ciencias Sociales a nivel nacional. El 13 de abril de 2016 se firmó un convenio de colaboración para la donación de cursos del ámbito social, que han aprovechado el personal y voluntariado de nuestra entidad.' },
            { title: 'Adhesión al Proyecto Fórmate', body: 'APEDECA se ha adherido al Proyecto Fórmate, promovido por Radio ECCA y Fundación Canaria, dirigido a población sin Graduado en Educación Secundaria para orientar y facilitar la obtención de la titulación. Incluye atención y asesoramiento personalizado, tutorización, formación a distancia y flexibilidad horaria.' },
          ]} />
          <ConvenioCategory visible={selectedCategory === 'Inserción laboral'} title="Inserción laboral" items={[
            { title: 'Serca Gestión', body: 'El 1 de octubre de 2012, nuestra ONG firma un convenio de colaboración con esta entidad que presta servicios en el ámbito social. Desde entonces se han logrado tres contrataciones de personas con discapacidad a través de nuestra organización.' },
            { title: 'Drago Integral', body: 'Entidad registrada como Centro Especial de Empleo dedicada a los servicios de limpieza, mantenimiento y jardinería, con convenio firmado con APEDECA el 15 de abril de 2015 para favorecer la contratación de personas en situación de dependencia.' },
            { title: 'Asociación Creativa', body: 'APEDECA y Asociación Creativa firman el 26 de enero de 2017 un convenio para el desarrollo de acciones de interés social dentro del proyecto “Silene”, de la convocatoria de Programas de Formación en Alternancia con el Empleo.' },
            { title: 'Asociación ADDIN', body: 'Se contrae acuerdo con la Asociación de Dinamización e Inclusión Social para colaborar conjuntamente en actividades que fomenten el desarrollo de sus fines sociales y prácticas profesionales no laborales.' },
          ]} />
          <ConvenioCategory visible={selectedCategory === 'Otras colaboraciones'} title="Formación y empleo" items={[
            { title: 'PFAE El Rosario', body: 'Convenio de colaboración para prácticas profesionales no laborales, entre el Ilustre Ayuntamiento del Rosario y la Asociación de Personas Dependientes en Canarias (APEDECA), en el marco del proyecto “PFAE Bienestar en El Rosario”.' },
            { title: 'PFAE-GJ Domicilia Sociosanitario', body: 'Convenio de colaboración firmado en marzo de 2022 entre la Asociación Domicilia Hernández y la Asociación de Ayuda a Personas en Dependencia en Canarias (APEDECA), para la realización de la prestación de servicios de las y los participantes del Programa de Formación en Alternancia con el Empleo de Garantía Juvenil “PFAE-GJ Domicilia Sociosanitario”, con vigencia hasta febrero de 2023. El alumnado trabajador realizó prácticas laborales en los recursos de la entidad vinculados al C.P. Atención sociosanitaria a personas dependientes en instituciones sociales.' },
          ]} />
          <ConvenioCategory visible={selectedCategory === 'Diversidad Funcional y Mayores'} title="Diversidad funcional y mayores" items={[
            { title: 'Acuerdo para la puesta en marcha de actividades de promoción de la salud y la participación de mayores y personas dependientes', body: 'Esta mañana se ha llevado a cabo la firma de un convenio de colaboración entre el Ayuntamiento de La Victoria de Acentejo y la Asociación de Ayuda a Personas con Dependencia en Canarias (APEDECA) para la puesta en marcha de un municipio de acciones encaminadas a favorecer la autonomía y la participación de personas mayores y/o con discapacidad. En la reunión para sellar el acuerdo han estado presentes el alcalde victoriero, Juan Antonio García; la concejal de Bienestar Social, Estefanía Fernández; y el presidente y la trabajadora social de APEDECA, Iván Márquez y Laura Hernández, respectivamente. En concreto, a través de esta asociación se llevarán a cabo en La Victoria las iniciativas “Empodera-Actívate III” e “¡Intégrate en positivo!”, que vienen a agrupar una serie de talleres terapéuticos integrales, de salud y bienestar para personas mayores y adultos con diversidad funcional, respectivamente.' },
            { title: 'Coordicanarias', body: 'Con fecha 13 de agosto de 2021, APEDECA firma nuevo acuerdo con la entidad COORDICANARIAS, para el desarrollo de acciones y proyectos conjuntos en beneficio de las personas con discapacidad física.' },
            { title: 'Cooperación con la entidad SPORteam Consulting S.L.', body: 'Con fecha 20 de octubre de 2021, APEDECA firma un nuevo acuerdo de cooperación con la entidad SPORteam Consulting S.L. para el desarrollo y ejecución de acciones enmarcadas en el área deportiva dirigidas a favorecer la inclusión social de personas dependientes.' },
            { title: 'SIMPROMI', body: 'Desde el 27 de septiembre de 2013, APEDECA y Sinpromi firmamos un convenio de colaboración para crear sinergias de trabajo en beneficio de la discapacidad, y desde entonces hemos realizado varias colaboraciones que se continuarán en el futuro.' },
          ]} />
          <ConvenioCategory visible={selectedCategory === 'Otras colaboraciones'} title="Participación y colaboración social" items={[
            { title: 'CONRED del Ayuntamiento de Santa Cruz de Tenerife', body: 'Proyecto de trabajo cogestionado por las propias asociaciones del municipio y el Ayuntamiento de Santa Cruz de Tenerife. Desde mayo de 2015, APEDECA viene participando en algunas de las acciones que desarrolla en beneficio de la discapacidad.' },
            { title: 'Plataforma Somos Pacientes', body: 'Somos Pacientes es una comunidad que ofrece un espacio compartido de información, participación, formación, servicios y trabajo colaborativo dirigido a todas las asociaciones de pacientes y personas con discapacidad de España. Nuestra ONG forma parte como colaboradora adscrita desde el 14 de febrero de 2017.' },
            { title: 'La Laguna Solidaria', body: 'La Laguna Solidaria es una plataforma de entidades sociales comprometidas con el bienestar social de la comunidad. Sesenta asociaciones de todo tipo ponen en común experiencias, formación y compromisos. APEDECA participa activamente en los eventos y actividades que organiza esta plataforma.' },
            { title: 'Instituto de Atención Sociosanitaria de Tenerife (IASS)', body: 'Desde el IASS se comenzó a trabajar en abril de 2017 en varias mesas de trabajo para avanzar en distintos ámbitos de los servicios sociales. APEDECA es miembro de la mesa SAAD de los servicios de valoración de la dependencia y ha participado en varias reuniones al respecto.' },
          ]} />
          <ConvenioCategory visible={selectedCategory === 'Otras colaboraciones'} title="Colaboraciones" items={[
            { title: 'Fundación DISA', body: 'En diciembre de 2018 se firmó un acuerdo de colaboración para financiar el proyecto social “Del huerto a la mesa”, para favorecer la alimentación sana y el contacto con la naturaleza de las personas con discapacidad.' },
            { title: 'Asociación EM Social', body: 'En octubre de 2018 se estableció un convenio con esta asociación de trabajadores sociales para trabajar conjuntamente en la mejora del sistema de dependencia.' },
            { title: 'Grupo CIO', body: 'Desde el 17 de abril de 2017, nuestra entidad y Grupo CIO – Compañía de las Islas Occidentales, dentro de su área de RSE, firman un acuerdo de colaboración con la intención de ayudar a nuestra entidad en el desarrollo de actividades y proyectos.' },
            { title: 'Asociación DNT', body: 'El 16 de junio de 2017 se acuerda con esta entidad la realización conjunta de actividades de formación y terapias alternativas.' },
            { title: 'Fundación CB Canarias', body: 'Se firma en octubre de 2018 un convenio de colaboración con esta Fundación para trabajar en favor de las personas con discapacidad.' },
            { title: 'Fundación CEPSA', body: 'En abril de 2016 se firma un acuerdo puntual donde esta entidad organiza una actividad en la que participan trabajadores de esta empresa y usuarios con discapacidad.' },
            { title: 'Eurocampus', body: 'Convenio específico de colaboración entre el centro de formación Eurocampus Formación y Consultoría, S.L. y la Asociación de Ayuda a Personas con Dependencia en Canarias para la realización del módulo de formación en centros de trabajo del alumnado participante en los certificados de profesionalidad.' },
          ]} />
          <ConvenioCategory visible={selectedCategory === 'Inscripciones'} id="inscripciones" title="Inscripciones" items={[
            { title: 'Entidad colaboradora del Gobierno de Canarias', body: 'APEDECA está inscrita desde el 27 de mayo de 2013 como entidad colaboradora del Gobierno de Canarias con número de inscripción TFE 08 1052, cumpliendo con todos los requisitos que ese registro exige.' },
            { title: 'Entidad colaboradora del Servicio Canario de Empleo', body: 'Desde el 1 de diciembre de 2016, nuestra entidad se encuentra inscrita en el Registro de Entidades Colaboradoras del SCE con número GRS2016CA00001, para poder acceder a ayudas y subvenciones de este área.' },
            { title: 'Registro Municipal de Entidades Ciudadanas del Ayuntamiento de Santa Cruz de Tenerife', body: 'Inscritos en este registro con nº 1-879 desde el 1 de diciembre de 2015, después de la evaluación favorable de cumplir con todos los requisitos necesarios. Esta inscripción debe ser renovada cada año y nos permite optar a ayudas, subvenciones y participar en las mesas de trabajo del municipio.' },
            { title: 'Registro Municipal de Entidades Ciudadanas del Ayuntamiento de San Cristóbal de La Laguna', body: 'Inscritos en este registro desde el 14 de junio de 2017 con número 584, después de la evaluación favorable de cumplir con todos los requisitos necesarios.' },
          ]} />
        </div>
      </section>
      <section id="contacto" className="border-t border-slate-100 bg-slate-50 px-6 py-16 text-center">
        <p className="text-sm font-bold uppercase tracking-[.25em] text-sky-600">Colabora con APEDECA</p>
        <h2 className="mt-3 text-3xl font-light text-slate-900">Construyamos nuevas oportunidades juntos</h2>
        <a href="mailto:info@apedeca.es" className="mt-6 inline-flex rounded bg-sky-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-sky-400">Contactar</a>
      </section>
    </main>
  );
}

/* ==================== RECENT PROJECTS (SLIDER) ==================== */

function RecentProjectsPage() {
  const [projects, setProjects] = useState<ApeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchProjects('active')
      .then((data) => setProjects(data.filter((p) => p.is_visible)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="bg-white">
      <PageBanner title="PROYECTOS RECIENTES" image="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600" />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[.28em] text-sky-600">En marcha</p>
          <h1 className="mt-4 text-4xl font-light text-slate-900 sm:text-5xl">Proyectos <span className="text-lime-600">recientes</span></h1>
          <p className="mt-5 leading-8 text-slate-600">Estos son los proyectos en los que estamos trabajando actualmente. Desliza para ver los detalles de cada uno.</p>
        </div>
        {loading && <p className="py-16 text-center text-slate-500">Cargando proyectos…</p>}
        {error && <p className="rounded-lg bg-amber-50 p-5 text-center text-amber-900">No se han podido cargar los proyectos ahora mismo.</p>}
        {!loading && !error && projects.length === 0 && <p className="py-16 text-center text-slate-500">No hay proyectos activos en este momento.</p>}
        {!loading && !error && projects.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${offset * 100}%)` }}>
              {projects.map((project) => (
                <div key={project.id} className="min-w-full">
                  <div className="relative h-[480px] overflow-hidden sm:h-[560px]">
                    <img src={project.image_url} alt={project.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                    {project.logo_url && (
                      <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
                        <img src={project.logo_url} alt="" className="h-16 w-auto object-contain drop-shadow-lg sm:h-20" style={{ filter: 'brightness(0) invert(1)' }} />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-14">
                      {project.year && <span className="mb-3 inline-block rounded-full bg-lime-400 px-4 py-1 text-sm font-bold text-slate-950">{project.year}</span>}
                      <h2 className="text-3xl font-light text-white sm:text-5xl">{project.title}</h2>
                      {project.description && <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">{project.description}</p>}
                      {project.start_date && project.end_date && (
                        <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                          <Clock3 size={15} /> {formatDate(project.start_date)} - {formatDate(project.end_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {projects.length > 1 && (
              <>
                <button onClick={() => setOffset((offset - 1 + projects.length) % projects.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-700 shadow-lg transition hover:bg-white" aria-label="Anterior"><ChevronLeft size={24} /></button>
                <button onClick={() => setOffset((offset + 1) % projects.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-700 shadow-lg transition hover:bg-white" aria-label="Siguiente"><ChevronRight size={24} /></button>
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {projects.map((_, i) => (
                    <button key={i} onClick={() => setOffset(i)} className={`h-2.5 rounded-full transition-all ${i === offset ? 'w-8 bg-lime-400' : 'w-2.5 bg-white/60'}}`} aria-label={`Ir a ${i + 1}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

/* ==================== ARCHIVED PROJECTS ==================== */

function ArchivedProjectsPage() {
  const [projects, setProjects] = useState<ApeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    fetchProjects('archived')
      .then((data) => setProjects(data.filter((p) => p.is_visible)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="bg-white">
      <PageBanner title="HISTORIAL DE PROYECTOS" image="https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&w=1600" />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[.28em] text-sky-600">Archivo</p>
          <h1 className="mt-4 text-4xl font-light text-slate-900 sm:text-5xl">Historial de <span className="text-lime-600">proyectos</span></h1>
          <p className="mt-5 leading-8 text-slate-600">Proyectos finalizados en los que APEDECA ha participado o liderado a lo largo de los años.</p>
        </div>
        {loading && <p className="py-16 text-center text-slate-500">Cargando proyectos…</p>}
        {error && <p className="rounded-lg bg-amber-50 p-5 text-center text-amber-900">No se han podido cargar los proyectos ahora mismo.</p>}
        {!loading && !error && projects.length === 0 && <p className="py-16 text-center text-slate-500">No hay proyectos archivados todavía.</p>}
        {!loading && !error && projects.length > 0 && (() => {
          const years = [...new Set(projects.map((project) => project.year).filter((year): year is number => year !== null && year >= 2020))].sort((a, b) => b - a);
          const activeYear = selectedYear && years.includes(selectedYear) ? selectedYear : years[0] ?? null;
          const visibleProjects = activeYear === null ? [] : projects.filter((project) => project.year === activeYear);
          return (
            <>
              {years.length > 0 && (
                <div className="mb-10 flex flex-wrap justify-center gap-3" role="tablist" aria-label="Filtrar proyectos por año">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`rounded-full px-6 py-3 text-base font-semibold transition ${activeYear === year ? 'bg-sky-600 text-white shadow-md' : 'border border-sky-200 bg-white text-sky-700 hover:border-sky-500 hover:bg-sky-50'}`}
                      role="tab"
                      aria-selected={activeYear === year}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
              {visibleProjects.length === 0 ? (
                <p className="py-10 text-center text-slate-500">No hay proyectos finalizados para este año.</p>
              ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleProjects.map((project) => (
              <article key={project.id} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-56 overflow-hidden">
                  <img src={project.image_url} alt={project.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  {project.year && <span className="absolute bottom-3 left-3 rounded-full bg-lime-400 px-3 py-1 text-xs font-bold text-slate-950">{project.year}</span>}
                  <span className="absolute top-3 right-3 rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white">Finalizado</span>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900">{project.title}</h2>
                  {project.description && <p className="mt-3 leading-7 text-slate-600">{project.description}</p>}
                  {project.start_date && project.end_date && (
                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                      <Clock3 size={15} /> {formatDate(project.start_date)} - {formatDate(project.end_date)}
                    </p>
                  )}
                </div>
              </article>
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </section>
    </main>
  );
}

/* ==================== JOBS PAGE ==================== */

function JobsPage() {
  const [offers, setOffers] = useState<ApeJobOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<ApeJobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadApeJobOffers().then(setOffers).catch(() => setLoadError(true)).finally(() => setLoading(false));
  }, []);

  return (
    <main className="bg-slate-50">
      <PageBanner title="TRABAJA CON NOSOTROS" image="https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1600" />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[.28em] text-sky-600">Únete a nuestro equipo</p>
          <h1 className="mt-4 text-4xl font-light text-slate-900 sm:text-5xl">Ofertas <span className="text-lime-600">activas</span></h1>
          <p className="mt-5 leading-8 text-slate-600">Buscamos personas comprometidas con el cuidado, la autonomía y el bienestar de nuestra comunidad.</p>
        </div>
        {loading && <p className="py-16 text-center text-slate-500">Cargando ofertas…</p>}
        {loadError && <p className="rounded-lg bg-amber-50 p-5 text-center text-amber-900">No se han podido cargar las ofertas ahora mismo.</p>}
        {!loading && !loadError && offers.length === 0 && <p className="py-16 text-center text-slate-500">No hay ofertas activas en este momento.</p>}
        <div className="grid gap-8 md:grid-cols-2">
          {offers.map((offer) => (
            <article key={offer.id} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <img src={offer.image_url} alt="" className="h-56 w-full object-cover" />
              <div className="p-7">
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-sky-700">
                  <span className="rounded-full bg-sky-50 px-3 py-1"><MapPin size={13} className="mr-1 inline" />{offer.location}</span>
                  <span className="rounded-full bg-lime-100 px-3 py-1"><Clock3 size={13} className="mr-1 inline" />{offer.employment_type}</span>
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-900">{offer.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{offer.description}</p>
                <button onClick={() => setSelectedOffer(offer)} className="mt-6 inline-flex items-center gap-2 rounded bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"><Briefcase size={17} /> Solicitar oferta</button>
              </div>
            </article>
          ))}
        </div>
      </section>
      {selectedOffer && <ApplicationModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />}
    </main>
  );
}

function ApplicationModal({ offer, onClose }: { offer: ApeJobOffer; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cv, setCv] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cv) { setMessage('Adjunta tu CV en PDF o Word para continuar.'); return; }
    if (cv.size > 5 * 1024 * 1024) { setMessage('El CV no puede superar los 5 MB.'); return; }
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(cv.type)) { setMessage('El formato permitido es PDF o Word.'); return; }
    setBusy(true); setMessage('');
    try { await submitApeJobApplication(offer.id, name, email, cv); setSuccess(true); } catch { setMessage('No hemos podido enviar tu solicitud. Inténtalo de nuevo.'); } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-5 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-7 shadow-2xl sm:p-9">
        <button onClick={onClose} className="absolute right-5 top-5 text-slate-400 hover:text-slate-900" aria-label="Cerrar"><X /></button>
        {success ? (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-100 text-lime-700"><Check size={32} /></div>
            <h2 className="mt-6 text-2xl font-semibold">Solicitud enviada</h2>
            <p className="mt-3 leading-7 text-slate-600">Hemos recibido tu candidatura para <strong>{offer.title}</strong>. Gracias por querer formar parte del equipo.</p>
            <button onClick={onClose} className="mt-7 rounded bg-sky-500 px-6 py-3 font-semibold text-slate-950">Cerrar</button>
          </div>
        ) : (
          <>
            <p className="text-sm font-bold uppercase tracking-[.2em] text-sky-600">Solicitud de empleo</p>
            <h2 className="mt-3 text-3xl font-light">{offer.title}</h2>
            <p className="mt-2 text-slate-500">Completa tus datos y adjunta tu CV.</p>
            <form onSubmit={submit} className="mt-7 space-y-5">
              <label className="block"><span className="mb-2 block text-sm font-semibold">Nombre completo</span><input required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded border border-slate-200 px-4 py-3 outline-none focus:border-sky-500" /></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Correo electrónico</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded border border-slate-200 px-4 py-3 outline-none focus:border-sky-500" /></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Currículum vitae</span><span className="flex cursor-pointer items-center gap-3 rounded border border-dashed border-sky-300 bg-sky-50 px-4 py-4 text-sm text-sky-800 hover:bg-sky-100"><Upload size={18} />{cv ? cv.name : 'Seleccionar PDF o Word (máx. 5 MB)'}<input required type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setCv(event.target.files?.[0] ?? null)} className="sr-only" /></span></label>
              {message && <p className="rounded bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
              <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"><Send size={17} />{busy ? 'Enviando…' : 'Enviar solicitud'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ==================== FOOTER ==================== */

function Footer({ navItems, settings, onNavigate }: { navItems: CmsNavItem[]; settings: CmsSettings | null; onNavigate: (href: string) => void }) {
  const visibleItems = navItems.filter((i) => i.is_visible).sort((a, b) => a.sort_order - b.sort_order);
  const legalLinks = [
    { label: 'Aviso legal', href: '/aviso-legal' },
    { label: 'Política de privacidad', href: '/politica-privacidad' },
    { label: 'Política de cookies', href: '/politica-cookies' },
    { label: 'Estatutos de la asociación', href: '/estatutos' },
    { label: 'Memoria de actividades', href: '/memoria-actividades' },
  ];
  const socialLinks = [
    { url: settings?.facebook_url, Icon: Facebook },
    { url: settings?.instagram_url, Icon: Instagram },
    { url: settings?.linkedin_url, Icon: Linkedin },
    { url: settings?.youtube_url, Icon: Youtube },
  ].filter((s) => s.url);
  const year = new Date().getFullYear();
  return (
    <footer className="bg-sky-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="text-2xl font-black italic text-lime-300">{settings?.site_name ?? 'Apedeca'}</div>
            <p className="mt-4 max-w-xs leading-7 text-sky-200">Asociación de Ayuda a Personas Dependientes en Canarias. Acompañando personas, construyendo autonomía y cuidando nuestra comunidad.</p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map(({ url, Icon }, i) => <a key={i} href={url ?? '#'} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-800 transition hover:bg-lime-400 hover:text-sky-900"><Icon size={18} /></a>)}
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-lime-300">Explorar</h3>
            <ul className="space-y-2">
              {visibleItems.map((item) => <li key={item.id}><button onClick={() => onNavigate(item.external_url ?? (item.page_slug === 'inicio' ? '/' : `/${item.page_slug}`))} className="text-sm text-sky-200 transition hover:text-white">{item.label}</button></li>)}
              <li><button onClick={() => onNavigate('/trabaja-con-nosotros')} className="text-sm text-sky-200 transition hover:text-white">Trabaja con nosotros</button></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-lime-300">Enlaces de interés</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => <li key={link.href}><button onClick={() => onNavigate(link.href)} className="text-sm text-sky-200 transition hover:text-white">{link.label}</button></li>)}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-lime-300">Contacto</h3>
            <ul className="space-y-3 text-sm text-sky-200">
              {settings?.email && <li><a href={`mailto:${settings.email}`} className="flex items-center gap-2 transition hover:text-white"><Mail size={15} /> {settings.email}</a></li>}
              {settings?.phone && <li><a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 transition hover:text-white"><Phone size={15} /> {settings.phone}</a></li>}
              {settings?.address && <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" /> <span>{settings.address}</span></li>}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-sky-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-sky-300 sm:flex-row lg:px-10">
          <p>Copyright © {year} {settings?.site_name ?? 'Apedeca'} · Todos los derechos reservados</p>
          <div className="flex gap-4">
            <button onClick={() => onNavigate('/aviso-legal')} className="transition hover:text-white">Aviso legal</button>
            <button onClick={() => onNavigate('/politica-privacidad')} className="transition hover:text-white">Privacidad</button>
            <button onClick={() => onNavigate('/politica-cookies')} className="transition hover:text-white">Cookies</button>
            <button onClick={() => onNavigate('/accesibilidad')} className="transition hover:text-white">Accesibilidad</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ==================== AUTH ==================== */

function AuthModal({ mode, setMode, onClose }: { mode: AuthMode; setMode: (mode: AuthMode) => void; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const response = mode === 'sign-in' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (response.error) setMessage(response.error.message);
    else if (mode === 'sign-up') setMessage('Cuenta creada. Ya puedes entrar al editor.');
    else onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-5 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-900" aria-label="Cerrar"><X /></button>
        <div className="mb-7">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600"><LockKeyhole /></div>
          <h2 className="text-2xl font-semibold text-slate-900">Acceso al editor</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Inicia sesión para actualizar los textos de la web desde un panel visual.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" className="w-full rounded border border-slate-200 px-4 py-3 outline-none focus:border-sky-500" />
          <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="w-full rounded border border-slate-200 px-4 py-3 outline-none focus:border-sky-500" />
          <button disabled={busy} className="w-full rounded bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60">{busy ? 'Comprobando…' : mode === 'sign-in' ? 'Entrar' : 'Crear cuenta'}</button>
        </form>
        {message && <p className="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
        <button onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')} className="mt-6 text-sm text-sky-600 hover:underline">{mode === 'sign-in' ? 'Necesito crear una cuenta' : 'Ya tengo una cuenta'}</button>
      </div>
    </div>
  );
}

function AdminLogin({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (authError) setError(authError.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600"><LockKeyhole size={28} /></div>
          <h1 className="text-2xl font-semibold text-slate-900">Acceso al CMS</h1>
          <p className="mt-2 text-sm text-slate-500">Inicia sesión para gestionar el contenido de la web.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-sky-500" />
          <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-sky-500" />
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60">{busy ? 'Comprobando…' : 'Entrar al panel'}</button>
        </form>
        <button onClick={onClose} className="mt-6 w-full text-center text-sm text-slate-500 hover:text-slate-900">Volver a la web</button>
      </div>
    </div>
  );
}

export default App;
