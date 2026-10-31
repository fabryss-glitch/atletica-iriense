'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  const [inCorso, setInCorso] = useState(false);

  async function entra(e: React.FormEvent) {
    e.preventDefault();
    setErrore('');
    if (!/.+@.+\..+/.test(email.trim())) {
      setErrore('Inserisci un indirizzo email valido.');
      return;
    }
    setInCorso(true);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim(), password });
    setInCorso(false);
    if (error) setErrore(error.message.includes('Invalid') ? 'Email o password non corretti.' : `Accesso non riuscito: ${error.message}`);
  }

  return (
    <section className="adm-section" style={{ paddingTop: 'clamp(50px,8vw,90px)' }}>
      <div style={{ maxWidth: 460, margin: '0 auto', padding: '0 var(--gutter)' }}>
        <form className="panel" onSubmit={entra} style={{ borderRadius: 8, padding: 'clamp(26px,5vw,38px)' }}>
          <div className="adm-kicker">Area riservata</div>
          <h1 className="adm-title" style={{ fontSize: 32, lineHeight: 1, marginTop: 14 }}>Accedi al pannello</h1>
          <p style={{ margin: '14px 0 0', fontSize: 15, color: 'rgba(20,22,26,.65)' }}>
            Accesso riservato alla segreteria della società per pubblicare articoli e foto.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
            <label className="field">
              <span>Email</span>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="segreteria@atleticairiense.it" autoComplete="username" required />
            </label>
            <label className="field">
              <span>Password</span>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
            </label>
            <button type="submit" className="btn btn--dark" disabled={inCorso}>{inCorso ? 'Accesso…' : 'Entra'}</button>
            {errore && <div role="alert" style={{ fontSize: 14, color: 'var(--red)' }}>{errore}</div>}
          </div>
        </form>
      </div>
    </section>
  );
}
