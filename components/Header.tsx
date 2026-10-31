'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const VOCI = [
  { href: '/societa', label: 'Società' },
  { href: '/corsi', label: 'Corsi' },
  { href: '/risultati', label: 'Articoli' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contatti', label: 'Contatti' },
];

function IconaAccount({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8.4" r="3.6" />
      <path d="M4.8 20c0-3.7 3.3-6.1 7.2-6.1s7.2 2.4 7.2 6.1" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname() || '/';
  const [aperto, setAperto] = useState(false);

  // Il menu mobile si chiude a ogni cambio di pagina.
  useEffect(() => setAperto(false), [pathname]);

  const attiva = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="header">
      <div className="wrap header__bar">
        <Link href="/" className="brand" aria-label="Atletica Iriense, home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-iriense.png" alt="" />
          <span className="brand__name">
            <b>Atletica Iriense</b>
            <small>Voghera · dal 1955</small>
          </span>
        </Link>

        <nav className="nav" aria-label="Menu principale">
          {VOCI.map((v) => (
            <Link key={v.href} href={v.href} className="nav__link" aria-current={attiva(v.href) ? 'page' : undefined}>
              {v.label}
            </Link>
          ))}
          <Link href="/corsi" className="nav__cta">Iscriviti</Link>
          <Link href="/admin" className="account" aria-label="Area riservata">
            <IconaAccount />
            <span className="account__tip">Area riservata</span>
          </Link>
        </nav>

        <button
          className="burger"
          aria-label={aperto ? 'Chiudi il menu' : 'Apri il menu'}
          aria-expanded={aperto}
          aria-controls="menu-mobile"
          onClick={() => setAperto((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      <nav id="menu-mobile" className="mobile-nav" data-open={aperto} aria-label="Menu">
        {VOCI.map((v) => (
          <Link key={v.href} href={v.href} className="mobile-nav__link" aria-current={attiva(v.href) ? 'page' : undefined}>
            {v.label}
          </Link>
        ))}
        <Link href="/corsi" className="nav__cta">Iscriviti</Link>
        <Link href="/admin" className="mobile-nav__account">
          <IconaAccount size={18} />
          Area riservata
        </Link>
      </nav>
    </header>
  );
}
