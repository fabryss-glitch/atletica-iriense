'use client';

import { useEffect, useState, type ReactNode } from 'react';

export const Icone = {
  cestino: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 7h15" /><path d="M9.5 7V4.8h5V7" /><path d="M6.6 7l.9 12.2h9l.9-12.2" /><path d="M10.4 10.6v5.6M13.6 10.6v5.6" />
    </svg>
  ),
  occhio: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 12s3.6-6.2 9.5-6.2S21.5 12 21.5 12s-3.6 6.2-9.5 6.2S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.7" />
    </svg>
  ),
  piu: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  chiudi: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  carica: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3F7CC4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 15.5V5" /><path d="M7.5 9.5 12 5l4.5 4.5" /><path d="M4.5 15.5v3h15v-3" />
    </svg>
  ),
  spunta: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  ),
  casa: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 11.5 12 4.5l8 7" /><path d="M6.5 10.5V20h11v-9.5" />
    </svg>
  ),
  freccia: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14161A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9.5l6 6 6-6" />
    </svg>
  ),
};

export type Avviso = { testo: string; errore?: boolean; id: number } | null;

/** Avviso in basso a destra, con timer a torta e uscita in dissolvenza. */
export function Toast({ avviso, onChiudi }: { avviso: Avviso; onChiudi: () => void }) {
  const [uscita, setUscita] = useState(false);

  useEffect(() => {
    if (!avviso) return;
    setUscita(false);
    const t1 = setTimeout(() => setUscita(true), 4000);
    const t2 = setTimeout(onChiudi, 4380);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [avviso, onChiudi]);

  if (!avviso) return null;
  return (
    <div className="toast" role="status" data-uscita={uscita} key={avviso.id}>
      <span className={`toast__dot${avviso.errore ? ' toast__dot--error' : ''}`} />
      <span style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.4, flex: '1 1 auto' }}>{avviso.testo}</span>
      <button className="toast__close" onClick={() => setUscita(true)} aria-label="Chiudi l'avviso">
        <svg className="pie" width="26" height="26" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2" />
          <circle cx="10" cy="10" r="8" fill="none" stroke="#8FB6E4" strokeWidth="2" strokeDasharray="50.27" strokeLinecap="round" />
        </svg>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ position: 'relative' }} aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}

/** Finestra di conferma per le azioni che non si possono annullare. */
export function Conferma({
  titolo,
  children,
  etichetta,
  onAnnulla,
  onConferma,
}: {
  titolo: string;
  children: ReactNode;
  etichetta: string;
  onAnnulla: () => void;
  onConferma: () => void;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onAnnulla();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onAnnulla]);

  return (
    <div className="overlay" onClick={onAnnulla}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="conf-titolo" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="dialog__icon">{Icone.cestino}</span>
            <h3 id="conf-titolo">{titolo}</h3>
          </div>
          <p>{children}</p>
        </div>
        <div className="dialog__actions">
          <button className="btn btn--outline btn--sm" onClick={onAnnulla} autoFocus>Annulla</button>
          <button className="btn btn--danger btn--sm" onClick={onConferma}>{etichetta}</button>
        </div>
      </div>
    </div>
  );
}

/** Menu a tendina con la freccia del design. */
export function Selettore({
  value,
  onChange,
  opzioni,
  etichetta,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  opzioni: readonly string[];
  etichetta: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className="select-wrap" style={style}>
      <select className="input" aria-label={etichetta} value={value} onChange={(e) => onChange(e.target.value)} style={{ fontSize: 15, padding: '13px 15px' }}>
        {opzioni.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {Icone.freccia}
    </span>
  );
}
