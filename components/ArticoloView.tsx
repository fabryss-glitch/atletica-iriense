import type { ReactNode } from 'react';
import { annoDi, type Articolo } from '@/lib/supabase';
import { aperturaUtile } from '@/lib/testo';

type Props = {
  a: Articolo;
  /** Link o bottone "← Tutti i risultati" sopra il titolo. */
  indietro: ReactNode;
  /** Indirizzo completo dell'articolo, per i pulsanti di condivisione. */
  urlCondivisione?: string;
};

/**
 * Pagina articolo: copertina a tutta larghezza, colonna laterale e corpo.
 * La usa sia il sito pubblico sia l'anteprima dell'area riservata.
 */
export default function ArticoloView({ a, indietro, urlCondivisione }: Props) {
  const immagini = a.images ?? [];
  const cover = immagini[0];
  const seconda = immagini[1];
  const altre = immagini.slice(2);
  const apertura = aperturaUtile(a);

  return (
    <>
      <section className="art-hero">
        <div className="art-hero__inner">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={a.caption || ''} />
          ) : (
            <div className="art-hero__fallback" aria-hidden="true">
              <span>{annoDi(a)}</span>
            </div>
          )}
          <div className="art-hero__shade" />
          <div className="wrap art-hero__content">
            {indietro}
            <div className="art-hero__meta">
              <span>{a.category}</span>
              <span>{a.date_label}</span>
            </div>
            <h1>{a.title}</h1>
          </div>
        </div>
      </section>

      <section className="art-body">
        <div className="wrap split" style={{ gap: 'clamp(28px,5vw,70px)' }}>
          <aside>
            <div className="label">Scritto da</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginTop: 8 }}>Atletica Iriense</div>
            {urlCondivisione && (
              <>
                <div style={{ height: 1, background: 'var(--line)', margin: '24px 0' }} />
                <div className="label">Condividi</div>
                <div className="share">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlCondivisione)}`} target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`${a.title} ${urlCondivisione}`)}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                  <a href={`https://x.com/intent/post?url=${encodeURIComponent(urlCondivisione)}&text=${encodeURIComponent(a.title)}`} target="_blank" rel="noopener noreferrer">
                    X
                  </a>
                </div>
              </>
            )}
          </aside>

          <article>
            {apertura && <p className="art-lead">{apertura}</p>}
            {/* Il corpo è HTML scritto solo da utenti autenticati dell'area riservata. */}
            <div className="prose" dangerouslySetInnerHTML={{ __html: a.body ?? '' }} />

            {seconda && (
              <figure className="art-figure">
                <div className="photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={seconda} alt={a.caption2 || ''} loading="lazy" />
                </div>
                {(a.caption2 || a.caption) && <figcaption>{a.caption2 || a.caption}</figcaption>}
              </figure>
            )}

            {altre.length > 0 && (
              <div className="art-more">
                {altre.map((src) => (
                  <div className="photo" key={src}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </>
  );
}
