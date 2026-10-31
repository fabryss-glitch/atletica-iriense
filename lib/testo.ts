// Piccole utilità di testo, usabili sia nel sito sia nell'area riservata.

/**
 * L'estratto serve come apertura dell'articolo solo se non ricalca le
 * prime righe del corpo (negli articoli importati da WordPress spesso sì).
 */
export function aperturaUtile(a: { excerpt: string | null; body: string | null }): string {
  const pulisci = (s: string | null) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const ex = pulisci(a.excerpt).replace(/…$/, '').trim();
  if (!ex) return '';
  const testo = pulisci(a.body);
  const chiave = ex.slice(0, Math.min(60, ex.length));
  return testo.slice(0, ex.length + 8).includes(chiave) ? '' : ex;
}
