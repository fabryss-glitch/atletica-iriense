/**
 * Import massivo di articoli su Supabase.
 *
 *   npm run import-articoli
 *   node scripts/import-articoli.mjs data/articoli.json --dry-run
 *
 * Il JSON in ingresso è un array di oggetti con i campi:
 *   id?, slug?, date_iso, date_label?, category, title, excerpt,
 *   body (array di paragrafi oppure HTML), caption?, caption2?, images?, published?
 *
 * Regole:
 *   · body array  → unito in tag <p>
 *   · slug        → generato dal titolo se mancante
 *   · dedupe      → upsert sulla colonna slug (nessun duplicato, ri-eseguibile)
 *
 * Variabili d'ambiente richieste (mai in chiaro nel codice):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;


const CATEGORIE = ['Assoluti', 'Amatori', 'Giovanile', 'Gare organizzate', 'Comunicazioni', 'Altre gare'];
const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const CHUNK = 200; // righe per batch

/** Titolo → slug (minuscole, accenti rimossi, trattini). */
function slugify(s, max = 70) {
  return String(s || '')
    .toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/, '');
}

/** 2026-07-15 → "15 lug 2026" */
function labelFromIso(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  if (!m) return null;
  return `${Number(m[3])} ${MESI[Number(m[2]) - 1]} ${m[1]}`;
}

/** body: array di paragrafi → HTML; stringa già HTML → invariata. */
function bodyToHtml(body) {
  if (Array.isArray(body)) {
    return body.filter(Boolean).map((p) => `<p>${String(p).trim()}</p>`).join('\n');
  }
  const s = String(body || '').trim();
  if (!s) return '';
  return /<[a-z][\s\S]*>/i.test(s) ? s : `<p>${s}</p>`;
}

/** Riga JSON → riga tabella articoli. Restituisce null se non importabile. */
function toRow(raw) {
  const title = String(raw.title || '').trim();
  if (!title) return null;

  // gli slug esistenti restano interi: due articoli possono avere lo stesso titolo
  const slug = raw.slug ? slugify(raw.slug, 120) : slugify(title);
  if (!slug) return null;

  const dateIso = String(raw.date_iso || '').slice(0, 10) || null;

  return {
    slug,
    title,
    date_iso: dateIso,
    date_label: raw.date_label || labelFromIso(dateIso),
    category: CATEGORIE.includes(raw.category) ? raw.category : 'Altre gare',
    excerpt: String(raw.excerpt || '').trim() || null,
    body: bodyToHtml(raw.body),
    images: Array.isArray(raw.images) ? raw.images.filter(Boolean) : [],
    caption: raw.caption || null,
    caption2: raw.caption2 || null,
    published: raw.published === false ? false : true,
  };
}

async function main() {
  const file = process.argv[2];
  const dryRun = process.argv.includes('--dry-run');
  if (!file) {
    console.error('Uso: node import-articoli.mjs <file.json> [--dry-run]');
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(await readFile(file, 'utf8'));
  } catch (err) {
    console.error(`Lettura o parsing di ${file} non riuscito:`, err.message);
    process.exit(1);
  }

  const input = Array.isArray(parsed) ? parsed : parsed?.articoli;
  if (!Array.isArray(input)) {
    console.error('Il file deve contenere un array di articoli (o { "articoli": [...] }).');
    process.exit(1);
  }

  // Normalizzazione + dedupe interno sullo slug (vince l'ultima occorrenza)
  const bySlug = new Map();
  let scartati = 0;
  for (const raw of input) {
    const row = toRow(raw);
    if (!row) { scartati++; continue; }
    bySlug.set(row.slug, row);
  }
  const rows = [...bySlug.values()];

  console.log(`Articoli nel file: ${input.length}`);
  console.log(`Pronti all'import: ${rows.length}${scartati ? ` · scartati: ${scartati} (titolo mancante)` : ''}`);

  if (dryRun) {
    console.log('--dry-run: nessuna scrittura. Prime 3 righe:');
    console.log(JSON.stringify(rows.slice(0, 3), null, 2));
    return;
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Manca SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY nelle variabili d\'ambiente.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  let scritti = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = rows.slice(i, i + CHUNK);
    const { error, count } = await supabase
      .from('articoli')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: false, count: 'exact' });

    if (error) {
      console.error(`Batch ${i / CHUNK + 1} non riuscito:`, error.message);
      process.exit(1);
    }
    scritti += count ?? batch.length;
    console.log(`Batch ${i / CHUNK + 1}: ${batch.length} righe salvate.`);
  }

  console.log(`\nImport completato: ${scritti} articoli inseriti o aggiornati.`);
}

main().catch((err) => {
  console.error('Errore inatteso:', err);
  process.exit(1);
});
