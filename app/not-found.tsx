import Link from 'next/link';
import Lanes from '@/components/Lanes';
import Video404 from '@/components/Video404';

export const metadata = { title: 'Pagina non trovata' };

export default function NotFound() {
  return (
    <div className="nf">
      <Lanes />
      <header className="wrap" style={{ position: 'relative', zIndex: 2, width: '100%', minHeight: 74, display: 'flex', alignItems: 'center' }}>
        <Link href="/" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-iriense.png" alt="" style={{ width: 40, height: 40 }} />
          <span className="brand__name">
            <b style={{ fontSize: 16 }}>Atletica Iriense</b>
            <small>Voghera · dal 1955</small>
          </span>
        </Link>
      </header>
      <main className="nf__main">
        <div className="nf__kicker">Sembra che tu abbia sbagliato corsia</div>
        <div className="nf__stage">
          <div className="nf__num" aria-hidden="true">404</div>
          <Video404 />
        </div>
        <Link href="/" className="nf__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="M11 6l-6 6 6 6" />
          </svg>
          Torna in pista
        </Link>
      </main>
    </div>
  );
}
