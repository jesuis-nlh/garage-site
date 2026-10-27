import type { DayKey, TimeRange } from '@/config/types';

export const dayOrder: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const dayLabels: Record<DayKey, string> = {
  mon: 'Lundi',
  tue: 'Mardi',
  wed: 'Mercredi',
  thu: 'Jeudi',
  fri: 'Vendredi',
  sat: 'Samedi',
  sun: 'Dimanche',
};

const schemaDays: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

/** « 08:00 » → « 8 h », « 18:30 » → « 18 h 30 » */
export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}

export function formatRanges(ranges: TimeRange[]): string {
  if (!ranges.length) return 'Fermé';
  return ranges.map((r) => `${formatTime(r.open)} – ${formatTime(r.close)}`).join(' · ');
}

/** Regroupe les jours consécutifs aux horaires identiques : « Lundi – Vendredi ». */
export function groupedHours(hours: Record<DayKey, TimeRange[]>) {
  const groups: { days: string; value: string }[] = [];
  let start = 0;
  for (let i = 1; i <= dayOrder.length; i++) {
    const prev = formatRanges(hours[dayOrder[i - 1]]);
    const cur = i < dayOrder.length ? formatRanges(hours[dayOrder[i]]) : null;
    if (cur !== prev) {
      const a = dayLabels[dayOrder[start]];
      const b = dayLabels[dayOrder[i - 1]];
      groups.push({ days: start === i - 1 ? a : `${a} – ${b}`, value: prev });
      start = i;
    }
  }
  return groups;
}

export function openDaysCount(hours: Record<DayKey, TimeRange[]>) {
  return dayOrder.filter((d) => hours[d].length > 0).length;
}

/** Heure courante à Paris, quel que soit le fuseau du visiteur. */
export function parisNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const map: Record<string, DayKey> = { Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri', Sat: 'sat', Sun: 'sun' };
  return { day: map[get('weekday')], minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export interface OpenStatus {
  open: boolean;
  label: string;
  today: DayKey;
}

/** Statut d'ouverture indicatif (hors jours fériés et fermetures exceptionnelles). */
export function openStatus(hours: Record<DayKey, TimeRange[]>, date = new Date()): OpenStatus {
  const { day, minutes } = parisNow(date);
  const current = hours[day].find((r) => minutes >= toMinutes(r.open) && minutes < toMinutes(r.close));
  if (current) return { open: true, label: `Ouvert · ferme à ${formatTime(current.close)}`, today: day };
  const laterToday = hours[day].find((r) => minutes < toMinutes(r.open));
  if (laterToday) return { open: false, label: `Fermé · ouvre à ${formatTime(laterToday.open)}`, today: day };
  const idx = dayOrder.indexOf(day);
  for (let k = 1; k <= 7; k++) {
    const d = dayOrder[(idx + k) % 7];
    if (hours[d].length) {
      const when = k === 1 ? 'demain' : dayLabels[d].toLowerCase();
      return { open: false, label: `Fermé · ouvre ${when} à ${formatTime(hours[d][0].open)}`, today: day };
    }
  }
  return { open: false, label: 'Fermé', today: day };
}

export function schemaOpeningHours(hours: Record<DayKey, TimeRange[]>) {
  return dayOrder.flatMap((d) => hours[d].map((r) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: schemaDays[d], opens: r.open, closes: r.close })));
}

/** Jour de fermeture habituel pour une date AAAA-MM-JJ (heure de Paris). */
export function isClosedOn(hours: Record<DayKey, TimeRange[]>, isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  const key = dayOrder[(d.getUTCDay() + 6) % 7];
  return hours[key].length === 0;
}

/** Date du jour à Paris, format AAAA-MM-JJ. */
export function parisToday(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
