'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIE, type Foto } from '@/lib/supabase';

const PASSO = 24;

function Icona({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function GalleryGrid({ foto }: { foto: Foto[] }) {
  const [filtro, setFiltro] = useState('Tutte');
  const [mostrate, setMostrate] = useState(PASSO);
  const [aperta, setAperta] = useState<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const categorie = useMemo(() => ['Tutte', ...CATEGORIE.filter((c) => foto.some((f) => f.cat === c))], [foto]);
  const scatti = useMemo(() => (filtro === 'Tutte' ? foto : foto.filter((f) => f.cat === filtro)), [foto, filtro]);
  const visibili = scatti.slice(0, mostrate);

  const sposta = useCallback(
    (passo: number) => setAperta((i) => (i === null ? i : (i + passo + scatti.length) % scatti.length)),
    [scatti.length],
  );

  // tastiera: frecce per scorrere, Esc per chiudere; niente scroll della pagina sotto
  useEffect(() => {
    if (aperta === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAperta(null);
      else if (e.key === 'ArrowRight') sposta(1);
      else if (e.key === 'ArrowLeft') sposta(-1);
    };
    const prima = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prima;
      window.removeEventListener('keydown', onKey);
    };
  }, [aperta, sposta]);

  // la miniatura attiva resta visibile
  useEffect(() => {
    if (aperta === null) return;
    thumbsRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [aperta]);

  const corrente = aperta !== null ? scatti[aperta] : null;

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 30 }} role="group" aria-label="Filtra per categoria">
        {categorie.map((c) => (
          <button
            key={c}
            className={`chip${c === filtro ? ' chip--on' : ''}`}
            aria-pressed={c === filtro}
            onClick={() => {
              setFiltro(c);
              setMostrate(PASSO);
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="gallery-grid" style={{ marginTop: 'clamp(24px,3vw,34px)' }}>
        {visibili.map((f, i) => (
          <figure key={f.src} style={{ gridRow: `span ${i % 6 === 0 ? 3 : 2}` }}>
            <button onClick={() => setAperta(i)} aria-label={`Apri la foto: ${f.title || 'senza titolo'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.src} alt="" loading="lazy" />
            </button>
            <figcaption>
              <b>{f.title}</b>
              <span>{f.year}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {visibili.length === 0 && (
        <div className="empty" style={{ marginTop: 20 }}>
          <strong>Nessuna foto in questa categoria</strong>
        </div>
      )}

      {scatti.length > mostrate && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <button className="btn btn--outline btn--sm" onClick={() => setMostrate((n) => n + PASSO)}>
            Mostra altre foto
          </button>
        </div>
      )}

      {corrente && aperta !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Galleria a schermo intero">
          <div className="lightbox__top">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, minWidth: 0 }}>
              <span className="eyebrow eyebrow--light">{corrente.cat}</span>
              <span className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>
                {aperta + 1} / {scatti.length}
              </span>
            </div>
            <button className="round-btn round-btn--sm" onClick={() => setAperta(null)} aria-label="Chiudi" autoFocus>
              <Icona d="M6 6l12 12M18 6L6 18" size={17} />
            </button>
          </div>

          <div className="lightbox__stage">
            <button className="round-btn" onClick={() => sposta(-1)} aria-label="Foto precedente">
              <Icona d="M14.5 5 8 12l6.5 7" />
            </button>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={corrente.src} alt={corrente.title} />
            </div>
            <button className="round-btn" onClick={() => sposta(1)} aria-label="Foto successiva">
              <Icona d="M9.5 5 16 12l-6.5 7" />
            </button>
          </div>

          <div className="lightbox__foot">
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.35, maxWidth: '70ch' }}>
              {corrente.slug ? (
                <Link href={`/risultati/${corrente.slug}`} style={{ color: 'inherit' }}>
                  {corrente.title} →
                </Link>
              ) : (
                corrente.title
              )}
            </div>
            <div className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{corrente.year}</div>
            <div className="thumbs" ref={thumbsRef}>
              {scatti.map((s, i) => (
                <button key={s.src} onClick={() => setAperta(i)} aria-current={i === aperta ? 'true' : undefined} aria-label={`Foto ${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
