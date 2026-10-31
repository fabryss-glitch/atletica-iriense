import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap" style={{ paddingTop: 'clamp(52px,8vw,80px)', paddingBottom: 40 }}>
        <div className="footer__grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo-iriense.png" alt="" style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover' }} />
              <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '.02em', textTransform: 'uppercase', lineHeight: 1.06 }}>
                Atletica
                <br />
                Iriense
              </span>
            </div>
            <div style={{ marginTop: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-.02em', fontSize: 22 }}>
              Corri. Salta. Lancia.
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 15, color: 'rgba(255,255,255,.6)', maxWidth: 300 }}>Cresciamo correndo, insieme.</p>
          </div>

          <div>
            <div className="k">Menu</div>
            <nav className="footer__menu" aria-label="Menu a piè di pagina">
              <Link href="/societa">Società</Link>
              <Link href="/corsi">Corsi</Link>
              <Link href="/risultati">Articoli</Link>
              <Link href="/gallery">Gallery</Link>
              <Link href="/contatti">Contatti</Link>
              <Link href="/regolamento">Regolamento del Campo</Link>
            </nav>
          </div>

          <div>
            <div className="k">Dove siamo</div>
            <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,.82)' }}>
              Campo Giovani
              <br />
              Via Luigi Barbieri 182
              <br />
              27058 Voghera (PV)
            </p>
            <div className="k" style={{ marginTop: 22 }}>Link utili</div>
            <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.75 }}>
              <a href="https://www.fidal.it" target="_blank" rel="noopener noreferrer">FIDAL</a>
              {' · '}
              <a href="https://www.fidal.it/societa/ATL-IRIENSE-VOGHERA/PV245" target="_blank" rel="noopener noreferrer">I nostri atleti FIDAL</a>
              {' · '}
              <a href="https://www.coni.it" target="_blank" rel="noopener noreferrer">CONI</a>
            </p>
          </div>

          <div>
            <div className="k">Newsletter</div>
            <p style={{ margin: '14px 0 0', fontSize: 15, color: 'rgba(255,255,255,.7)' }}>Ricevi i risultati e le novità via email</p>
            <NewsletterForm />
            <div className="k" style={{ marginTop: 24 }}>Social</div>
            <p style={{ margin: '12px 0 0', fontSize: 15 }}>
              <a href="https://www.facebook.com/search/top?q=Atletica%20Iriense" target="_blank" rel="noopener noreferrer">Facebook</a>
              {' · '}
              <a href="https://x.com/AtleticaIriense" target="_blank" rel="noopener noreferrer">X</a>
            </p>
          </div>
        </div>

        <div className="footer__legal">
          <span>© Atletica Iriense Voghera · Via Barbieri 182</span>
          <Link href="/privacy" className="footer__link" style={{ color: 'rgba(255,255,255,.45)' }}>Privacy &amp; Cookie</Link>
        </div>
      </div>
    </footer>
  );
}
