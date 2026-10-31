import type { Metadata } from 'next';
import PostCard from '@/components/PostCard';
import Pager from '@/components/Pager';
import RicercaArticoli from '@/components/RicercaArticoli';
import { urlRisultati } from '@/lib/url';
import { cercaArticoli } from '@/lib/contenuti';
import { CATEGORIE } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Articoli e risultati',
  description: "Il racconto di tutte le trasferte dell'Atletica Iriense: pista, strada e cross, dal 2005 a oggi.",
};

type Props = { searchParams: Promise<{ cat?: string; q?: string; pagina?: string }> };

export default async function RisultatiPage({ searchParams }: Props) {
  const sp = await searchParams;
  const cat = CATEGORIE.includes(sp.cat as (typeof CATEGORIE)[number]) ? (sp.cat as string) : 'Tutti';
  const q = (sp.q ?? '').slice(0, 80);
  const richiesta = Number.parseInt(sp.pagina ?? '1', 10) || 1;

  let risultato;
  let errore = false;
  try {
    risultato = await cercaArticoli({ cat, q, pagina: richiesta, perPagina: 12 });
  } catch {
    errore = true;
    risultato = { articoli: [], totale: 0, pagina: 1, pagine: 1 };
  }

  return (
    <main>
      <section className="page-head">
        <div className="wrap">
          <div className="eyebrow">Articoli e risultati</div>
          <h1 className="display">
            I risultati,
            <br />
            gara dopo gara
          </h1>
          <p className="lead" style={{ maxWidth: 560 }}>
            Ogni fine settimana i nostri atleti scendono in pista, su strada e nei cross. Qui trovi il racconto di tutte le trasferte, in
            ordine cronologico.
          </p>
          <RicercaArticoli cat={cat} q={q} totale={risultato.totale} />
        </div>
      </section>

      <section id="elenco" style={{ padding: 'clamp(16px,3vw,30px) 0 clamp(60px,9vw,100px)' }}>
        <div className="wrap">
          {errore && <p className="notice notice--error">Non riesco a caricare gli articoli in questo momento. Riprova tra poco.</p>}

          {!errore && risultato.articoli.length === 0 ? (
            <div className="empty">
              <strong>Nessun articolo trovato</strong>
              <p>Prova un&apos;altra parola o cambia categoria.</p>
            </div>
          ) : (
            <div className="post-grid">
              {risultato.articoli.map((a) => (
                <PostCard key={a.slug} a={a} estratto titolo={23} />
              ))}
            </div>
          )}

          {risultato.pagine > 1 && (
            <div style={{ marginTop: 48, paddingTop: 30, borderTop: '1px solid rgba(20,22,26,.14)' }}>
              <Pager pagina={risultato.pagina} pagine={risultato.pagine} href={(n) => urlRisultati(cat, q, n) + '#elenco'} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
