'use client';

import { useActionState } from 'react';
import { iscriviNewsletter, type EsitoModulo } from '@/app/azioni';

export default function NewsletterForm() {
  const [esito, azione, inCorso] = useActionState<EsitoModulo, FormData>(iscriviNewsletter, null);

  return (
    <form action={azione}>
      <div className="newsletter">
        <label className="sr-only" htmlFor="nl-email">La tua email</label>
        <input id="nl-email" name="email" type="email" placeholder="La tua email" autoComplete="email" required />
        {/* campo trappola anti-spam, invisibile alle persone */}
        <input name="sito" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
        <button type="submit" disabled={inCorso}>{inCorso ? '…' : 'Iscriviti'}</button>
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,.5)' }}>
        Iscrivendoti accetti l&apos;<a href="/privacy">informativa privacy</a>. Puoi cancellarti quando vuoi.
      </p>
      {esito && (
        <p role="status" style={{ margin: '10px 0 0', fontSize: 14, color: esito.ok ? '#8FB6E4' : '#F2A79F' }}>
          {esito.messaggio}
        </p>
      )}
    </form>
  );
}
