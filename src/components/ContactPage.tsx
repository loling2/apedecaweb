import { useState, type FormEvent } from 'react';
import { Mail, Phone, Clock3, Upload, Send, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadDocument } from '@/lib/cms';

type ContactPageProps = {
  onBack: () => void;
  settings: {
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
};

export default function ContactPage({ onBack, settings }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('error');
      setErrorMsg('El correo electrónico es obligatorio.');
      return;
    }
    setStatus('sending');
    setErrorMsg('');

    try {
      let filePath: string | null = null;
      let fileName: string | null = null;

      if (file) {
        try {
          filePath = await uploadDocument(file);
          fileName = file.name;
        } catch {
          setStatus('error');
          setErrorMsg('No se pudo subir el archivo. Inténtalo de nuevo.');
          return;
        }
      }

      const { error } = await supabase.from('ape_contact_submissions').insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        file_path: filePath,
        file_name: fileName,
      });

      if (error) throw error;

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.SUPABASE_URL}/functions/v1/send-contact-email`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          filePath,
          fileName,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Error al enviar el mensaje');
      }

      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
      setFile(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setStatus('error');
      setErrorMsg(msg);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="relative flex h-48 items-center justify-center overflow-hidden bg-sky-700 sm:h-64">
        <h1 className="relative text-3xl font-light tracking-wide text-white sm:text-5xl lg:text-7xl">Contacto</h1>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24">
        <button
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-sky-600 transition hover:text-sky-800"
        >
          <ArrowLeft size={18} /> Volver
        </button>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[.25em] text-sky-600">Estamos para ayudarte</p>
            <h2 className="text-4xl font-light sm:text-5xl">Contáctenos</h2>
            <p className="mt-7 max-w-md leading-8 text-slate-600">
              Si tienes alguna pregunta sobre nuestros servicios, proyectos o formas de colaborar, escríbenos. Te responderemos lo antes posible.
            </p>
            <div className="mt-9 space-y-5 text-slate-700">
              {settings?.email && (
                <div className="flex items-center gap-4"><Mail className="text-sky-500" /> {settings.email}</div>
              )}
              {settings?.phone && (
                <div className="flex items-center gap-4"><Phone className="text-sky-500" /> {settings.phone}</div>
              )}
              <div className="flex items-center gap-4"><Clock3 className="text-sky-500" /> Lunes a viernes, 9:00 – 14:00</div>
            </div>
          </div>

          <div>
            {status === 'sent' ? (
              <div className="flex flex-col items-center justify-center rounded-lg bg-green-50 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Check size={32} />
                </div>
                <h3 className="mt-6 text-2xl font-light text-slate-900">Mensaje enviado</h3>
                <p className="mt-3 text-slate-600">Gracias por contactarnos. Te responderemos lo antes posible.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-8 rounded-lg border border-sky-200 bg-white px-6 py-3 font-semibold text-sky-600 transition hover:bg-sky-50"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form className="space-y-5 rounded-lg bg-slate-50 p-7 sm:p-9" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="contact-name">Nombre</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-b border-slate-300 bg-transparent px-1 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-500"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="contact-email">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b border-slate-300 bg-transparent px-1 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-500"
                    placeholder="Tu correo electrónico"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="contact-message">Mensaje</label>
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-32 w-full resize-none border-b border-slate-300 bg-transparent px-1 py-3 outline-none transition placeholder:text-slate-400 focus:border-sky-500"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="contact-file">Adjuntar archivo (opcional)</label>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="contact-file"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-sky-400 hover:text-sky-600"
                    >
                      <Upload size={18} /> Seleccionar archivo
                    </label>
                    <input
                      id="contact-file"
                      type="file"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                    {file && (
                      <span className="truncate text-sm text-slate-500">{file.name}</span>
                    )}
                  </div>
                </div>

                {status === 'error' && (
                  <div className="flex items-start gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={20} className="mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'sending' ? (
                    <>Enviando…</>
                  ) : (
                    <><Send size={18} /> Enviar mensaje</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
