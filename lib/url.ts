/** Indirizzo dell'elenco articoli con i filtri attivi (usato da server e browser). */
export function urlRisultati(cat: string, q: string, pagina = 1): string {
  const p = new URLSearchParams();
  if (cat && cat !== 'Tutti') p.set('cat', cat);
  if (q) p.set('q', q);
  if (pagina > 1) p.set('pagina', String(pagina));
  const s = p.toString();
  return s ? `/risultati?${s}` : '/risultati';
}
