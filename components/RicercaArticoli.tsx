'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { CATEGORIE } from '@/lib/supabase';
import { urlRisultati } from '@/lib/url';

/** Campo di ricerca (mentre scrivi) e filtri per categoria. */
export default function RicercaArticoli({ cat, q, totale }: { cat: string; q: string; totale: number }) {
  const router = useRouter();
  const [testo, setTesto] = useState(q);
  const [inCorso, avvia] = useTransition();
  const primoGiro = useRef(true);

  useEffect(() => {
    if (primoGiro.current) {
      primoGiro.current = false;
      return;
    }
    const t = setTimeout(() => {
      avvia(() => router.replace(urlRisultati(cat, testo.trim()), { scroll: false }));
    }, 320);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testo]);

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 30 }}>
        <label className="sr-only" htmlFor="cerca">Cerca negli articoli</label>
        <input
          id="cerca"
          className="input"
          type="search"
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
          placeholder="Cerca un atleta, una gara, una città…"
          style={{ flex: '1 1 300px', fontSize: 15 }}
        />
        <span className="mono" style={{ fontSize: 12, color: 'rgba(20,22,26,.5)', opacity: inCorso ? 0.5 : 1 }} aria-live="polite">
          {totale === 1 ? '1 articolo' : `${totale} articoli`}
        </span>
      </div>
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }} aria-label="Categorie">
        {['Tutti', ...CATEGORIE].map((c) => (
          <Link key={c} href={urlRisultati(c, testo.trim())} className={`chip${c === cat ? ' chip--on' : ''}`} scroll={false} aria-current={c === cat ? 'true' : undefined}>
            {c}
          </Link>
        ))}
      </nav>
    </>
  );
}
