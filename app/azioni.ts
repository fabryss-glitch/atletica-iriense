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
  await avvisaSegreteria(nome, email, messaggio);
  return { ok: true, messaggio: 'Messaggio inviato. Ti risponderemo il prima possibile.' };
}

/**
 * Email di avviso alla segreteria per ogni nuovo messaggio, tramite Resend.
 * Senza RESEND_API_KEY non fa nulla: il messaggio resta comunque salvato
 * e si legge in /admin → Messaggi. Un errore di invio non blocca il modulo.
 */
async function avvisaSegreteria(nome: string, email: string, messaggio: string): Promise<void> {
  const chiave = process.env.RESEND_API_KEY;
  if (!chiave) return;
  const sito = process.env.NEXT_PUBLIC_SITE_URL || 'https://atletica-iriense.vercel.app';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${chiave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.AVVISI_MITTENTE || 'Sito Atletica Iriense <onboarding@resend.dev>',
        to: [process.env.AVVISI_EMAIL || 'atleticairiense@gmail.com'],
        reply_to: email, // "Rispondi" scrive direttamente a chi ha compilato il modulo
        subject: `Nuovo messaggio dal sito: ${nome}`,
        text: `${nome} <${email}> ha scritto dal modulo contatti:\n\n${messaggio}\n\n—\nRispondi a questa email per scrivere a ${nome}.\nTutti i messaggi: ${sito}/admin`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error('Avviso email non inviato:', res.status, await res.text());
  } catch (e) {
    console.error('Avviso email non inviato:', e);
  }
}
