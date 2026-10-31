// Client Supabase e utilità condivise tra sito pubblico e area riservata.
// Le chiavi vivono nelle variabili d'ambiente (mai nel codice).
// La chiave "anon" è pubblica per natura: i permessi veri li decidono le
// policy RLS definite in supabase/schema.sql.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** true quando le chiavi Supabase sono state configurate (locale o Vercel). */
export const supabaseConfigurato = Boolean(url && anonKey);

let browserClient: SupabaseClient | null = null;

/** Client per il browser: mantiene la sessione dell'area riservata. */
export function supabaseBrowser(): SupabaseClient {
  if (!supabaseConfigurato) throw new Error('Supabase non configurato.');
  if (!browserClient) browserClient = createClient(url, anonKey);
  return browserClient;
}

/** Client per il server: solo letture pubbliche e inserimenti dai moduli. */
export function supabaseServer(): SupabaseClient {
  if (!supabaseConfigurato) throw new Error('Supabase non configurato.');
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const BUCKET = 'articoli-foto';

export const CATEGORIE = [
  'Assoluti',
  'Amatori',
  'Giovanile',
  'Gare organizzate',
  'Comunicazioni',
  'Altre gare',
] as const;

export type Categoria = (typeof CATEGORIE)[number];

export type Articolo = {
  id?: string;
  slug: string;
  title: string;
  date_iso: string | null;
  date_label: string | null;
  category: string;
  excerpt: string | null;
  body: string | null;
  images: string[];
  caption: string | null;
  caption2: string | null;
  published: boolean;
  created_at?: string;
};

/** Versione leggera per elenchi e card (senza il corpo). */
export type ArticoloBreve = Pick<
  Articolo,
  'slug' | 'title' | 'date_iso' | 'date_label' | 'category' | 'excerpt' | 'images'
> & { id?: string; published?: boolean };

export type Foto = {
  id?: string;
  src: string;
  title: string;
  cat: string;
  year: string;
  slug?: string;
  manual: boolean;
};

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

/** Normalizza uno slug (minuscole, accenti rimossi, trattini). */
export function normalizzaSlug(s: string, max = 120): string {
  return String(s || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/, '');
}

/** Titolo → slug per l'URL, al massimo 70 caratteri. */
export function slugify(s: string): string {
  return normalizzaSlug(s, 70);
}

/** 2026-07-15 → "15 lug 2026" */
export function labelFromIso(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  return m ? `${Number(m[3])} ${MESI[Number(m[2]) - 1]} ${m[1]}` : '';
}

/** body come array di paragrafi (JSON legacy) oppure HTML già pronto. */
export function bodyToHtml(body: unknown): string {
  if (Array.isArray(body)) {
    return body
      .filter(Boolean)
      .map((p) => `<p>${String(p).trim()}</p>`)
      .join('\n');
  }
  const s = String(body ?? '').trim();
  if (!s) return '';
  return /<[a-z][\s\S]*>/i.test(s) ? s : `<p>${s}</p>`;
}

/** Anno a 4 cifre da una data ISO o da un'etichetta. */
export function annoDi(a: { date_iso?: string | null; date_label?: string | null }): string {
  return (a.date_iso || '').slice(0, 4) || String(a.date_label || '').slice(-4);
}
