'use client';

import { useActionState, useEffect, useRef } from 'react';
import { inviaMessaggio, type EsitoModulo } from '@/app/azioni';

export default function ContattiForm() {
  const [esito, azione, inCorso] = useActionState<EsitoModulo, FormData>(inviaMessaggio, null);
  const formRef = useRef<HTMLFormElement>(null);

  // svuota il modulo dopo un invio riuscito
  useEffect(() => {
    if (esito?.ok) formRef.current?.reset();
  }, [esito]);

  return (
    <form ref={formRef} action={azione} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 26 }}>
      <label className="field">
        <span>Nome</span>
        <input className="input" name="nome" placeholder="Nome e cognome" autoComplete="name" required maxLength={120} />
      </label>
      <label className="field">
        <span>Email</span>
        <input className="input" name="email" type="email" placeholder="la.tua@email.it" autoComplete="email" required maxLength={200} />
      </label>
      <label className="field">
        <span>Messaggio</span>
        <textarea className="input" name="messaggio" rows={5} placeholder="Scrivi qui la tua richiesta" required maxLength={5000} />
      </label>
      <input name="sito" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(20,22,26,.55)' }}>
        Usiamo i tuoi dati solo per risponderti, come descritto nell&apos;<a href="/privacy">informativa privacy</a>.
      </p>
      <button type="submit" className="btn btn--dark" style={{ alignSelf: 'flex-start' }} disabled={inCorso}>
        {inCorso ? 'Invio…' : 'Invia'}
      </button>
      {esito && (
        <p role="status" className={`notice ${esito.ok ? 'notice--ok' : 'notice--error'}`} style={{ margin: 0 }}>
          {esito.messaggio}
        </p>
      )}
    </form>
  );
}
