import Link from 'next/link';

/** Numeri da mostrare: prime due, attorno alla corrente, ultime due; i buchi diventano "…". */
export function numeriPagina(corrente: number, totale: number): Array<number | '…'> {
  const set = new Set<number>();
  [1, 2, corrente - 1, corrente, corrente + 1, totale - 1, totale].forEach((n) => {
    if (n >= 1 && n <= totale) set.add(n);
  });
  const ordinati = [...set].sort((a, b) => a - b);
  const out: Array<number | '…'> = [];
  ordinati.forEach((n, i) => {
    if (i > 0 && n - ordinati[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

function Freccia({ verso }: { verso: 'sx' | 'dx' }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={verso === 'sx' ? 'M14.5 5 8 12l6.5 7' : 'M9.5 5 16 12l-6.5 7'} />
    </svg>
  );
}

type Props = { pagina: number; pagine: number; href: (n: number) => string; etichetta?: string };

/** Impaginazione con link veri (indicizzabili e condivisibili). */
export default function Pager({ pagina, pagine, href, etichetta }: Props) {
  if (pagine <= 1) return null;
  return (
    <div>
      <nav className="pager" aria-label="Pagine">
        <Link className="pager__btn" href={href(pagina - 1)} aria-disabled={pagina <= 1} tabIndex={pagina <= 1 ? -1 : undefined} scroll={false}>
          <Freccia verso="sx" /> Precedente
        </Link>
        {numeriPagina(pagina, pagine).map((n, i) =>
          n === '…' ? (
            <span key={`gap-${i}`} className="pager__gap">…</span>
          ) : (
            <Link key={n} className="pager__num" href={href(n)} aria-current={n === pagina ? 'page' : undefined} scroll={false}>
              {n}
            </Link>
          ),
        )}
        <Link className="pager__btn" href={href(pagina + 1)} aria-disabled={pagina >= pagine} tabIndex={pagina >= pagine ? -1 : undefined} scroll={false}>
          Successiva <Freccia verso="dx" />
        </Link>
      </nav>
      <div className="pager__label">{etichetta ?? `Pagina ${pagina} di ${pagine}`}</div>
    </div>
  );
}

/** Stessa grafica, per le liste gestite nel browser (primati, gallery admin). */
export function PagerBottoni({ pagina, pagine, onGo, etichetta }: { pagina: number; pagine: number; onGo: (n: number) => void; etichetta?: string }) {
  if (pagine <= 1) return null;
  return (
    <div>
      <nav className="pager" aria-label="Pagine">
        <button className="pager__btn" onClick={() => onGo(pagina - 1)} aria-disabled={pagina <= 1} disabled={pagina <= 1}>
          <Freccia verso="sx" /> Precedente
        </button>
        {numeriPagina(pagina, pagine).map((n, i) =>
          n === '…' ? (
            <span key={`gap-${i}`} className="pager__gap">…</span>
          ) : (
            <button key={n} className="pager__num" onClick={() => onGo(n)} aria-current={n === pagina ? 'page' : undefined}>
              {n}
            </button>
          ),
        )}
        <button className="pager__btn" onClick={() => onGo(pagina + 1)} aria-disabled={pagina >= pagine} disabled={pagina >= pagine}>
          Successiva <Freccia verso="dx" />
        </button>
      </nav>
      <div className="pager__label">{etichetta ?? `Pagina ${pagina} di ${pagine}`}</div>
    </div>
  );
}
