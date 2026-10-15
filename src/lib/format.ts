const spelled = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'];

/** Nombre en toutes lettres (jusqu'à douze), sinon en chiffres. */
export const spell = (n: number) => spelled[n] ?? String(n);

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const formatNumber = (n: number) => n.toLocaleString('fr-FR').replace(/ |\s/g, ' ');
