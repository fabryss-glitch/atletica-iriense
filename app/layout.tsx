import type { Metadata, Viewport } from 'next';
// Font ospitati dal sito stesso (nessuna richiesta a Google Fonts).
import '@fontsource/onest/latin-300.css';
import '@fontsource/onest/latin-400.css';
import '@fontsource/onest/latin-500.css';
import '@fontsource/onest/latin-600.css';
import '@fontsource/onest/latin-700.css';
import '@fontsource/onest/latin-800.css';
import '@fontsource/space-mono/latin-400.css';
import '@fontsource/space-mono/latin-700.css';
import '@fontsource/anton/latin-400.css';
import './globals.css';

const sito = process.env.NEXT_PUBLIC_SITE_URL || 'https://atletica-iriense.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(sito),
  title: {
    default: 'Atletica Iriense Voghera · Corri, salta, lancia',
    template: '%s · Atletica Iriense Voghera',
  },
  description:
    'Società di atletica leggera a Voghera dal 1955. Corsi per bambini e ragazzi, settore assoluto e master al Campo Giovani.',
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: 'Atletica Iriense Voghera',
  },
};

export const viewport: Viewport = {
  themeColor: '#14161A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
