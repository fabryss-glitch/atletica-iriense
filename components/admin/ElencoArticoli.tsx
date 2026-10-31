'use client';

import { useMemo, useState } from 'react';
import { CATEGORIE, annoDi } from '@/lib/supabase';
import type { VoceElenco } from '@/lib/admin';
import { Icone, Selettore } from './ui';

type Props = {
  articoli: VoceElenco[];
  email: string;
  onNuovo: () => void;
  onModifica: (a: VoceElenco) => void;
  onAnteprima: (a: VoceElenco) => void;
  onElimina: (a: VoceElenco) => void;
  onCambiaStato: (a: VoceElenco) => void;
  onImport: () => void;
  onExport: () => void;
  onEsci: () => void;
  esportando: boolean;
};

const PASSO = 24;

export default function ElencoArticoli(p: Props) {
  const [cerca, setCerca] = useState('');
  const [cat, setCat] = useState('Tutte le categorie');
  const [stato, setStato] = useState('Tutti gli stati');
  const [recenti, setRecenti] = useState(true);
  const [mostrati, setMostrati] = useState(PASSO);

  const pubblicati = p.articoli.filter((a) => a.published).length;

  const filtrati = useMemo(() => {
    const q = cerca.trim().toLowerCase();
    return p.articoli
      .filter((a) => cat === 'Tutte le categorie' || a.category === cat)
      .filter((a) => stato === 'Tutti gli stati' || (stato === 'Pubblicati' ? a.published : !a.published))
      .filter((a) => !q || `${a.title} ${a.excerpt ?? ''} ${a.slug}`.toLowerCase().includes(q))
      .sort((a, b) => ((a.date_iso ?? '') < (b.date_iso ?? '') ? 1 : -1) * (recenti ? 1 : -1));
  }, [p.articoli, cerca, cat, stato, recenti]);

  return (
    <section className="adm-section">
      <div className="wrap">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18 }}>
          <div>
            <div className="adm-kicker">Collection · Articoli</div>
            <h1 className="adm-title">Gestione articoli</h1>
            <p className="adm-sub">
              {p.articoli.length} articoli · {pubblicati} pubblicati · accesso come {p.email}{' '}
              <button onClick={p.onEsci} style={{ textDecoration: 'underline', color: 'var(--blue)', fontSize: 15 }}>Esci</button>
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button className="btn btn--outline btn--sm" onClick={p.onImport}>Import JSON</button>
            <button className="btn btn--outline btn--sm" onClick={p.onExport} disabled={p.esportando}>{p.esportando ? 'Preparo il file…' : 'Esporta JSON'}</button>
            <button className="btn btn--dark btn--sm" onClick={p.onNuovo}>+ Nuovo articolo</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 26 }}>
          <input
            className="input"
            type="search"
            value={cerca}
            onChange={(e) => { setCerca(e.target.value); setMostrati(PASSO); }}
            placeholder="Cerca per titolo, estratto o slug…"
            aria-label="Cerca negli articoli"
            style={{ flex: '1 1 240px', fontSize: 15, padding: '13px 15px' }}
          />
          <Selettore etichetta="Categoria" value={cat} onChange={(v) => { setCat(v); setMostrati(PASSO); }} opzioni={['Tutte le categorie', ...CATEGORIE]} style={{ flex: '0 1 220px' }} />
          <Selettore etichetta="Stato" value={stato} onChange={(v) => { setStato(v); setMostrati(PASSO); }} opzioni={['Tutti gli stati', 'Pubblicati', 'Bozze']} style={{ flex: '0 1 180px' }} />
          <button className="btn btn--outline btn--sm" style={{ background: '#fff' }} onClick={() => setRecenti((v) => !v)}>
            {recenti ? 'Data ↓ recenti' : 'Data ↑ vecchi'}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 26 }}>
          <span className="label" style={{ letterSpacing: '.16em' }}>Anteprime — come si vedranno nel blog</span>
          <span className="mono" style={{ fontSize: 12, color: 'rgba(20,22,26,.5)' }}>
            {filtrati.length === p.articoli.length ? 'Tutti gli articoli' : filtrati.length === 1 ? '1 articolo con questi filtri' : `${filtrati.length} articoli con questi filtri`}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap: 24, marginTop: 16 }}>
          {filtrati.slice(0, mostrati).map((a) => (
            <article className="card" key={a.id}>
              <button className="card__media" onClick={() => p.onAnteprima(a)} aria-label={`Anteprima di ${a.title}`}>
                {a.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.images[0]} alt="" loading="lazy" />
                ) : (
                  <span className="post-card__archive" style={{ position: 'absolute', inset: 0, height: 'auto', borderRadius: 0, border: 0, textAlign: 'left' }}>
                    <span>Dall&apos;archivio</span>
                    <span>{annoDi(a)}</span>
                  </span>
                )}
                <span className={`card__badge${a.published ? '' : ' card__badge--draft'}`}>{a.published ? 'Pubblicato' : 'Bozza'}</span>
              </button>
              <div className="card__body">
                <div className="post-card__meta" style={{ marginTop: 0 }}>
                  {a.category}
                  <span>{a.date_label || a.date_iso}</span>
                </div>
                <h3 style={{ margin: '10px 0 0', fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.16, fontSize: 21 }}>{a.title}</h3>
                <p style={{ margin: '9px 0 0', fontSize: 15, lineHeight: 1.55, color: 'rgba(20,22,26,.65)', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {a.excerpt}
                </p>
                <div className="mono" style={{ fontSize: 11, color: 'rgba(20,22,26,.45)', marginTop: 14, wordBreak: 'break-all' }}>/risultati/{a.slug}</div>
                <div className="card__actions">
                  <button className="mini" onClick={() => p.onModifica(a)}>Modifica</button>
                  <button className="mini" onClick={() => p.onCambiaStato(a)}>{a.published ? 'Metti in bozza' : 'Pubblica'}</button>
                  <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={() => p.onAnteprima(a)} title="Vedi la pagina" aria-label="Vedi la pagina">{Icone.occhio}</button>
                  <button className="icon-btn icon-btn--danger" onClick={() => p.onElimina(a)} title="Elimina l'articolo" aria-label="Elimina l'articolo">{Icone.cestino}</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtrati.length > mostrati && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 34 }}>
            <button className="btn btn--outline btn--sm" onClick={() => setMostrati((n) => n + PASSO)}>Mostra altri articoli</button>
          </div>
        )}

        {filtrati.length === 0 && (
          <div className="empty" style={{ marginTop: 16, padding: '44px 20px', fontSize: 15, color: 'rgba(20,22,26,.6)' }}>
            {p.articoli.length === 0 ? (
              <>
                <strong style={{ color: 'var(--ink)' }}>La collection è vuota</strong>
                <p>Usa &quot;Import JSON&quot; per caricare i 632 articoli dell&apos;archivio, oppure crea il primo articolo.</p>
              </>
            ) : (
              'Nessun articolo con questi filtri.'
            )}
          </div>
        )}
      </div>
    </section>
  );
}
