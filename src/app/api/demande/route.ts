import { NextResponse } from 'next/server';
import { garage } from '@/config';
import { fieldErrors, leadSchema, type LeadResponse } from '@/lib/lead';
import { deliverLead } from '@/lib/delivery';
import { isClosedOn, parisToday } from '@/lib/hours';

export const runtime = 'nodejs';

// Limitation simple par IP (mémoire du processus : à remplacer par un store partagé en multi-instances)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

const reply = (body: LeadResponse, status: number) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (origin && host && new URL(origin).host !== host) return reply({ ok: false, code: 'BAD_REQUEST' }, 403);

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local';
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) return reply({ ok: false, code: 'RATE_LIMITED' }, 429);
  hits.set(ip, [...recent, now]);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return reply({ ok: false, code: 'BAD_REQUEST' }, 400);
  }

  // Champ piège rempli : robot. Réponse neutre, aucune transmission.
  if (body && typeof body === 'object' && 'website' in body && (body as { website?: unknown }).website) {
    return reply({ ok: true, channel: 'none' }, 200);
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return reply({ ok: false, code: 'INVALID', errors: fieldErrors(parsed.error) }, 422);

  const lead = parsed.data;
  if (lead.date) {
    if (lead.date < parisToday()) return reply({ ok: false, code: 'INVALID', errors: { date: 'Choisissez une date à venir.' } }, 422);
    if (isClosedOn(garage.hours, lead.date)) {
      return reply({ ok: false, code: 'INVALID', errors: { date: 'Le centre est habituellement fermé ce jour-là : choisissez une autre date.' } }, 422);
    }
  }

  const result = await deliverLead(lead);
  if (result.ok) return reply({ ok: true, channel: result.channels.join('+') }, 200);
  if (result.reason === 'not_configured') return reply({ ok: false, code: 'NOT_CONFIGURED' }, 503);
  return reply({ ok: false, code: 'DELIVERY_FAILED' }, 502);
}
