'use client';

import { useState } from 'react';
import { importaArticoli, type EsitoImport } from '@/lib/admin';

const ESEMPIO = JSON.stringify(
  [
    {
      date_iso: '2026-07-15',
      category: 'Assoluti',
      title: 'Primati a Bologna',
      excerpt: 'Due primati personali nella trasferta emiliana.',
      body: ['Trasferta a Bologna per quattro atleti del settore assoluto.', 'Nel pomeriggio arrivano due primati personali sui 400 metri.'],
      images: ['https://iriense.wordpress.com/wp-content/uploads/2026/07/026-lug-3-folaghe-gruppo.jpg'],
      caption: 'La partenza della seconda serie.',
    },
  ],
  null,
  2,
);

export default function ImportView({ onIndietro, onFatto }: { onIndietro: () => void; onFatto: (esito: EsitoImport) => void }) {
  const [testo, setTesto] = useState('');
  const [nomeFile, setNomeFile] = useState('');
  const [errore, setErrore] = useState('');
  const [report, setReport] = useState('');
  const [avanz, setAvanz] = useState<{ fatte: number; totale: number } | null>(null);

  async function leggiFile(f?: File) {
    if (!f) return;
    setErrore('');
    setReport('');
    if (f.size > 30 * 1024 * 1024) {
      setErrore('File troppo grande (massimo 30 MB).');
      return;
    }
    setNomeFile(`${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} MB`);
    setTesto(await f.text());
  }

  async function importa() {
    setErrore('');
    setReport('');
    let dati: unknown;
    try {
      dati = JSON.parse(testo);
    } catch (e) {
      setErrore(`JSON non valido: ${e instanceof Error ? e.message : ''}`);
      return;
    }
    const righe = Array.isArray(dati) ? dati : (dati as { articoli?: unknown[] })?.articoli;
    if (!Array.isArray(righe)) {
      setErrore('Serve un array di articoli, oppure un oggetto { "articoli": [...] }.');
      return;
    }
    setAvanz({ fatte: 0, totale: righe.length });
    try {
      const esito = await importaArticoli(righe, (fatte, totale) => setAvanz({ fatte, totale }));
      setReport(
        `Import completato: ${esito.creati} nuovi, ${esito.aggiornati} aggiornati` +
          (esito.scartati ? `, ${esito.scartati} scartati (titolo mancante)` : '') +
          '.',
      );
      onFatto(esito);
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'Import non riuscito, riprova.');
    } finally {
      setAvanz(null);
    }
  }

  return (
    <section className="adm-section" style={{ paddingTop: 'clamp(30px,5vw,50px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 var(--gutter)' }}>
        <button onClick={onIndietro} className="label" style={{ letterSpacing: '.14em', fontSize: 12, color: 'rgba(20,22,26,.6)' }}>
          ← Torna all&apos;elenco
        </button>
        <h1 className="adm-title" style={{ fontSize: 'clamp(28px,4.4vw,50px)', lineHeight: 1, marginTop: 18 }}>Import massivo</h1>
        <p style={{ margin: '14px 0 0', fontSize: 17, lineHeight: 1.65, color: 'var(--muted)' }}>
          Scegli un file JSON o incollane il contenuto. I paragrafi del campo <b>body</b> vengono uniti in tag &lt;p&gt;, lo slug si genera
          dal titolo se manca e gli articoli già presenti con lo stesso slug vengono aggiornati invece che duplicati.
        </p>

        <label className="dropzone" style={{ marginTop: 22 }}>
          {nomeFile ? <strong>{nomeFile}</strong> : <strong>Scegli il file .json</strong>}
          <small>Per l&apos;archivio completo usa data/articoli.json del progetto (632 articoli)</small>
          <input type="file" accept="application/json,.json" hidden onChange={(e) => { leggiFile(e.target.files?.[0]); e.target.value = ''; }} />
        </label>

        <textarea
          className="input mono"
          rows={12}
          value={testo.length > 200000 ? `${testo.slice(0, 2000)}\n\n… (${(testo.length / 1024).toFixed(0)} KB caricati dal file, anteprima troncata)` : testo}
          readOnly={testo.length > 200000}
          onChange={(e) => {
            setTesto(e.target.value);
            setNomeFile('');
          }}
          placeholder={ESEMPIO}
          aria-label="Contenuto JSON da importare"
          style={{ marginTop: 16, fontSize: 13, lineHeight: 1.6, borderRadius: 6 }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          <button className="btn btn--dark btn--sm" onClick={importa} disabled={!testo || !!avanz}>
            {avanz ? 'Importo…' : 'Importa'}
          </button>
          <button className="btn btn--outline btn--sm" onClick={() => { setTesto(ESEMPIO); setNomeFile(''); }} disabled={!!avanz}>
            Carica esempio
          </button>
        </div>

        {avanz && (
          <div style={{ marginTop: 18 }}>
            <div className="mono" style={{ fontSize: 12, color: 'rgba(20,22,26,.6)' }}>
              {avanz.fatte} di {avanz.totale} articoli salvati
            </div>
            <div className="progress"><span style={{ width: `${avanz.totale ? (avanz.fatte / avanz.totale) * 100 : 0}%` }} /></div>
          </div>
        )}
        {report && <div className="notice notice--ok" style={{ marginTop: 20 }}>{report}</div>}
        {errore && <div className="notice notice--error" role="alert" style={{ marginTop: 20 }}>{errore}</div>}
      </div>
    </section>
  );
}
