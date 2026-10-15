import 'server-only';
import type { Lead } from './lead';
import { garage } from '@/config';
import { serviceById } from './services';

type DeliveryResult = { ok: true; channels: string[] } | { ok: false; reason: 'not_configured' | 'provider_error' };

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function summarize(lead: Lead) {
  const service = serviceById(lead.service)?.title ?? lead.service;
  const rows: [string, string | undefined][] = [
    ['Prestation', service],
    ['Motif', lead.concern],
    ['Véhicule', `${lead.make} ${lead.model}`],
    ['Immatriculation', lead.plate],
    ['Kilométrage', lead.mileage ? `${lead.mileage} km` : undefined],
    [
      'Date souhaitée',
      lead.date ? new Date(`${lead.date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : undefined,
    ],
    ['Créneau', lead.slot],
    ['Nom', lead.name],
    ['Téléphone', lead.phone],
    ['E-mail', lead.email || undefined],
    ['Message', lead.message],
  ];
  return rows.filter((r): r is [string, string] => Boolean(r[1]));
}

async function sendEmail(lead: Lead): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_EMAIL_TO;
  const from = process.env.LEAD_EMAIL_FROM;
  if (!key || !to || !from) return false;
  const rows = summarize(lead);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: to.split(',').map((s) => s.trim()),
      reply_to: lead.email || undefined,
      subject: `Demande de rendez-vous — ${rows[0][1]} — ${lead.name}`,
      text: `Nouvelle demande reçue depuis le site ${garage.brand.name}.\n\n${rows.map(([k, v]) => `${k} : ${v}`).join('\n')}\n\nÀ rappeler pour confirmer le créneau.`,
      html: `<p>Nouvelle demande reçue depuis le site <strong>${escapeHtml(garage.brand.name)}</strong>.</p><table cellpadding="6" style="border-collapse:collapse">${rows
        .map(([k, v]) => `<tr><td style="color:#666">${escapeHtml(k)}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`)
        .join('')}</table><p>À rappeler pour confirmer le créneau.</p>`,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
  return true;
}

async function sendWebhook(lead: Lead): Promise<boolean> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return false;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.LEAD_WEBHOOK_SECRET ? { 'X-Webhook-Secret': process.env.LEAD_WEBHOOK_SECRET } : {}),
    },
    body: JSON.stringify({
      type: 'appointment_request',
      garage: garage.id,
      receivedAt: new Date().toISOString(),
      lead: { ...lead, website: undefined, serviceLabel: serviceById(lead.service)?.title },
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Webhook ${res.status}`);
  return true;
}

export function deliveryConfigured() {
  return Boolean((process.env.RESEND_API_KEY && process.env.LEAD_EMAIL_TO && process.env.LEAD_EMAIL_FROM) || process.env.LEAD_WEBHOOK_URL);
}

/** Transmet la demande sur chaque canal configuré. Succès si au moins un canal a accepté. */
export async function deliverLead(lead: Lead): Promise<DeliveryResult> {
  if (!deliveryConfigured()) return { ok: false, reason: 'not_configured' };
  const attempts = await Promise.allSettled([
    sendEmail(lead).then((sent) => (sent ? 'email' : null)),
    sendWebhook(lead).then((sent) => (sent ? 'webhook' : null)),
  ]);
  const channels = attempts.flatMap((a) => (a.status === 'fulfilled' && a.value ? [a.value] : []));
  attempts.forEach((a) => a.status === 'rejected' && console.error('[lead] échec de transmission :', a.reason));
  return channels.length ? { ok: true, channels } : { ok: false, reason: 'provider_error' };
}
