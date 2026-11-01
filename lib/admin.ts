// Operazioni dell'area riservata (solo browser, utente autenticato).
// Tutte le scritture passano dalle policy RLS: senza login vengono rifiutate.

import {
  BUCKET,
  CATEGORIE,
  bodyToHtml,
  labelFromIso,
  normalizzaSlug,
  slugify,
  supabaseBrowser,
  type Articolo,
  type ArticoloBreve,
  type Foto,
} from '@/lib/supabase';

const CAMPI_ELENCO = 'id,slug,title,date_iso,date_label,category,excerpt,images,published';
const CAMPI_EXPORT = 'slug,title,date_iso,date_label,category,excerpt,body,images,caption,caption2,published';
const BLOCCO = 1000; // righe per richiesta (limite predefinito di Supabase)

export type VoceElenco = ArticoloBreve & { id: string; published: boolean };

/** Legge una tabella intera a blocchi, oltre il limite di 1000 righe. */
async function leggiTutto<T>(tabella: string, campi: string): Promise<T[]> {
  const db = supabaseBrowser();
  const out: T[] = [];
  for (let da = 0; ; da += BLOCCO) {
    const { data, error } = await db
      .from(tabella)
      .select(campi)
      .order('date_iso', { ascending: false, nullsFirst: false })
      .order('slug')
      .range(da, da + BLOCCO - 1);
    if (error) throw new Error(error.message);
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < BLOCCO) break;
  }
  return out;
}

export function caricaElenco(): Promise<VoceElenco[]> {
  return leggiTutto<VoceElenco>('articoli', CAMPI_ELENCO);
}

export async function caricaArticolo(id: string): Promise<Articolo> {
  const { data, error } = await supabaseBrowser().from('articoli').select('*').eq('id', id).single();
  if (error) throw new Error(`Articolo non trovato: ${error.message}`);
  return data as Articolo;
}

export type Bozza = Partial<Articolo> & { slugToccato?: boolean };

/** Crea o aggiorna un articolo. Restituisce il record salvato. */
export async function salvaArticolo(d: Bozza, body: string, pubblicato: boolean): Promise<Articolo> {
  const title = (d.title ?? '').trim();
  if (!title) throw new Error('Il titolo è obbligatorio.');
  const slug = d.slug ? normalizzaSlug(d.slug) : slugify(title);
  if (!slug) throw new Error('Lo slug non è valido: controlla il titolo.');
  const dateIso = d.date_iso || new Date().toISOString().slice(0, 10);

  const riga = {
    slug,
    title,
    date_iso: dateIso,
    date_label: labelFromIso(dateIso),
    category: CATEGORIE.includes(d.category as (typeof CATEGORIE)[number]) ? d.category : CATEGORIE[0],
    excerpt: (d.excerpt ?? '').trim() || null,
    body: pulisciHtml(body),
    images: d.images ?? [],
    caption: (d.caption ?? '').trim() || null,
    caption2: (d.caption2 ?? '').trim() || null,
    published: pubblicato,
  };

  const db = supabaseBrowser();
  const res = d.id
    ? await db.from('articoli').update(riga).eq('id', d.id).select('*').single()
    : await db.from('articoli').insert(riga).select('*').single();

  if (res.error) {
    if (res.error.code === '23505') throw new Error(`Esiste già un articolo con lo slug "${slug}". Modificalo per continuare.`);
    throw new Error(`Salvataggio non riuscito: ${res.error.message}`);
  }
  return res.data as Articolo;
}

export async function cambiaStato(id: string, pubblicato: boolean): Promise<void> {
  const { error } = await supabaseBrowser().from('articoli').update({ published: pubblicato }).eq('id', id);
  if (error) throw new Error(`Aggiornamento non riuscito: ${error.message}`);
}

export async function eliminaArticolo(id: string): Promise<void> {
  const { error } = await supabaseBrowser().from('articoli').delete().eq('id', id);
  if (error) throw new Error(`Eliminazione non riuscita: ${error.message}`);
}

/** Toglie dal corpo i residui vuoti lasciati dall'editor. */
function pulisciHtml(html: string): string {
  return String(html || '')
    .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>')
    .trim();
}

// ---------------------------------------------------------------
// Immagini
// ---------------------------------------------------------------

const MAX_LATO = 2000;

/**
 * Ridimensiona e comprime le foto grandi prima del caricamento:
 * lo spazio gratuito di Supabase dura molto di più e le pagine sono più veloci.
 */
export async function preparaImmagine(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error(`"${file.name}" non è un'immagine.`);
  if (file.size > 20 * 1024 * 1024) throw new Error(`"${file.name}" supera i 20 MB.`);
  if (/gif|svg/.test(file.type)) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const k = Math.min(1, MAX_LATO / Math.max(bitmap.width, bitmap.height));
  if (k === 1 && file.size < 700 * 1024) return file;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.fillStyle = '#fff'; // le parti trasparenti dei PNG diventano bianche
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85));
  return blob ?? file;
}

/** Carica un'immagine nel bucket e restituisce l'indirizzo pubblico. */
export async function caricaImmagine(file: File, cartella: 'articoli' | 'gallery'): Promise<string> {
  const blob = await preparaImmagine(file);
  const ext = blob.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${cartella}/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const db = supabaseBrowser();
  const { error } = await db.storage.from(BUCKET).upload(path, blob, {
    cacheControl: '31536000',
    contentType: blob.type || file.type,
    upsert: false,
  });
  if (error) throw new Error(`Caricamento di "${file.name}" non riuscito: ${error.message}`);
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Percorso nel bucket a partire dall'URL pubblico (null se l'immagine è esterna). */
function percorsoNelBucket(url: string): string | null {
  const segno = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(segno);
  return i >= 0 ? decodeURIComponent(url.slice(i + segno.length)) : null;
}

// ---------------------------------------------------------------
// Import / export
// ---------------------------------------------------------------

export type EsitoImport = { creati: number; aggiornati: number; scartati: number };

/** Import massivo: dedupe e aggiornamento sullo slug, a blocchi di 200. */
export async function importaArticoli(righe: unknown[], avanzamento?: (fatte: number, totale: number) => void): Promise<EsitoImport> {
  const perSlug = new Map<string, Record<string, unknown>>();
  let scartati = 0;
  for (const r of righe as Array<Record<string, unknown>>) {
    const title = String(r?.title ?? '').trim();
    // gli slug esistenti restano interi: due articoli possono avere lo stesso titolo
    const slug = r?.slug ? normalizzaSlug(String(r.slug)) : slugify(title);
    if (!title || !slug) {
      scartati++;
      continue;
    }
    const dateIso = String(r.date_iso ?? '').slice(0, 10) || null;
    perSlug.set(slug, {
      slug,
      title,
      date_iso: dateIso,
      date_label: (r.date_label as string) || labelFromIso(dateIso),
      category: CATEGORIE.includes(r.category as (typeof CATEGORIE)[number]) ? r.category : 'Altre gare',
      excerpt: String(r.excerpt ?? '').trim() || null,
      body: bodyToHtml(r.body),
      images: Array.isArray(r.images) ? (r.images as unknown[]).filter(Boolean).map(String) : [],
      caption: (r.caption as string) || null,
      caption2: (r.caption2 as string) || null,
      published: r.published !== false,
    });
  }

  const esistenti = new Set((await leggiTutto<{ slug: string }>('articoli', 'slug')).map((x) => x.slug));
  const pronte = [...perSlug.values()];
  const aggiornati = pronte.filter((r) => esistenti.has(r.slug as string)).length;

  const db = supabaseBrowser();
  for (let i = 0; i < pronte.length; i += 200) {
    const blocco = pronte.slice(i, i + 200);
    const { error } = await db.from('articoli').upsert(blocco, { onConflict: 'slug' });
    if (error) throw new Error(`Blocco ${i / 200 + 1} non riuscito: ${error.message}`);
    avanzamento?.(Math.min(i + 200, pronte.length), pronte.length);
  }
  return { creati: pronte.length - aggiornati, aggiornati, scartati };
}

/** Scarica la collection completa come file JSON (backup o nuovo import). */
export async function esportaArticoli(): Promise<number> {
  const tutti = await leggiTutto<Record<string, unknown>>('articoli', CAMPI_EXPORT);
  const blob = new Blob([JSON.stringify(tutti, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `articoli-iriense-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return tutti.length;
}

// ---------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------

/** Foto caricate a mano + prima foto di ogni articolo pubblicato (meno quelle nascoste). */
export async function caricaGallery(articoli: VoceElenco[]): Promise<Foto[]> {
  const db = supabaseBrowser();
  const [caricate, nascoste] = await Promise.all([
    db.from('gallery_foto').select('id,src,title,cat,year').order('created_at', { ascending: false }),
    db.from('gallery_nascoste').select('src'),
  ]);
  if (caricate.error) throw new Error(caricate.error.message);
  const hidden = new Set((nascoste.data ?? []).map((r: { src: string }) => r.src));
  const out: Foto[] = [];
  const visti = new Set<string>();
  for (const f of (caricate.data ?? []) as Array<{ id: string; src: string; title: string; cat: string; year: string }>) {
    if (visti.has(f.src)) continue;
    visti.add(f.src);
    out.push({ id: f.id, src: f.src, title: f.title, cat: f.cat, year: f.year, manual: true });
  }
  for (const a of articoli) {
    const src = a.images?.[0];
    if (!a.published || !src || visti.has(src) || hidden.has(src)) continue;
    visti.add(src);
    out.push({ src, title: a.title, cat: a.category, year: (a.date_iso || '').slice(0, 4), slug: a.slug, manual: false });
  }
  return out;
}

export type FotoInAttesa = { key: string; file: File; anteprima: string; title: string; cat: string; year: string };

/** Pubblica le foto controllate nell'anteprima. */
export async function pubblicaFoto(foto: FotoInAttesa[], avanzamento?: (n: number) => void): Promise<number> {
  const db = supabaseBrowser();
  let fatte = 0;
  for (const f of foto) {
    const src = await caricaImmagine(f.file, 'gallery');
    const { error } = await db.from('gallery_foto').insert({
      src,
      title: f.title.trim(),
      cat: f.cat,
      year: f.year,
    });
    if (error) throw new Error(`Salvataggio della foto non riuscito: ${error.message}`);
    avanzamento?.(++fatte);
  }
  return fatte;
}

// ---------------------------------------------------------------
// Messaggi del modulo contatti e iscritti alla newsletter
// ---------------------------------------------------------------

export type Messaggio = { id: string; nome: string; email: string; messaggio: string; created_at: string };
export type Iscritto = { email: string; created_at: string };

/** Messaggi e iscritti, dal più recente. */
export async function caricaPosta(): Promise<{ messaggi: Messaggio[]; iscritti: Iscritto[] }> {
  const db = supabaseBrowser();
  const [m, n] = await Promise.all([
    db.from('messaggi').select('id,nome,email,messaggio,created_at').order('created_at', { ascending: false }).limit(1000),
    db.from('newsletter').select('email,created_at').order('created_at', { ascending: false }).limit(5000),
  ]);
  if (m.error) throw new Error(`Non riesco a leggere i messaggi: ${m.error.message}`);
  if (n.error) throw new Error(`Non riesco a leggere gli iscritti: ${n.error.message}`);
  return { messaggi: (m.data ?? []) as Messaggio[], iscritti: (n.data ?? []) as Iscritto[] };
}

export async function eliminaMessaggio(id: string): Promise<void> {
  const { error } = await supabaseBrowser().from('messaggi').delete().eq('id', id);
  if (error) throw new Error(`Eliminazione non riuscita: ${error.message}`);
}

/** Toglie un indirizzo dalla newsletter (richiesta di cancellazione). */
export async function eliminaIscritto(email: string): Promise<void> {
  const { error } = await supabaseBrowser().from('newsletter').delete().eq('email', email);
  if (error) throw new Error(`Cancellazione non riuscita: ${error.message}`);
}

/** Scarica gli iscritti come CSV (per caricarli in un servizio di invio). */
export function esportaIscritti(iscritti: Iscritto[]): void {
  const righe = ['email,data_iscrizione', ...iscritti.map((i) => `${i.email},${i.created_at.slice(0, 10)}`)];
  const blob = new Blob([righe.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `iscritti-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/** Le foto caricate si eliminano; quelle degli articoli si nascondono soltanto. */
export async function togliFoto(f: Foto): Promise<void> {
  const db = supabaseBrowser();
  if (f.manual && f.id) {
    const { error } = await db.from('gallery_foto').delete().eq('id', f.id);
    if (error) throw new Error(`Operazione non riuscita: ${error.message}`);
    const path = percorsoNelBucket(f.src);
    if (path) await db.storage.from(BUCKET).remove([path]);
    return;
  }
  const { error } = await db.from('gallery_nascoste').upsert({ src: f.src }, { onConflict: 'src' });
  if (error) throw new Error(`Operazione non riuscita: ${error.message}`);
}
