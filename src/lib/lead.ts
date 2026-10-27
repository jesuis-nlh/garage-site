import { z } from 'zod';

/** Schéma d'une demande de rendez-vous / devis, partagé entre le navigateur et le serveur. */
export const leadSchema = z.object({
  service: z.string().min(1, { error: 'Choisissez une prestation.' }).max(40),
  concern: z.string().max(60).optional(),
  message: z.string().trim().max(1500, { error: '1 500 caractères maximum.' }).optional(),
  make: z.string().trim().min(1, { error: 'Indiquez la marque du véhicule.' }).max(40, { error: '40 caractères maximum.' }),
  model: z.string().trim().min(1, { error: 'Indiquez le modèle du véhicule.' }).max(60, { error: '60 caractères maximum.' }),
  plate: z.string().trim().max(12, { error: 'Immatriculation trop longue.' }).optional(),
  mileage: z
    .string()
    .trim()
    .regex(/^\d{0,7}$/, { error: 'Indiquez un kilométrage en chiffres.' })
    .optional(),
  date: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, { error: 'Date invalide.' })
    .optional(),
  slot: z.string().max(60).optional(),
  name: z.string().trim().min(2, { error: 'Indiquez votre nom.' }).max(80, { error: '80 caractères maximum.' }),
  phone: z
    .string()
    .trim()
    .regex(/^(?:(?:\+|00)33[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}$/, { error: 'Indiquez un numéro de téléphone valide (ex. 06 12 34 56 78).' }),
  email: z.union([z.literal(''), z.email({ error: 'Adresse e-mail invalide.' })]).optional(),
  consent: z.literal(true, { error: 'Votre accord est nécessaire pour transmettre la demande.' }),
  /** Champ piège anti-robot : doit rester vide. */
  website: z.string().max(0).optional(),
});

export type Lead = z.infer<typeof leadSchema>;

export const stepFields: (keyof Lead)[][] = [
  ['service', 'message'],
  ['make', 'model', 'plate', 'mileage', 'date', 'slot'],
  ['name', 'phone', 'email', 'consent'],
];

export function fieldErrors(error: z.ZodError): Partial<Record<keyof Lead, string>> {
  const out: Partial<Record<keyof Lead, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof Lead;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export type LeadResponse =
  | { ok: true; channel: string }
  | { ok: false; code: 'INVALID'; errors: Partial<Record<keyof Lead, string>> }
  | { ok: false; code: 'NOT_CONFIGURED' | 'DELIVERY_FAILED' | 'RATE_LIMITED' | 'BAD_REQUEST' };
