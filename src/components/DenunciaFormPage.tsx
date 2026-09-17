import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, FileText, ShieldCheck, Upload } from 'lucide-react';

type DenunciaFormPageProps = { onBack: () => void };
type CommunicationType = '' | 'consulta' | 'denuncia';
type Identification = '' | 'si' | 'no';
type ComplaintChannel = 'online' | 'presencial';

type FormValues = {
  communicationType: CommunicationType;
  identification: Identification;
  complaintChannel: ComplaintChannel;
  entity: string;
  name: string;
  firstSurname: string;
  secondSurname: string;
  dni: string;
  email: string;
  phone: string;
  category: string;
  relation: string;
  company: string;
  consultation: string;
  description: string;
  places: string;
  period: string;
  peopleInvolved: string;
  otherPeople: string;
  affectedAreas: string;
  discovery: string;
  awareness: string;
  concealment: string;
  relevantDetails: string;
};

const initialValues: FormValues = {
  communicationType: '',
  identification: '',
  complaintChannel: 'online',
  entity: '',
  name: '',
  firstSurname: '',
  secondSurname: '',
  dni: '',
  email: '',
  phone: '',
  category: '',
  relation: '',
  company: '',
  consultation: '',
  description: '',
  places: '',
  period: '',
  peopleInvolved: '',
  otherPeople: '',
  affectedAreas: '',
  discovery: '',
  awareness: '',
  concealment: '',
  relevantDetails: '',
};

const inputClass = 'mt-2 w-full rounded-sm border border-slate-300 bg-[#eef5f8] px-3 py-3 text-[15px] text-slate-700 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100';
const labelClass = 'block text-sm leading-6 text-slate-700';

function RequiredMark() {
  return <span className="text-red-600">* </span>;
}

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className={labelClass}>{required && <RequiredMark />}{label}{children}</label>;
}

function Consent({ checked, onChange, children }: { checked: boolean; onChange: (checked: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 accent-orange-500" />
      <span><RequiredMark />{children}</span>
    </label>
  );
}

function FilePicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(Array.from(event.target.files ?? []));
    event.target.value = '';
  }

  return (
    <div>
      <p className="mb-3 text-sm leading-6 text-slate-600">Si dispone de un documento o archivo que asista a su comunicación, puede cargarlo a continuación.</p>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-slate-300 bg-[#eef5f8] px-4 py-3 text-sm text-slate-700 transition hover:border-orange-400 hover:bg-orange-50">
        <Upload size={16} /> Elegir archivos
        <input type="file" multiple onChange={handleChange} className="sr-only" />
      </label>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file) => <div key={`${file.name}-${file.size}`} className="flex items-center gap-2 text-sm text-slate-600"><FileText size={15} className="text-orange-500" /> {file.name}</div>)}
        </div>
      )}
    </div>
  );
}

export default function DenunciaFormPage({ onBack }: DenunciaFormPageProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [step, setStep] = useState<'start' | 'details'>('start');
  const [acceptedProvider, setAcceptedProvider] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function updateValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function selectCommunication(event: ChangeEvent<HTMLSelectElement>) {
    const communicationType = event.target.value as CommunicationType;
    updateValue('communicationType', communicationType);
    setStep('start');
    setAcceptedPrivacy(false);
  }

  function continueToDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.communicationType || !acceptedProvider) return;
    setStep('details');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!acceptedPrivacy || !acceptedProvider) return;
    setSubmitted(true);
  }

  function resetForm() {
    setValues(initialValues);
    setStep('start');
    setAcceptedProvider(false);
    setAcceptedPrivacy(false);
    setFiles([]);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-14">
            <CheckCircle2 className="mx-auto text-emerald-600" size={56} />
            <h1 className="mt-6 text-3xl font-light text-slate-900 sm:text-4xl">Comunicación enviada</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">Hemos recibido tu comunicación correctamente. La información será tratada de forma confidencial.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={resetForm} className="rounded bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">Realizar otra comunicación</button>
              <button type="button" onClick={onBack} className="rounded border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-orange-400">Volver al canal</button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-8 lg:px-10">
        <button onClick={step === 'details' ? () => setStep('start') : onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition hover:text-orange-700">
          <ArrowLeft size={17} /> {step === 'details' ? 'Volver al paso anterior' : 'Volver al canal de denuncias'}
        </button>
        <div className="mt-8 max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-orange-500">Canal seguro y confidencial</p>
          <h1 className="mt-3 text-3xl font-light leading-tight text-slate-900 sm:text-5xl">Tramitar información o consulta</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">Completa los datos para realizar una comunicación a través del canal de denuncias.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 lg:px-10">
        <div className="mb-8 flex items-start gap-4 rounded border border-amber-300 bg-amber-50 px-6 py-5 text-slate-700">
          <Clock3 className="mt-0.5 flex-shrink-0 text-orange-600" size={22} />
          <p className="leading-7">Por motivos de seguridad tienes <strong>20 minutos</strong> para realizar tu comunicación a contar desde el momento en que accediste a esta página.</p>
        </div>

        {step === 'start' ? (
          <form onSubmit={continueToDetails} className="max-w-4xl space-y-8">
            <p className="italic text-slate-600">Los campos marcados con un <span className="text-red-600">*</span> son obligatorios.</p>
            <Field label="Selecciona un tipo de comunicación" required>
              <select required value={values.communicationType} onChange={selectCommunication} className={`${inputClass} max-w-md`}>
                <option value="">Selecciona una opción …</option>
                <option value="consulta">Consulta</option>
                <option value="denuncia">Información (Denuncia)</option>
              </select>
            </Field>

            {values.communicationType === 'denuncia' && (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => updateValue('complaintChannel', 'online')} className={`rounded border px-4 py-3 text-sm transition ${values.complaintChannel === 'online' ? 'border-slate-700 bg-slate-700 font-semibold text-white' : 'border-slate-300 text-slate-700 hover:border-orange-400'}`}>Información (Denuncia) On Line</button>
                <button type="button" onClick={() => updateValue('complaintChannel', 'presencial')} className={`rounded border px-4 py-3 text-sm transition ${values.complaintChannel === 'presencial' ? 'border-slate-700 bg-slate-700 font-semibold text-white' : 'border-slate-300 text-slate-700 hover:border-orange-400'}`}>Información (Denuncia) con reunión presencial</button>
              </div>
            )}

            <div className="space-y-4 border-t border-slate-200 pt-7">
              <Consent checked={acceptedProvider} onChange={setAcceptedProvider}>He leído y acepto las <a href="#condiciones" className="font-semibold text-orange-600 underline underline-offset-4">condiciones de uso del proveedor</a>.</Consent>
            </div>
            <button type="submit" disabled={!values.communicationType || !acceptedProvider} className="inline-flex items-center gap-2 rounded bg-orange-500 px-7 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">CONTINUAR <ArrowRight size={17} /></button>
          </form>
        ) : (
          <form onSubmit={submit} className="max-w-5xl space-y-8">
            <p className="italic text-slate-600">Los campos marcados con un <span className="text-red-600">*</span> son obligatorios.</p>
            <Field label="¿Desea identificarse?" required>
              <select required value={values.identification} onChange={(event) => updateValue('identification', event.target.value as Identification)} className={`${inputClass} max-w-md`}>
                <option value="">Selecciona una opción …</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </Field>

            {values.communicationType === 'consulta' ? <ConsultationFields values={values} updateValue={updateValue} files={files} setFiles={setFiles} /> : <ComplaintFields values={values} updateValue={updateValue} files={files} setFiles={setFiles} />}

            <div className="space-y-5 border-t border-slate-200 pt-7">
              <p className="leading-7 text-slate-600">Consulta la <a href="/politica-privacidad" className="font-semibold text-orange-600 underline underline-offset-4">política de privacidad del canal de denuncias</a> antes de continuar.</p>
              <Consent checked={acceptedPrivacy} onChange={setAcceptedPrivacy}>He leído y acepto la política de privacidad del canal de denuncias de <strong>SERVICIOS Y GESTION RESIDENCIAL EN CANARIAS, S.L. - GERONTALIA, S.L. - ASOCIACIÓN DE AYUDA A PERSONAS CON DEPENDENCIA EN CANARIAS</strong>. <a href="/politica-privacidad" className="font-semibold text-orange-600 underline underline-offset-4">Ver aquí</a>.</Consent>
              <Consent checked={acceptedProvider} onChange={setAcceptedProvider}>He leído y acepto las <a href="#condiciones" className="font-semibold text-orange-600 underline underline-offset-4">condiciones de uso del proveedor</a>.</Consent>
            </div>
            <button type="submit" disabled={!acceptedPrivacy || !acceptedProvider} className="rounded bg-orange-500 px-7 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">ENVIAR {values.communicationType === 'consulta' ? 'CONSULTA' : 'DENUNCIA'}</button>
          </form>
        )}

        <aside className="mt-12 max-w-4xl rounded bg-slate-50 p-7">
          <div className="flex gap-4">
            <ShieldCheck className="mt-1 flex-shrink-0 text-orange-500" size={30} />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Tu comunicación está protegida</h2>
              <p className="mt-2 leading-7 text-slate-600">Puedes realizar una comunicación con identificación o de forma anónima. La información se tratará de forma confidencial.</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ConsultationFields({ values, updateValue, files, setFiles }: { values: FormValues; updateValue: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void; files: File[]; setFiles: (files: File[]) => void }) {
  return (
    <div className="space-y-7">
      {values.identification === 'si' && <IdentityFields values={values} updateValue={updateValue} />}
      <Field label="Consulta" required><textarea required value={values.consultation} onChange={(event) => updateValue('consultation', event.target.value)} className={`${inputClass} min-h-44`} /></Field>
      <FilePicker files={files} onChange={setFiles} />
    </div>
  );
}

function ComplaintFields({ values, updateValue, files, setFiles }: { values: FormValues; updateValue: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void; files: File[]; setFiles: (files: File[]) => void }) {
  return (
    <div className="space-y-7">
      {values.identification === 'si' && <IdentityFields values={values} updateValue={updateValue} />}
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Seleccione una categoría"><select value={values.category} onChange={(event) => updateValue('category', event.target.value)} className={inputClass}><option value="">Selecciona una opción …</option><option value="laboral">Ámbito laboral</option><option value="servicios">Servicios y atención</option><option value="financiera">Información financiera</option><option value="otra">Otra</option></select></Field>
        <Field label="¿Cuál es la entidad a la que quiere presentar información (denuncia)?" required><select required value={values.entity} onChange={(event) => updateValue('entity', event.target.value)} className={inputClass}><option value="">Selecciona una opción …</option><option value="apedeca">Asociación Apedeca</option><option value="gerontalia">Gerontalia</option><option value="servicios">Servicios y Gestión Residencial en Canarias</option></select></Field>
        <Field label="Identifique la relación con la organización/sociedad" required><select required value={values.relation} onChange={(event) => updateValue('relation', event.target.value)} className={inputClass}><option value="">Selecciona una opción …</option><option value="empleado">Empleado/a</option><option value="proveedor">Proveedor/a</option><option value="usuario">Usuario/a</option><option value="otro">Otra</option></select></Field>
      </div>
      <Field label="Indique la sociedad del grupo para la que licitó o presta servicios su empresa"><textarea value={values.company} onChange={(event) => updateValue('company', event.target.value)} className={`${inputClass} min-h-24`} /></Field>
      <Field label="Facilite una descripción lo más detallada posible de los hechos objeto de su información (denuncia). Por favor, ordene la descripción cronológicamente y aporte toda la información que pueda ser relevante para la investigación de los hechos informados" required><textarea required value={values.description} onChange={(event) => updateValue('description', event.target.value)} className={`${inputClass} min-h-28`} /></Field>
      <Field label="Identifique el lugar o lugares en los que han tenido o están teniendo lugar los hechos informados" required><textarea required value={values.places} onChange={(event) => updateValue('places', event.target.value)} className={`${inputClass} min-h-24`} /></Field>
      <Field label="Describa el momento o período de tiempo durante el que han tenido lugar los hechos informados" required><textarea required value={values.period} onChange={(event) => updateValue('period', event.target.value)} className={`${inputClass} min-h-24`} /></Field>
      <Field label="Identifique a la persona o personas implicadas en este comportamiento, y en su caso, la sociedad del grupo en la que trabajan" required><textarea required value={values.peopleInvolved} onChange={(event) => updateValue('peopleInvolved', event.target.value)} className={`${inputClass} min-h-24`} /></Field>
      <Field label="Identifique, si es posible, a otras personas participantes en los hechos o que tuvieran conocimiento de los mismos, y en su caso, la sociedad del grupo en que trabajan"><textarea value={values.otherPeople} onChange={(event) => updateValue('otherPeople', event.target.value)} className={`${inputClass} min-h-24`} /></Field>
      <Field label="Identifique las sociedades y/o áreas de negocio del Grupo afectadas o relacionadas con los hechos informados" required><textarea required value={values.affectedAreas} onChange={(event) => updateValue('affectedAreas', event.target.value)} className={`${inputClass} min-h-24`} /></Field>
      <Field label="Describa cómo llegaron a su conocimiento los hechos informados" required><textarea required value={values.discovery} onChange={(event) => updateValue('discovery', event.target.value)} className={`${inputClass} min-h-24`} /></Field>
      <Field label="¿Está la dirección al corriente de este problema?" required>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {['No', 'No deseo revelarlo', 'No lo sé', 'Sí'].map((option) => <label key={option} className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="awareness" value={option} checked={values.awareness === option} onChange={(event) => updateValue('awareness', event.target.value)} className="h-4 w-4 accent-orange-500" />{option}</label>)}
        </div>
      </Field>
      <Field label="Identifique las personas que han intentado ocultar este problema y las medidas que adoptaron para ello"><textarea value={values.concealment} onChange={(event) => updateValue('concealment', event.target.value)} className={`${inputClass} min-h-24`} /></Field>
      <Field label="Proporcione todos los detalles sobre la presunta infracción, incluida la ubicación de los testigos y cualquier otra información que pudiera ser valiosa en la evaluación y posterior resolución de la situación"><textarea value={values.relevantDetails} onChange={(event) => updateValue('relevantDetails', event.target.value)} className={`${inputClass} min-h-28`} /></Field>
      <p className="-mt-3 text-xs italic leading-5 text-slate-500">Tómese su tiempo y aporte la mayor cantidad de detalles posible, pero tenga cuidado de no dar detalles que pudieran revelar su identidad a menos que desee hacerlo. Podría ser importante saber si usted es la única persona consciente de esta situación.</p>
      <FilePicker files={files} onChange={setFiles} />
      <VoiceRecorder />
    </div>
  );
}

function VoiceRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Este navegador no permite grabar audio. Puedes adjuntar un archivo de audio.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event: BlobEvent) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const nextUrl = URL.createObjectURL(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
        setAudioUrl((current) => { if (current) URL.revokeObjectURL(current); return nextUrl; });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      recorderRef.current = recorder;
      streamRef.current = stream;
      recorder.start();
      setRecording(true);
    } catch {
      setError('No se ha podido acceder al micrófono. Revisa el permiso del navegador.');
    }
  }

  return (
    <div className="border border-slate-300 p-5 text-sm leading-6 text-slate-600">
      <p>Si deseas completar tu denuncia con una grabación de voz, puedes hacerlo pulsando el siguiente botón. Una vez grabada, podrás distorsionar la voz y mantener a salvo tu identidad.</p>
      <button type="button" onClick={toggleRecording} className="mt-4 rounded bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300">{recording ? 'Detener grabación' : 'Iniciar grabación oral'}</button>
      {audioUrl && <audio controls src={audioUrl} className="mt-4 w-full" />}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}

function IdentityFields({ values, updateValue }: { values: FormValues; updateValue: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void }) {
  return (
    <div className="rounded border border-slate-300 p-5 sm:p-6">
      <Field label="Entidad"><input value={values.entity} onChange={(event) => updateValue('entity', event.target.value)} className={inputClass} /></Field>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <Field label="Nombre" required><input required value={values.name} onChange={(event) => updateValue('name', event.target.value)} className={inputClass} /></Field>
        <Field label="Primer apellido" required><input required value={values.firstSurname} onChange={(event) => updateValue('firstSurname', event.target.value)} className={inputClass} /></Field>
        <Field label="Segundo apellido" required><input required value={values.secondSurname} onChange={(event) => updateValue('secondSurname', event.target.value)} className={inputClass} /></Field>
        <Field label="NIF/DNI"><input value={values.dni} onChange={(event) => updateValue('dni', event.target.value)} className={inputClass} /></Field>
        <Field label="Email" required><input required type="email" value={values.email} onChange={(event) => updateValue('email', event.target.value)} className={inputClass} /></Field>
        <Field label="Teléfono" required><input required type="tel" value={values.phone} onChange={(event) => updateValue('phone', event.target.value)} className={inputClass} /></Field>
      </div>
    </div>
  );
}
