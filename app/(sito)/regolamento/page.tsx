import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regolamento del Campo',
  description: 'Accesso, orari e norme di utilizzo della pista del Campo Giovani di Voghera.',
};

const PDF = 'https://iriense.wordpress.com/wp-content/uploads/2025/12/025-regolamento-.pdf';

export default function RegolamentoPage() {
  return (
    <main>
      <section style={{ padding: 'clamp(56px,8vw,90px) 0 clamp(60px,9vw,100px)' }}>
        <div className="wrap split">
          <div className="split__side" style={{ flexBasis: 200 }}>
            <div className="eyebrow">Servizio</div>
          </div>
          <div className="split__main" style={{ flexBasis: 'min(100%,760px)' }}>
            <h1 style={{ margin: 0, fontWeight: 800, letterSpacing: '-.035em', lineHeight: 0.9, textTransform: 'uppercase', fontSize: 'clamp(36px,6vw,84px)' }}>
              Regolamento del Campo
            </h1>
            <p style={{ margin: '24px 0 0', fontSize: 18, lineHeight: 1.7, color: 'var(--muted)' }}>
              Il Campo Giovani di Via Luigi Barbieri 182 è la casa della società: accesso, orari e norme di utilizzo della pista sono regolati
              dal documento pubblicato dalla società.
            </p>
            <div className="table-card" style={{ marginTop: 28 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px clamp(20px,3vw,28px)', borderBottom: '1px solid var(--line-soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <span style={{ width: 42, height: 42, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, background: 'rgba(63,124,196,.12)', color: 'var(--blue)' }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5Z" />
                      <path d="M14 3v4.5h4.5" />
                    </svg>
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 17 }}>Regolamento di utilizzo del campo</span>
                    <span className="mono" style={{ display: 'block', fontSize: 12, color: 'rgba(20,22,26,.55)', marginTop: 3 }}>Documento in PDF</span>
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <a href={PDF} target="_blank" rel="noopener noreferrer" className="btn btn--dark btn--sm">Apri il PDF</a>
                  <a href={PDF} download className="btn btn--outline btn--sm">Scarica</a>
                </div>
              </div>
              <div style={{ padding: 'clamp(18px,3vw,24px) clamp(20px,3vw,28px)', fontSize: 16, lineHeight: 1.7, color: 'rgba(20,22,26,.7)' }}>
                Il documento integrale è disponibile in PDF, pubblicato dalla società.
              </div>
            </div>
            <p style={{ margin: '16px 0 0', fontSize: 14, color: 'rgba(20,22,26,.55)' }}>
              Per chiarimenti sull&apos;accesso alla pista scrivi a <a href="mailto:atleticairiense@gmail.com">atleticairiense@gmail.com</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
