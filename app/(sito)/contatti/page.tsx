import type { Metadata } from 'next';
import ContattiForm from '@/components/ContattiForm';

export const metadata: Metadata = {
  title: 'Contatti',
  description: 'Atletica Iriense Voghera: Campo Giovani, Via Luigi Barbieri 182, 27058 Voghera (PV). Scrivici per iscrizioni, tesseramento e corsi.',
};

const MAPPA = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Campo Giovani, Via Luigi Barbieri 182, 27058 Voghera PV');

export default function ContattiPage() {
  return (
    <main>
      <section className="page-head" style={{ paddingBottom: 'clamp(24px,4vw,40px)' }}>
        <div className="wrap">
          <div className="eyebrow">Contatti</div>
          <h1 className="display" style={{ fontSize: 'clamp(44px,8.5vw,132px)' }}>
            Ti aspettiamo al
            <br />
            Campo Giovani
          </h1>
        </div>
      </section>

      <section className="dark" style={{ padding: 'clamp(40px,6vw,64px) 0', marginTop: 'clamp(18px,3vw,30px)' }}>
        <div className="wrap info-grid" style={{ marginTop: 0, gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))' }}>
          <div>
            <div className="k">Sede</div>
            <div className="v" style={{ lineHeight: 1.55 }}>
              Campo Giovani
              <br />
              Via Luigi Barbieri 182
              <br />
              27058 Voghera (PV)
            </div>
          </div>
          <div>
            <div className="k">Email</div>
            <div className="v" style={{ wordBreak: 'break-word' }}>
              <a href="mailto:atleticairiense@gmail.com" style={{ color: 'var(--blue-light)' }}>atleticairiense@gmail.com</a>
            </div>
          </div>
          <div>
            <div className="k">Social</div>
            <div className="v" style={{ lineHeight: 1.55 }}>
              <a href="https://www.facebook.com/search/top?q=Atletica%20Iriense" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue-light)' }}>Facebook</a>
              <br />
              <a href="https://x.com/AtleticaIriense" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue-light)' }}>@AtleticaIriense</a>
            </div>
          </div>
        </div>
      </section>

      <section id="scrivici" style={{ padding: 'clamp(40px,6vw,64px) 0 clamp(60px,9vw,100px)' }}>
        <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px,4vw,44px)', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 min(100%,520px)', minWidth: 0 }}>
            <h2 style={{ margin: 0, fontWeight: 800, letterSpacing: '-.03em', textTransform: 'uppercase', fontSize: 'clamp(28px,3.6vw,44px)', lineHeight: 1 }}>Scrivici</h2>
            <p style={{ margin: '16px 0 0', fontSize: 17, lineHeight: 1.65, color: 'var(--muted)' }}>
              Vuoi iscriverti, tesserarti con la FIDAL o avere informazioni sui corsi? Scrivici: ti risponderemo il prima possibile.
            </p>
            <ContattiForm />
          </div>

          <div style={{ flex: '1 1 min(100%,420px)', minWidth: 0 }}>
            <div className="dark" style={{ height: 'clamp(300px,44vw,480px)', borderRadius: 6, padding: 30, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', opacity: 0.5 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} style={{ borderLeft: '1px solid rgba(255,255,255,.08)' }} />
                ))}
              </div>
              <div className="k" style={{ position: 'relative', color: 'rgba(255,255,255,.6)', fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase' }}>Come arrivare</div>
              <div style={{ position: 'relative' }}>
                <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-.02em', fontSize: 'clamp(24px,3vw,34px)', lineHeight: 1.05 }}>
                  Campo Giovani
                  <br />
                  Voghera
                </div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', marginTop: 12 }}>Via Luigi Barbieri 182 · ingresso dal parcheggio interno</div>
                <a href={MAPPA} target="_blank" rel="noopener noreferrer" className="btn btn--light btn--sm" style={{ marginTop: 22 }}>
                  Apri in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
