import { useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, ExternalLink, ShieldCheck } from 'lucide-react';

type DenunciaFormPageProps = { onBack: () => void };

export default function DenunciaFormPage({ onBack }: DenunciaFormPageProps) {
  const [communicationType, setCommunicationType] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!communicationType || !accepted) return;
    setSubmitted(true);
  }

  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 px-6 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl">
          <button onClick={onBack} className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition hover:text-white">
            <ArrowLeft size={17} /> Volver al canal de denuncias
          </button>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[.25em] text-amber-100">Canal seguro y confidencial</p>
            <h1 className="mt-4 text-4xl font-light leading-tight sm:text-6xl">Tramitar información o consulta</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-orange-50">Completa este primer paso para acceder al formulario de comunicación del canal de denuncias.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1fr_320px] lg:px-10">
        <div>
          <div className="mb-8 flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-slate-700">
            <Clock3 className="mt-0.5 flex-shrink-0 text-orange-600" size={22} />
            <p className="leading-7">Por motivos de seguridad tienes <strong>20 minutos</strong> para realizar tu comunicación desde que accedes a esta página.</p>
          </div>
          <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <p className="mb-8 italic text-slate-600">Los campos marcados con <span className="font-bold text-red-600">*</span> son obligatorios.</p>
            <label className="block text-base font-semibold text-slate-800">
              <span className="text-red-600">* </span>Selecciona un tipo de comunicación
              <select required value={communicationType} onChange={(event) => setCommunicationType(event.target.value)} className="mt-3 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 font-normal text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                <option value="">Selecciona una opción …</option>
                <option value="consulta">Consulta</option>
                <option value="denuncia">Información (Denuncia)</option>
              </select>
            </label>
            <p className="mt-8 leading-7 text-slate-600">Consulta la <a href="/politica-privacidad" className="font-semibold text-orange-600 underline underline-offset-4">política de privacidad del canal de denuncias</a> antes de continuar.</p>
            <label className="mt-6 flex items-start gap-3 text-slate-700">
              <input required type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-5 w-5 accent-orange-500" />
              <span><span className="text-red-600">* </span>He leído y acepto las <a href="#condiciones" className="font-semibold text-orange-600 underline underline-offset-4">condiciones de uso del proveedor</a>.</span>
            </label>
            <button type="submit" className="mt-9 inline-flex min-w-44 items-center justify-center gap-2 rounded-lg bg-orange-500 px-8 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">ENVIAR <ExternalLink size={17} /></button>
            {submitted && <p className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 p-4 font-medium text-emerald-800"><CheckCircle2 size={19} /> La selección se ha validado. En el siguiente paso conectaremos el formulario definitivo.</p>}
          </form>
        </div>
        <aside className="h-fit rounded-2xl bg-slate-50 p-7">
          <ShieldCheck className="text-orange-500" size={32} />
          <h2 className="mt-5 text-2xl font-light text-slate-900">Tu comunicación está protegida</h2>
          <p className="mt-4 leading-7 text-slate-600">Puedes realizar una comunicación con identificación o de forma anónima. La información se tratará de forma confidencial.</p>
          <div className="mt-6 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-500">La información falsa comunicada deliberadamente puede tener consecuencias legales. Utiliza este canal de buena fe.</div>
        </aside>
      </section>
    </main>
  );
}
