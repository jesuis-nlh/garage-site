const NNBSP = ' ';
const NBSP = ' ';

/** Applique les règles typographiques françaises à une chaîne. */
export function fr(text: string): string {
  if (/^(https?:|mailto:|tel:|\/)/.test(text)) return text;
  return text
    .replace(/ ([:;!?»])/g, `${NNBSP}$1`)
    .replace(/« /g, `«${NNBSP}`)
    .replace(/(\d) (h|%|€|km|min)(?=[\s.,;)]|$)/g, `$1${NBSP}$2`)
    .replace(/(\d\u00A0h) (\d\d)\b/g, `$1${NBSP}$2`)
    .replace(/(\d) (\d{3})\b/g, `$1${NNBSP}$2`)
    .replace(/\b(0\d) (\d\d) (\d\d) (\d\d) (\d\d)\b/g, `$1${NBSP}$2${NBSP}$3${NBSP}$4${NBSP}$5`);
}

/** Parcourt récursivement un objet de contenu et normalise toutes les chaînes. */
export function frenchTypography<T>(value: T): T {
  if (typeof value === 'string') return fr(value) as T;
  if (Array.isArray(value)) return value.map((v) => frenchTypography(v)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      // Les identifiants techniques (id, slug, url, téléphone E.164, horaires) ne sont pas du texte éditorial.
      out[k] = ['id', 'slug', 'url', 'src', 'mp4', 'webm', 'poster', 'phoneE164', 'open', 'close', 'mapsUrl', 'checkedAt'].includes(k)
        ? v
        : frenchTypography(v);
    }
    return out as T;
  }
  return value;
}
