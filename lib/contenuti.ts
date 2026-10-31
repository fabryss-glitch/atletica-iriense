// Accesso ai contenuti per le pagine pubbliche (solo lato server).
//
// Con le chiavi Supabase configurate legge dal database; senza, usa
// data/articoli.json (632 articoli dall'export WordPress). Così il sito
// si può pubblicare e mostrare anche prima di collegare il backend.

import archivio from '@/data/articoli.json';
import {
  supabaseConfigurato,
  supabaseServer,
  type Articolo,
  type ArticoloBreve,
  type Foto,
} from '@/lib/supabase';

const CAMPI_BREVI = 'slug,title,date_iso,date_label,category,excerpt,images';

/** Articoli locali, ordinati dal più recente. Caricati una volta sola. */
const locali: Articolo[] = (archivio as unknown as Articolo[])
  .map((a) => ({ ...a, images: a.images ?? [], published: a.published !== false }))
  .sort((a, b) => ((a.date_iso ?? '') < (b.date_iso ?? '') ? 1 : -1));

function breve(a: Articolo): ArticoloBreve {
  return {
    slug: a.slug,
    title: a.title,
    date_iso: a.date_iso,
    date_label: a.date_label,
    category: a.category,
    excerpt: a.excerpt,
    images: a.images ?? [],
  };
}

/** Toglie i caratteri che romperebbero il filtro .or() di PostgREST. */
function pulisciRicerca(q: string): string {
  return q.replace(/[,()%*\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

export type Ricerca = { cat?: string; q?: string; pagina?: number; perPagina?: number };
export type RisultatoRicerca = { articoli: ArticoloBreve[]; totale: number; pagina: number; pagine: number };

/** Elenco pubblico con filtro per categoria, ricerca testuale e pagine. */
export async function cercaArticoli({ cat, q, pagina = 1, perPagina = 12 }: Ricerca): Promise<RisultatoRicerca> {
  const testo = pulisciRicerca(q ?? '');
  const categoria = cat && cat !== 'Tutti' ? cat : '';

  if (supabaseConfigurato) {
    // Prima il conteggio, per riportare la pagina dentro i limiti.
    let conta = supabaseServer().from('articoli').select('slug', { count: 'exact', head: true }).eq('published', true);
    if (categoria) conta = conta.eq('category', categoria);
    if (testo) conta = conta.or(`title.ilike.%${testo}%,excerpt.ilike.%${testo}%`);
    const { count } = await conta;
    const totale = count ?? 0;
    const pagine = Math.max(1, Math.ceil(totale / perPagina));
    const p = Math.min(Math.max(1, pagina), pagine);

    let query = supabaseServer()
      .from('articoli')
      .select(CAMPI_BREVI)
      .eq('published', true)
      .order('date_iso', { ascending: false, nullsFirst: false })
      .range((p - 1) * perPagina, p * perPagina - 1);
    if (categoria) query = query.eq('category', categoria);
    if (testo) query = query.or(`title.ilike.%${testo}%,excerpt.ilike.%${testo}%`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { articoli: (data ?? []) as ArticoloBreve[], totale, pagina: p, pagine };
  }

  const t = testo.toLowerCase();
  const filtrati = locali.filter(
    (a) =>
      a.published &&
      (!categoria || a.category === categoria) &&
      (!t || `${a.title} ${a.excerpt ?? ''}`.toLowerCase().includes(t)),
  );
  const totale = filtrati.length;
  const pagine = Math.max(1, Math.ceil(totale / perPagina));
  const p = Math.min(Math.max(1, pagina), pagine);
  return {
    articoli: filtrati.slice((p - 1) * perPagina, p * perPagina).map(breve),
    totale,
    pagina: p,
    pagine,
  };
}

/** Gli articoli più recenti, escluso eventualmente quello aperto. */
export async function articoliRecenti(n: number, escludi?: string): Promise<ArticoloBreve[]> {
  if (supabaseConfigurato) {
    let query = supabaseServer()
      .from('articoli')
      .select(CAMPI_BREVI)
      .eq('published', true)
      .order('date_iso', { ascending: false, nullsFirst: false })
      .limit(n);
    if (escludi) query = query.neq('slug', escludi);
    const { data } = await query;
    return (data ?? []) as ArticoloBreve[];
  }
  return locali.filter((a) => a.published && a.slug !== escludi).slice(0, n).map(breve);
}

/** Articolo singolo pubblicato, oppure null. */
export async function articoloDaSlug(slug: string): Promise<Articolo | null> {
  if (supabaseConfigurato) {
    const { data } = await supabaseServer()
      .from('articoli')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    return (data as Articolo) ?? null;
  }
  return locali.find((a) => a.slug === slug && a.published) ?? null;
}

/** Titolo accorciato per le didascalie della gallery. */
function corto(t: string): string {
  return t.length > 46 ? t.slice(0, 43).replace(/\s+\S*$/, '') + '…' : t;
}

/**
 * Foto per la gallery: prima quelle caricate dall'area riservata, poi la
 * prima foto di ogni articolo (escluse quelle nascoste dall'area riservata).
 */
export async function fotoGallery(limite = 240): Promise<Foto[]> {
  const out: Foto[] = [];
  const visti = new Set<string>();
  let nascoste = new Set<string>();
  let articoli: ArticoloBreve[] = locali.filter((a) => a.published).map(breve);

  if (supabaseConfigurato) {
    const db = supabaseServer();
    const [caricate, hidden, recenti] = await Promise.all([
      db.from('gallery_foto').select('id,src,title,cat,year').order('created_at', { ascending: false }),
      db.from('gallery_nascoste').select('src'),
      db
        .from('articoli')
        .select('slug,title,date_iso,date_label,category,images')
        .eq('published', true)
        .order('date_iso', { ascending: false, nullsFirst: false })
        .limit(limite + 60),
    ]);
    nascoste = new Set((hidden.data ?? []).map((r: { src: string }) => r.src));
    for (const f of (caricate.data ?? []) as Array<{ id: string; src: string; title: string; cat: string; year: string }>) {
      if (!f.src || visti.has(f.src)) continue;
      visti.add(f.src);
      out.push({ id: f.id, src: f.src, title: corto(f.title || ''), cat: f.cat || 'Altre gare', year: f.year || '', manual: true });
    }
    articoli = (recenti.data ?? []) as ArticoloBreve[];
  }

  for (const a of articoli) {
    const src = a.images?.[0];
    if (!src || visti.has(src) || nascoste.has(src)) continue;
    visti.add(src);
    out.push({ src, slug: a.slug, cat: a.category, title: corto(a.title || ''), year: (a.date_iso || '').slice(0, 4), manual: false });
    if (out.length >= limite) break;
  }
  return out;
}

/** Le foto più vecchie dell'archivio, una per articolo (pagina Società). */
export async function fotoStoriche(n = 5): Promise<Foto[]> {
  let lista: ArticoloBreve[];
  if (supabaseConfigurato) {
    const { data } = await supabaseServer()
      .from('articoli')
      .select('slug,title,date_iso,date_label,category,images')
      .eq('published', true)
      .neq('images', '{}')
      .order('date_iso', { ascending: true, nullsFirst: false })
      .limit(n * 3);
    lista = (data ?? []) as ArticoloBreve[];
  } else {
    lista = [...locali].reverse().filter((a) => a.published && a.images?.length).map(breve);
  }
  const out: Foto[] = [];
  const visti = new Set<string>();
  for (const a of lista) {
    const src = a.images?.[0];
    if (!src || visti.has(src)) continue;
    visti.add(src);
    out.push({ src, title: a.title, cat: a.category, year: (a.date_iso || '').slice(0, 4), slug: a.slug, manual: false });
    if (out.length >= n) break;
  }
  return out;
}
