'use client';

import { useCallback, useEffect, useState } from 'react';
import { caricaPosta, eliminaIscritto, eliminaMessaggio, esportaIscritti, type Iscritto, type Messaggio } from '@/lib/admin';
import { Conferma, Icone } from './ui';

const quando = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Risposta già indirizzata, nel programma di posta della segreteria. */
const rispondi = (m: Messaggio) =>
  `mailto:${m.email}?subject=${encodeURIComponent('Atletica Iriense · risposta al tuo messaggio')}` +
  `&body=${encodeURIComponent(`Ciao ${m.nome},\n\n\n\n— Atletica Iriense Voghera\n\n> ${m.messaggio.replace(/\n/g, '\n> ')}`)}`;

type DaTogliere = { tipo: 'messaggio'; m: Messaggio } | { tipo: 'iscritto'; i: Iscritto };

export default function MessaggiAdmin({ avvisa }: { avvisa: (t: string, errore?: boolean) => void }) {
  const [posta, setPosta] = useState<{ messaggi: Messaggio[]; iscritti: Iscritto[] } | null>(null);
  const [errore, setErrore] = useState('');
  const [scheda, setScheda] = useState<'Messaggi' | 'Newsletter'>('Messaggi');
  const [daTogliere, setDaTogliere] = useState<DaTogliere | null>(null);

  const ricarica = useCallback(() => {
    caricaPosta()
      .then((p) => {
        setPosta(p);
        setErrore('');
      })
      .catch((e) => setErrore(e instanceof Error ? e.message : 'Non riesco a caricare i messaggi.'));
  }, []);

  useEffect(ricarica, [ricarica]);

  async function togli() {
    const x = daTogliere;
    setDaTogliere(null);
    if (!x) return;
    try {
      if (x.tipo === 'messaggio') {
        await eliminaMessaggio(x.m.id);
        avvisa(`Messaggio di ${x.m.nome} eliminato.`);
      } else {
        await eliminaIscritto(x.i.email);
        avvisa(`${x.i.email} tolto dalla newsletter.`);
      }
      ricarica();
    } catch (e) {
      avvisa(e instanceof Error ? e.message : 'Operazione non riuscita.', true);
    }
  }

  async function copiaIndirizzi() {
    try {
      await navigator.clipboard.writeText((posta?.iscritti ?? []).map((i) => i.email).join(', '));
      avvisa('Indirizzi copiati: incollali nel campo Ccn della tua email.');
    } catch {
      avvisa('Copia non riuscita: usa "Scarica CSV".', true);
    }
  }

  const messaggi = posta?.messaggi ?? [];
  const iscritti = posta?.iscritti ?? [];

  return (
    <section className="adm-section">
      <div className="wrap">
        <div className="adm-kicker">Collection · Messaggi</div>
        <h1 className="adm-title">Messaggi e iscritti</h1>
        <p className="adm-sub">
          {posta ? `${messaggi.length} messaggi dal modulo contatti · ${iscritti.length} iscritti alla newsletter` : 'Caricamento…'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 26 }}>
          {([['Messaggi', messaggi.length], ['Newsletter', iscritti.length]] as const).map(([l, n]) => (
            <button key={l} className={`chip${scheda === l ? ' chip--on' : ''}`} onClick={() => setScheda(l)}>
              {l}
              <span className="mono">{n}</span>
            </button>
          ))}
        </div>

        {errore && <div className="notice notice--error" role="alert" style={{ marginTop: 20 }}>{errore}</div>}

        {posta && scheda === 'Messaggi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
            {messaggi.length === 0 && (
              <div className="empty" style={{ padding: '44px 20px' }}>
                <strong>Nessun messaggio</strong>
                <p>Quando qualcuno scrive dal modulo della pagina Contatti, il messaggio compare qui.</p>
              </div>
            )}
            {messaggi.map((m) => (
              <article className="panel panel--pad" key={m.id} style={{ gap: 12 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px 16px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{m.nome}</div>
                    <a href={`mailto:${m.email}`} className="mono" style={{ fontSize: 13, color: 'var(--blue)', wordBreak: 'break-all' }}>{m.email}</a>
                  </div>
                  <span className="mono" style={{ fontSize: 12, color: 'rgba(20,22,26,.5)' }}>{quando(m.created_at)}</span>
                </div>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.messaggio}</p>
                <div className="card__actions" style={{ marginTop: 4 }}>
                  <a className="mini" href={rispondi(m)}>Rispondi</a>
                  <button
                    className="icon-btn icon-btn--danger"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => setDaTogliere({ tipo: 'messaggio', m })}
                    title="Elimina il messaggio"
                    aria-label="Elimina il messaggio"
                  >
                    {Icone.cestino}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {posta && scheda === 'Newsletter' && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button className="btn btn--outline btn--sm" onClick={copiaIndirizzi} disabled={!iscritti.length}>Copia tutti gli indirizzi</button>
              <button className="btn btn--outline btn--sm" onClick={() => esportaIscritti(iscritti)} disabled={!iscritti.length}>Scarica CSV</button>
            </div>
            {iscritti.length === 0 ? (
              <div className="empty" style={{ marginTop: 16, padding: '44px 20px' }}>
                <strong>Nessun iscritto</strong>
                <p>Le iscrizioni arrivano dal modulo newsletter in fondo a ogni pagina del sito.</p>
              </div>
            ) : (
              <div className="panel" style={{ marginTop: 16 }}>
                {iscritti.map((i, n) => (
                  <div
                    key={i.email}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: n ? '1px solid var(--line-soft)' : 0 }}
                  >
                    <span className="mono" style={{ flex: '1 1 auto', minWidth: 0, fontSize: 14, wordBreak: 'break-all' }}>{i.email}</span>
                    <span className="mono" style={{ fontSize: 12, color: 'rgba(20,22,26,.5)', whiteSpace: 'nowrap' }}>{i.created_at.slice(0, 10)}</span>
                    <button
                      className="icon-btn icon-btn--danger"
                      onClick={() => setDaTogliere({ tipo: 'iscritto', i })}
                      title="Togli dalla newsletter"
                      aria-label={`Togli ${i.email} dalla newsletter`}
                    >
                      {Icone.cestino}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {daTogliere && (
        <Conferma
          titolo={daTogliere.tipo === 'messaggio' ? 'Eliminare il messaggio?' : "Togliere l'iscritto?"}
          etichetta={daTogliere.tipo === 'messaggio' ? 'Elimina' : 'Togli'}
          onAnnulla={() => setDaTogliere(null)}
          onConferma={togli}
        >
          {daTogliere.tipo === 'messaggio'
            ? `Il messaggio di ${daTogliere.m.nome} verrà eliminato definitivamente.`
            : `${daTogliere.i.email} non riceverà più la newsletter. Usalo quando qualcuno chiede di essere cancellato.`}
        </Conferma>
      )}
    </section>
  );
}
