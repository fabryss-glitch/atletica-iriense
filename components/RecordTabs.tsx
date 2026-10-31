'use client';

import { useEffect, useRef, useState } from 'react';
import { PagerBottoni } from '@/components/Pager';

export type Titolo = { name: string; event: string; cat: string; mark: string; badge: string };
export type CategoriaPrimati = {
  cat: string;
  voci: Array<{ spec: string; perf: string; atleta: string; nascita?: string; anno?: string }>;
};

const bella = (c: string) => c.charAt(0) + c.slice(1).toLowerCase();
/** "ROSSI MARIO" → "Rossi Mario" */
const nomeLeggibile = (s: string) => s.replace(/\b([A-ZÀ-Ú])([A-ZÀ-Ú']+)/g, (_m, a: string, b: string) => a + b.toLowerCase());

const PER_PAGINA = 10;

export default function RecordTabs({ titoli, primati }: { titoli: Titolo[]; primati: CategoriaPrimati[] }) {
  const [scheda, setScheda] = useState<'titoli' | 'record'>('titoli');
  const [cat, setCat] = useState(primati[0]?.cat ?? '');
  const [menu, setMenu] = useState(false);
  const [pagina, setPagina] = useState(1);
  const menuRef = useRef<HTMLSpanElement>(null);
  const totPrimati = primati.reduce((n, p) => n + p.voci.length, 0);

  // chiude il menu categorie cliccando fuori o con Esc
  useEffect(() => {
    if (!menu) return;
    const fuori = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('mousedown', fuori);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fuori);
      document.removeEventListener('keydown', esc);
    };
  }, [menu]);

  const voci = primati.find((p) => p.cat === cat)?.voci ?? [];
  const pagine = Math.max(1, Math.ceil(voci.length / PER_PAGINA));
  const p = Math.min(pagina, pagine);
  const righe = voci.slice((p - 1) * PER_PAGINA, p * PER_PAGINA);

  const vai = (n: number) => {
    setPagina(Math.min(Math.max(1, n), pagine));
    document.getElementById('record')?.scrollIntoView({ block: 'start' });
  };

  return (
    <>
      <div className="tabs" role="tablist">
        <button className="tab" role="tab" aria-selected={scheda === 'titoli'} onClick={() => setScheda('titoli')}>
          Titoli e medaglie<span className="mono">{titoli.length}</span>
        </button>
        {primati.length > 0 && (
          <button className="tab" role="tab" aria-selected={scheda === 'record'} onClick={() => setScheda('record')}>
            Record sociali<span className="mono">{totPrimati}</span>
          </button>
        )}
      </div>

      {scheda === 'titoli' && (
        <div style={{ marginTop: 30 }} role="tabpanel">
          <div className="thead">
            <span style={{ flex: '1 1 220px', minWidth: 0 }}>Atleta e specialità</span>
            <span style={{ flex: '0 0 130px' }}>Misura / tempo</span>
            <span style={{ flex: '0 0 clamp(150px,22vw,230px)' }}>Titolo</span>
          </div>
          {titoli.map((r) => (
            <div className="trow" key={r.name + r.event}>
              <span style={{ flex: '1 1 220px', minWidth: 0 }}>
                <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800, letterSpacing: '-.02em', textTransform: 'uppercase', fontSize: 'clamp(20px,2.2vw,28px)', lineHeight: 1 }}>{r.name}</span>
                  <span className="badge-cat">{r.cat}</span>
                </span>
                <span style={{ display: 'block', fontSize: 15, color: 'rgba(20,22,26,.62)', marginTop: 5 }}>{r.event}</span>
              </span>
              <span className="mono" style={{ flex: '0 0 130px', fontWeight: 700, fontSize: 21 }}>{r.mark}</span>
              <span style={{ flex: '0 0 clamp(150px,22vw,230px)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--blue)' }}>{r.badge}</span>
            </div>
          ))}
        </div>
      )}

      {scheda === 'record' && (
        <div style={{ marginTop: 30 }} role="tabpanel">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
            <div className="field" style={{ flex: '1 1 min(100%,320px)' }}>
              <span id="cat-label">Categoria</span>
              <span ref={menuRef} style={{ position: 'relative', display: 'block' }}>
                <button
                  className="input"
                  aria-haspopup="listbox"
                  aria-expanded={menu}
                  aria-labelledby="cat-label"
                  onClick={() => setMenu((v) => !v)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 15, fontWeight: 600, textAlign: 'left', padding: '13px 15px' }}
                >
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bella(cat)}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', opacity: 0.55, transform: `rotate(${menu ? 180 : 0}deg)` }} aria-hidden="true">
                    <path d="M5 9l7 7 7-7" />
                  </svg>
                </button>
                {menu && (
                  <span className="dropdown" role="listbox">
                    {primati.map((o) => (
                      <button
                        key={o.cat}
                        role="option"
                        aria-selected={o.cat === cat}
                        onClick={() => {
                          setCat(o.cat);
                          setPagina(1);
                          setMenu(false);
                        }}
                      >
                        <span>{bella(o.cat)}</span>
                        <span className="mono" style={{ fontSize: 12, opacity: 0.55 }}>{o.voci.length}</span>
                      </button>
                    ))}
                  </span>
                )}
              </span>
            </div>
            <span className="mono" style={{ fontSize: 12, color: 'rgba(20,22,26,.5)', paddingBottom: 14 }}>
              {voci.length === 1 ? '1 primato' : `${voci.length} primati`}
            </span>
          </div>

          <div style={{ marginTop: 26 }}>
            <div className="thead" style={{ flexWrap: 'nowrap' }}>
              <span style={{ flex: '0 0 clamp(96px,14vw,150px)' }}>Specialità</span>
              <span style={{ flex: '0 0 clamp(84px,12vw,120px)' }}>Prestazione</span>
              <span style={{ flex: '1 1 160px', minWidth: 0 }}>Atleta</span>
              <span style={{ flex: '0 0 62px', textAlign: 'right' }}>Anno</span>
            </div>
            {righe.map((r, i) => (
              <div className="trow" key={`${r.spec}-${i}`} style={{ padding: '16px 4px' }}>
                <span style={{ flex: '0 0 clamp(96px,14vw,150px)', fontWeight: 700, fontSize: 16 }}>{r.spec}</span>
                <span className="mono" style={{ flex: '0 0 clamp(84px,12vw,120px)', fontWeight: 700, fontSize: 16, color: 'var(--blue)' }}>{r.perf}</span>
                <span style={{ flex: '1 1 160px', minWidth: 0, fontSize: 16, color: 'rgba(20,22,26,.78)' }}>{nomeLeggibile(r.atleta)}</span>
                <span className="mono" style={{ flex: '0 0 62px', textAlign: 'right', fontSize: 13, color: 'rgba(20,22,26,.55)' }}>{r.anno || '—'}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 30 }}>
            <PagerBottoni pagina={p} pagine={pagine} onGo={vai} />
          </div>
        </div>
      )}
    </>
  );
}
