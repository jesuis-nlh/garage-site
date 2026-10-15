'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { garage } from '@/config';
import { fieldErrors, leadSchema, stepFields, type Lead, type LeadResponse } from '@/lib/lead';
import { BOOKING_EVENT, type BookingPrefill } from '@/lib/booking-bus';
import { isClosedOn, parisToday } from '@/lib/hours';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

type FormState = {
  service: string;
  concern: string;
  message: string;
  make: string;
  model: string;
  plate: string;
  mileage: string;
  date: string;
  slot: string;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
  website: string;
};

type Errors = Partial<Record<keyof Lead, string>>;
type Status = 'idle' | 'submitting' | 'success' | 'not_configured' | 'error' | 'rate_limited';

const initial: FormState = {
  service: '',
  concern: '',
  message: '',
  make: '',
  model: '',
  plate: '',
  mileage: '',
  date: '',
  slot: '',
  name: '',
  phone: '',
  email: '',
  consent: false,
  website: '',
};

const STEPS = ['Prestation', 'Véhicule', 'Coordonnées'];
const OTHER = { id: 'autre', title: 'Autre / je ne sais pas' };

interface Props {
  services: { id: string; title: string }[];
  slots: string[];
  phoneDisplay: string;
  phoneE164: string;
  brandName: string;
  external?: { url: string; label: string };
}

function validate(state: FormState, fields: (keyof Lead)[], today: string): Errors {
  const mask = Object.fromEntries(fields.map((f) => [f, true])) as { [K in keyof Lead]?: true };
  const res = leadSchema.pick(mask).safeParse(state);
  const errs: Errors = res.success ? {} : fieldErrors(res.error);
  if (fields.includes('date') && state.date && !errs.date) {
    if (state.date < today) errs.date = 'Choisissez une date à venir.';
    else if (isClosedOn(garage.hours, state.date)) errs.date = 'Le centre est habituellement fermé ce jour-là : choisissez une autre date.';
  }
  return errs;
}

export function BookingForm({ services, slots, phoneDisplay, phoneE164, brandName, external }: Props) {
  const options = [...services, OTHER];
  const [step, setStep] = useState(0);
  const [state, setState] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  // Le champ date n'est pas rendu à l'hydratation (étape 1) : pas de divergence serveur / client.
  const [today] = useState(() => (typeof window === 'undefined' ? '' : parisToday()));
  const [copied, setCopied] = useState(false);
  const uid = useId();
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
    if (errors[key as keyof Lead]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const applyPrefill = useCallback(
    (p: BookingPrefill) => {
      const known = p.service && options.some((o) => o.id === p.service) ? p.service : undefined;
      setState((s) => ({ ...s, service: known ?? s.service, concern: p.concern?.slice(0, 60) ?? s.concern }));
      setErrors({});
      setStatus('idle');
      setStep(0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- options dérive de props stables
    [services],
  );

  // Pré-remplissage : paramètres d'URL (pages prestations) et événements internes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('service') || params.get('motif')) {
      // Lecture unique de l'URL après hydratation : la faire au rendu créerait une divergence serveur / client.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      applyPrefill({ service: params.get('service') ?? undefined, concern: params.get('motif') ?? undefined });
    }
    const onPrefill = (e: Event) => {
      applyPrefill((e as CustomEvent<BookingPrefill>).detail);
      window.setTimeout(() => document.getElementById('booking-title')?.focus({ preventScroll: true }), 700);
    };
    window.addEventListener(BOOKING_EVENT, onPrefill);
    return () => window.removeEventListener(BOOKING_EVENT, onPrefill);
  }, [applyPrefill]);

  // Focus sur le titre d'étape à chaque changement (pas au premier rendu)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    stepHeading.current?.focus({ preventScroll: false });
  }, [step]);

  useEffect(() => {
    if (status !== 'idle' && status !== 'submitting') resultRef.current?.focus();
  }, [status]);

  const showErrors = (errs: Errors) => {
    setErrors(errs);
    window.setTimeout(() => summaryRef.current?.focus(), 0);
  };

  const next = () => {
    const errs = validate(state, stepFields[step], today);
    if (Object.keys(errs).length) return showErrors(errs);
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = async () => {
    const all = validate(state, stepFields.flat(), today);
    if (Object.keys(all).length) {
      const firstStep = stepFields.findIndex((fields) => fields.some((f) => all[f]));
      setStep(firstStep);
      return showErrors(all);
    }
    setStatus('submitting');
    try {
      const res = await fetch('/api/demande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      const json = (await res.json().catch(() => null)) as LeadResponse | null;
      if (json?.ok) return setStatus('success');
      if (json && !json.ok && json.code === 'INVALID') {
        const firstStep = Math.max(
          0,
          stepFields.findIndex((fields) => fields.some((f) => json.errors[f])),
        );
        setStatus('idle');
        setStep(firstStep);
        return showErrors(json.errors);
      }
      if (json && !json.ok && json.code === 'NOT_CONFIGURED') return setStatus('not_configured');
      if (json && !json.ok && json.code === 'RATE_LIMITED') return setStatus('rate_limited');
      setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  const serviceLabel = options.find((o) => o.id === state.service)?.title ?? '';
  const summary: [string, string][] = (
    [
      ['Prestation', serviceLabel],
      ['Motif', state.concern],
      ['Véhicule', `${state.make} ${state.model}`.trim()],
      ['Immatriculation', state.plate],
      ['Kilométrage', state.mileage && `${state.mileage} km`],
      ['Date souhaitée', state.date && new Date(`${state.date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })],
      ['Créneau', state.slot],
      ['Nom', state.name],
      ['Téléphone', state.phone],
      ['E-mail', state.email],
      ['Précisions', state.message],
    ] as [string, string][]
  ).filter(([, v]) => Boolean(v));

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(`Demande de rendez-vous — ${brandName}\n${summary.map(([k, v]) => `${k} : ${v}`).join('\n')}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const errorList = Object.entries(errors).filter(([, v]) => v) as [keyof Lead, string][];

  /* ---------- États de résultat ---------- */
  if (status === 'success' || status === 'not_configured' || status === 'error' || status === 'rate_limited') {
    const content: Record<typeof status, { icon: 'check' | 'alert'; title: string; text: ReactNode }> = {
      success: {
        icon: 'check',
        title: 'Demande transmise à l’atelier',
        text: (
          <>
            L’atelier vous recontacte au <strong className="tabular">{state.phone}</strong> pour confirmer le rendez-vous. À ce stade, le créneau n’est pas
            encore réservé.
          </>
        ),
      },
      not_configured: {
        icon: 'alert',
        title: 'Votre demande n’a pas été envoyée',
        text: (
          <>
            L’envoi en ligne n’est pas encore activé sur ce site. Pour réserver dès maintenant, appelez le centre
            {external ? ' ou utilisez la réservation en ligne du réseau' : ''}. Vous pouvez copier votre demande pour la garder sous la main.
          </>
        ),
      },
      rate_limited: {
        icon: 'alert',
        title: 'Trop de demandes en peu de temps',
        text: <>Votre demande n’a pas été envoyée. Patientez quelques minutes avant de réessayer, ou appelez directement le centre.</>,
      },
      error: {
        icon: 'alert',
        title: 'La demande n’a pas pu être transmise',
        text: <>Un problème technique a empêché l’envoi : votre demande n’a pas été reçue. Réessayez dans un instant ou appelez le centre.</>,
      },
    };
    const c = content[status];
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="intro-fade rounded-[4px] border border-bone-100/10 bg-ink-850 p-7 outline-none sm:p-10">
        <span
          className={`grid size-14 place-items-center rounded-full ${c.icon === 'check' ? 'bg-accent text-accent-ink' : 'border border-accent text-accent'}`}
        >
          <Icon name={c.icon} className="size-6" />
        </span>
        <h3 className="mt-6 display text-[clamp(1.6rem,3vw,2.2rem)]">{c.title}</h3>
        <p className="mt-4 max-w-xl leading-relaxed text-steel-200">{c.text}</p>
        <dl className="mt-8 grid gap-0 border-t border-bone-100/10">
          {summary.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-bone-100/10 py-3 text-[0.95rem]">
              <dt className="text-steel-400">{k}</dt>
              <dd className="break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {status === 'success' ? (
            <Button
              variant="outline"
              icon={null}
              onClick={() => {
                setState(initial);
                setStep(0);
                setStatus('idle');
              }}
            >
              Faire une autre demande
            </Button>
          ) : (
            <>
              <Button href={`tel:${phoneE164}`} leadingIcon="phone" icon={null}>
                Appeler le {phoneDisplay}
              </Button>
              {status === 'not_configured' && external && (
                <Button href={external.url} external variant="outline" icon="arrow-up-right">
                  {external.label}
                </Button>
              )}
              {status === 'not_configured' && (
                <Button variant="outline" icon={null} leadingIcon={copied ? 'check' : 'copy'} onClick={copySummary}>
                  {copied ? 'Demande copiée' : 'Copier ma demande'}
                </Button>
              )}
              {status !== 'not_configured' && (
                <Button variant="outline" icon={null} onClick={submit}>
                  Réessayer
                </Button>
              )}
              <button type="button" onClick={() => setStatus('idle')} className="link-underline self-center px-2 text-steel-300 hover:text-bone-100">
                Modifier ma demande
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ---------- Formulaire ---------- */
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (step < STEPS.length - 1) next();
        else submit();
      }}
      className="relative rounded-[4px] border border-bone-100/10 bg-ink-850 p-6 sm:p-10"
      aria-labelledby={`${uid}-title`}
    >
      <h3 id={`${uid}-title`} className="sr-only">
        Formulaire de demande de rendez-vous ou de devis
      </h3>

      {/* Progression */}
      <ol className="grid grid-cols-3 gap-3" aria-label="Étapes du formulaire">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          const inner = (
            <>
              <span className="label tabular">{String(i + 1).padStart(2, '0')}</span>
              <span className="truncate text-[0.9rem]">{label}</span>
            </>
          );
          return (
            <li key={label} aria-current={current ? 'step' : undefined}>
              <span className="block h-0.5 w-full overflow-hidden bg-bone-100/10">
                <span
                  className={`block h-full origin-left bg-accent transition-transform duration-700 ease-[var(--ease-out-expo)] ${i <= step ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </span>
              {done ? (
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className="mt-3 flex items-center gap-2 text-steel-200 hover:text-bone-100"
                  aria-label={`Revenir à l’étape ${i + 1} : ${label}`}
                >
                  {inner}
                </button>
              ) : (
                <span className={`mt-3 flex items-center gap-2 ${current ? 'text-bone-100' : 'text-steel-400'}`}>{inner}</span>
              )}
            </li>
          );
        })}
      </ol>

      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="mt-8 rounded-[3px] border border-[#ff8a7a]/60 bg-[#ff8a7a]/10 p-4 outline-none">
          <p className="font-medium text-[#ffb3a8]">Merci de vérifier {errorList.length > 1 ? `ces ${errorList.length} champs` : 'ce champ'} :</p>
          <ul className="mt-2 grid gap-1 text-[0.95rem]">
            {errorList.map(([field, msg]) => (
              <li key={field}>
                <a href={`#${uid}-${field}`} className="underline underline-offset-2">
                  {msg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div key={step} className="intro-fade mt-10" style={{ ['--i' as string]: -4 }}>
        {step === 0 && (
          <fieldset>
            <legend className="contents">
              <h4 ref={stepHeading} tabIndex={-1} className="display text-[1.6rem] outline-none">
                Quelle prestation souhaitez-vous ?
              </h4>
            </legend>
            {state.concern && (
              <p className="mt-5 inline-flex items-center gap-3 rounded-full border border-bone-100/15 py-1.5 pr-1.5 pl-4 text-sm">
                <span className="text-steel-300">Motif :</span> {state.concern}
                <button
                  type="button"
                  onClick={() => set('concern', '')}
                  className="grid size-7 place-items-center rounded-full hover:bg-bone-100/10"
                  aria-label="Retirer le motif"
                >
                  <Icon name="close" className="size-3.5" />
                </button>
              </p>
            )}
            <div
              id={`${uid}-service`}
              role="radiogroup"
              aria-label="Prestation souhaitée"
              aria-invalid={Boolean(errors.service)}
              aria-describedby={errors.service ? `${uid}-service-err` : undefined}
              className="mt-6 grid gap-2 sm:grid-cols-2"
            >
              {options.map((o) => (
                <label
                  key={o.id}
                  className="flex min-h-13 cursor-pointer items-center gap-3 rounded-[3px] border border-bone-100/15 px-4 py-3 transition-colors hover:border-bone-100/40 has-checked:border-accent has-checked:bg-accent/10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
                >
                  <input
                    type="radio"
                    name="service"
                    value={o.id}
                    checked={state.service === o.id}
                    onChange={() => set('service', o.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="grid size-4 shrink-0 place-items-center rounded-full border border-bone-100/40 peer-checked:border-accent peer-checked:bg-accent"
                  >
                    <span className="size-1.5 rounded-full bg-ink-900" />
                  </span>
                  <span className="text-[0.97rem]">{o.title}</span>
                </label>
              ))}
            </div>
            <FieldError id={`${uid}-service-err`} message={errors.service} />
            <TextArea
              id={`${uid}-message`}
              label="Précisez votre besoin"
              optional
              value={state.message}
              onChange={(v) => set('message', v)}
              error={errors.message}
              placeholder="Ex. bruit à l’avant droit au freinage depuis une semaine, révision des 60 000 km…"
            />
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="contents">
              <h4 ref={stepHeading} tabIndex={-1} className="display text-[1.6rem] outline-none">
                Votre véhicule et vos disponibilités
              </h4>
            </legend>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <TextField
                id={`${uid}-make`}
                label="Marque"
                value={state.make}
                onChange={(v) => set('make', v)}
                error={errors.make}
                placeholder="Ex. Peugeot"
                autoComplete="off"
              />
              <TextField
                id={`${uid}-model`}
                label="Modèle"
                value={state.model}
                onChange={(v) => set('model', v)}
                error={errors.model}
                placeholder="Ex. 308 1.2 PureTech"
                autoComplete="off"
              />
              <TextField
                id={`${uid}-plate`}
                label="Immatriculation"
                optional
                value={state.plate}
                onChange={(v) => set('plate', v.toUpperCase())}
                error={errors.plate}
                placeholder="AB-123-CD"
                autoComplete="off"
              />
              <TextField
                id={`${uid}-mileage`}
                label="Kilométrage"
                optional
                value={state.mileage}
                onChange={(v) => set('mileage', v.replace(/\D/g, ''))}
                error={errors.mileage}
                placeholder="Ex. 85000"
                inputMode="numeric"
                suffix="km"
              />
              <TextField
                id={`${uid}-date`}
                label="Date souhaitée"
                optional
                type="date"
                min={today || undefined}
                value={state.date}
                onChange={(v) => set('date', v)}
                error={errors.date}
                hint="Sous réserve de confirmation par l’atelier."
              />
              <fieldset>
                <legend className="mb-2 block text-[0.92rem] text-steel-200">
                  Créneau préféré <span className="text-steel-400">(facultatif)</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <label
                      key={slot}
                      className="cursor-pointer rounded-full border border-bone-100/15 px-4 py-2.5 text-[0.9rem] transition-colors hover:border-bone-100/40 has-checked:border-accent has-checked:bg-accent has-checked:text-accent-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
                    >
                      <input type="radio" name="slot" value={slot} checked={state.slot === slot} onChange={() => set('slot', slot)} className="sr-only" />
                      {slot}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="contents">
              <h4 ref={stepHeading} tabIndex={-1} className="display text-[1.6rem] outline-none">
                Comment vous recontacter ?
              </h4>
            </legend>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  id={`${uid}-name`}
                  label="Nom et prénom"
                  value={state.name}
                  onChange={(v) => set('name', v)}
                  error={errors.name}
                  autoComplete="name"
                />
              </div>
              <TextField
                id={`${uid}-phone`}
                label="Téléphone"
                type="tel"
                value={state.phone}
                onChange={(v) => set('phone', v)}
                error={errors.phone}
                autoComplete="tel"
                inputMode="tel"
                placeholder="06 12 34 56 78"
              />
              <TextField
                id={`${uid}-email`}
                label="E-mail"
                optional
                type="email"
                value={state.email}
                onChange={(v) => set('email', v)}
                error={errors.email}
                autoComplete="email"
                placeholder="vous@exemple.fr"
              />
            </div>
            <label id={`${uid}-consent`} className="mt-7 flex cursor-pointer gap-4 text-[0.92rem] leading-relaxed text-steel-200">
              <input
                type="checkbox"
                checked={state.consent}
                onChange={(e) => set('consent', e.target.checked)}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
                className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--brand-accent)]"
              />
              <span>
                J’accepte que mes données soient utilisées par {brandName} pour traiter ma demande et me recontacter. Elles ne sont ni revendues ni utilisées à
                des fins publicitaires.{' '}
                <Link href="/confidentialite" className="underline underline-offset-2 hover:text-bone-100">
                  Politique de confidentialité
                </Link>
              </span>
            </label>
            <FieldError id={`${uid}-consent-err`} message={errors.consent} />
            {/* Champ piège anti-robots, invisible pour les visiteurs */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Ne pas remplir ce champ
                <input tabIndex={-1} autoComplete="off" name="company_website" value={state.website} onChange={(e) => set('website', e.target.value)} />
              </label>
            </div>
          </fieldset>
        )}
      </div>

      <div className="mt-10 flex flex-col-reverse gap-3 border-t border-bone-100/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center justify-center gap-2 py-3 text-steel-200 hover:text-bone-100"
          >
            <Icon name="arrow-left" className="size-4" /> Retour
          </button>
        ) : (
          <span className="text-sm text-steel-400">Champs obligatoires sauf mention « facultatif ».</span>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="submit">Continuer</Button>
        ) : (
          <Button type="submit" disabled={status === 'submitting'} icon={status === 'submitting' ? null : 'arrow-right'}>
            {status === 'submitting' ? 'Envoi en cours…' : 'Envoyer la demande'}
          </Button>
        )}
      </div>
    </form>
  );
}

/* ---------- Champs ---------- */

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-center gap-2 text-[0.88rem] text-[#ffb3a8]">
      <Icon name="alert" className="size-4 shrink-0" />
      {message}
    </p>
  );
}

const inputBase =
  'w-full rounded-[3px] border bg-ink-900 px-4 text-bone-100 placeholder:text-steel-500 transition-colors hover:border-bone-100/35 focus:border-accent focus:outline-none [color-scheme:dark]';

function Label({ htmlFor, label, optional }: { htmlFor: string; label: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-[0.92rem] text-steel-200">
      {label} {optional && <span className="text-steel-400">(facultatif)</span>}
    </label>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  optional?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'numeric' | 'tel' | 'email' | 'text';
  min?: string;
  hint?: string;
  suffix?: string;
}

function TextField({ id, label, value, onChange, error, optional, type = 'text', placeholder, autoComplete, inputMode, min, hint, suffix }: TextFieldProps) {
  const describedBy = [error ? `${id}-err` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <Label htmlFor={id} label={label} optional={optional} />
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={!optional}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`${inputBase} h-13 ${suffix ? 'pr-12' : ''} ${error ? 'border-[#ff8a7a]' : 'border-bone-100/15'}`}
        />
        {suffix && <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 label text-steel-400">{suffix}</span>}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-[0.85rem] text-steel-400">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
}

function TextArea({ id, label, value, onChange, error, optional, placeholder }: Omit<TextFieldProps, 'type'>) {
  return (
    <div className="mt-7">
      <Label htmlFor={id} label={label} optional={optional} />
      <textarea
        id={id}
        rows={4}
        value={value}
        maxLength={1500}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-count${error ? ` ${id}-err` : ''}`}
        className={`${inputBase} resize-y py-3 leading-relaxed ${error ? 'border-[#ff8a7a]' : 'border-bone-100/15'}`}
      />
      <p id={`${id}-count`} className="mt-1 text-right text-[0.8rem] text-steel-400 tabular">
        {value.length} / 1 500
      </p>
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
}
