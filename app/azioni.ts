'use server';

// Azioni dei moduli pubblici. Scrivono su Supabase con la chiave anon:
// le policy RLS permettono solo l'inserimento, la lettura resta all'area riservata.

import { supabaseConfigurato, supabaseServer } from '@/lib/supabase';

export type EsitoModulo = { ok: boolean; messaggio: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NON_ATTIVO =
  'Il modulo non è ancora attivo. Nel frattempo scrivici a atleticairiense@gmail.com.';

export async function iscriviNewsletter(_prev: EsitoModulo, form: FormData): Promise<EsitoModulo> {
  // Campo trappola: le persone non lo vedono, i bot lo compilano.
  if (String(form.get('sito') || '')) return { ok: true, messaggio: 'Iscrizione registrata.' };

  const email = String(form.get('email') || '').trim().toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, messaggio: 'Inserisci un indirizzo email valido.' };
  if (!supabaseConfigurato) return { ok: false, messaggio: NON_ATTIVO };

  const { error } = await supabaseServer().from('newsletter').insert({ email });
  if (error && error.code !== '23505') {
    return { ok: false, messaggio: 'Iscrizione non riuscita, riprova tra poco.' };
  }
  return { ok: true, messaggio: 'Iscrizione registrata: riceverai le novità della società.' };
}

export async function inviaMessaggio(_prev: EsitoModulo, form: FormData): Promise<EsitoModulo> {
  if (String(form.get('sito') || '')) return { ok: true, messaggio: 'Messaggio inviato.' };

  const nome = String(form.get('nome') || '').trim().slice(0, 120);
  const email = String(form.get('email') || '').trim().toLowerCase().slice(0, 200);
  const messaggio = String(form.get('messaggio') || '').trim().slice(0, 5000);

  if (!nome) return { ok: false, messaggio: 'Scrivi il tuo nome.' };
  if (!EMAIL.test(email)) return { ok: false, messaggio: 'Inserisci un indirizzo email valido, così possiamo risponderti.' };
  if (messaggio.length < 5) return { ok: false, messaggio: 'Scrivi il messaggio da inviare.' };
  if (!supabaseConfigurato) return { ok: false, messaggio: NON_ATTIVO };

  const { error } = await supabaseServer().from('messaggi').insert({ nome, email, messaggio });
  if (error) return { ok: false, messaggio: 'Invio non riuscito, riprova o scrivici a atleticairiense@gmail.com.' };
  return { ok: true, messaggio: 'Messaggio inviato. Ti risponderemo il prima possibile.' };
}
